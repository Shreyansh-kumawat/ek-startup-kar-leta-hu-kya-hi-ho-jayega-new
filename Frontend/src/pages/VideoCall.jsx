import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Peer-to-peer mesh: every participant connects directly to every other one.
// Supabase Realtime only carries the handshake (presence + broadcast); media never touches a server.
const MAX_PEOPLE = 4;
const RTC_CONFIG = {
  iceServers: [{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }],
};

const makeId = () => Math.random().toString(36).slice(2, 10);

const VideoTile = ({ stream, label, muted, mirrored, status }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream && ref.current.srcObject !== stream) ref.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="relative bg-gray-900 rounded-2xl overflow-hidden min-h-0">
      {stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={muted}
          className={`absolute inset-0 w-full h-full object-cover ${mirrored ? '-scale-x-100' : ''}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">{status || 'Connecting...'}</div>
      )}
      <div className="absolute left-3 bottom-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">{label}</div>
    </div>
  );
};

const ControlButton = ({ onClick, active = true, danger = false, children, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`h-12 px-5 rounded-full text-sm font-bold transition-colors ${
      danger ? 'bg-red-600 hover:bg-red-500 text-white' : active ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white text-gray-900'
    }`}
  >
    {children}
  </button>
);

const VideoCall = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const room = useMemo(() => (params.get('room') || 'lobby').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32) || 'lobby', [params]);

  const myId = useMemo(makeId, []);
  const myName = useMemo(() => `Guest ${Math.floor(1000 + Math.random() * 9000)}`, []);

  const [localStream, setLocalStream] = useState(null);
  const [remotes, setRemotes] = useState({}); // id -> { name, stream, state }
  const [status, setStatus] = useState('starting'); // starting | live | full | denied | error
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [copied, setCopied] = useState(false);

  const peers = useRef(new Map()); // id -> { pc, pendingIce: [] }
  const channelRef = useRef(null);
  const localRef = useRef(null);

  const updateRemote = useCallback((id, patch) => {
    setRemotes((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  }, []);

  const removePeer = useCallback((id) => {
    const p = peers.current.get(id);
    if (p) p.pc.close();
    peers.current.delete(id);
    setRemotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const send = useCallback(
    (to, data) => {
      channelRef.current?.send({ type: 'broadcast', event: 'signal', payload: { from: myId, to, ...data } });
    },
    [myId]
  );

  const getPeer = useCallback(
    (id) => {
      let p = peers.current.get(id);
      if (p) return p;
      const pc = new RTCPeerConnection(RTC_CONFIG);
      p = { pc, pendingIce: [] };
      peers.current.set(id, p);

      localRef.current?.getTracks().forEach((t) => pc.addTrack(t, localRef.current));
      pc.onicecandidate = (e) => e.candidate && send(id, { kind: 'ice', candidate: e.candidate.toJSON() });
      pc.ontrack = (e) => updateRemote(id, { stream: e.streams[0] });
      pc.onconnectionstatechange = () => updateRemote(id, { state: pc.connectionState });
      return p;
    },
    [send, updateRemote]
  );

  const flushIce = async (p) => {
    for (const c of p.pendingIce.splice(0)) await p.pc.addIceCandidate(c).catch(() => {});
  };

  const callPeer = useCallback(
    async (id) => {
      const p = getPeer(id);
      const offer = await p.pc.createOffer();
      await p.pc.setLocalDescription(offer);
      send(id, { kind: 'offer', sdp: p.pc.localDescription.toJSON(), name: myName });
    },
    [getPeer, send, myName]
  );

  const onSignal = useCallback(
    async ({ payload }) => {
      if (payload.to !== myId) return;
      const { from, kind } = payload;
      try {
        if (kind === 'offer') {
          const p = getPeer(from);
          updateRemote(from, { name: payload.name });
          await p.pc.setRemoteDescription(payload.sdp);
          await flushIce(p);
          const answer = await p.pc.createAnswer();
          await p.pc.setLocalDescription(answer);
          send(from, { kind: 'answer', sdp: p.pc.localDescription.toJSON(), name: myName });
        } else if (kind === 'answer') {
          const p = peers.current.get(from);
          if (!p) return;
          updateRemote(from, { name: payload.name });
          await p.pc.setRemoteDescription(payload.sdp);
          await flushIce(p);
        } else if (kind === 'ice') {
          const p = getPeer(from);
          if (p.pc.remoteDescription) await p.pc.addIceCandidate(payload.candidate).catch(() => {});
          else p.pendingIce.push(payload.candidate);
        }
      } catch (err) {
        console.error('signal error', err);
      }
    },
    [myId, getPeer, send, updateRemote, myName]
  );

  useEffect(() => {
    let cancelled = false;
    let joined = false;

    const start = async () => {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      } catch (err) {
        if (!cancelled) {
          const name = err?.name;
          setStatus(name === 'NotFoundError' ? 'nodevice' : name === 'NotReadableError' || name === 'AbortError' ? 'busy' : 'denied');
        }
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      localRef.current = stream;
      setLocalStream(stream);

      const channel = supabase.channel(`videocall:${room}`, {
        config: { broadcast: { self: false }, presence: { key: myId } },
      });
      channelRef.current = channel;

      channel
        .on('broadcast', { event: 'signal' }, onSignal)
        .on('presence', { event: 'sync' }, async () => {
          const ids = Object.keys(channel.presenceState()).filter((id) => id !== myId);

          if (!joined) {
            if (ids.length >= MAX_PEOPLE) {
              setStatus('full');
              return;
            }
            joined = true;
            await channel.track({ name: myName });
            setStatus('live');
          }

          // The lexicographically smaller id places the call, so two peers never offer at once.
          ids.forEach((id) => {
            if (!peers.current.has(id) && myId < id) callPeer(id);
            if (!peers.current.has(id) && myId > id) updateRemote(id, {});
          });
          [...peers.current.keys()].forEach((id) => !ids.includes(id) && removePeer(id));
          setRemotes((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => ids.includes(id))));
        })
        .subscribe((s) => {
          if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') setStatus('error');
        });
    };

    start();

    return () => {
      cancelled = true;
      peers.current.forEach((p) => p.pc.close());
      peers.current.clear();
      localRef.current?.getTracks().forEach((t) => t.stop());
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [room, myId, myName, onSignal, callPeer, removePeer, updateRemote]);

  const toggleMic = () => {
    localRef.current?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn(!micOn);
  };
  const toggleCam = () => {
    localRef.current?.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn(!camOn);
  };
  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const remoteList = Object.entries(remotes);
  const count = 1 + remoteList.length;
  const grid = count === 1 ? 'grid-cols-1' : count === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2';

  if (['denied', 'nodevice', 'busy', 'full', 'error'].includes(status)) {
    const msg = {
      denied: 'Camera / microphone access was blocked. Click the lock icon next to the address bar, allow Camera and Microphone, then reload.',
      nodevice: 'No camera or microphone was found on this device.',
      busy: 'Your camera is being used by another app (Zoom, Meet, WhatsApp...). Close it and try again.',
      full: `This room is full (${MAX_PEOPLE} people max).`,
      error: 'Could not connect to the room. Check your internet and reload.',
    }[status];
    return (
      <div className="min-h-[100svh] bg-gray-950 flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-white text-lg font-semibold mb-6">{msg}</p>
          <button type="button" onClick={() => window.location.reload()} className="rounded-full bg-white px-6 py-3 font-bold text-gray-900">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100svh] bg-gray-950 flex flex-col p-3 sm:p-4 gap-3">
      <div className="flex items-center justify-between text-white px-1">
        <div className="text-sm font-semibold">
          3Digree Call <span className="text-gray-500">· {room}</span>
        </div>
        <div className="text-xs text-gray-400">
          {status === 'live' ? `${count} / ${MAX_PEOPLE} in call` : 'Starting...'}
        </div>
      </div>

      <div className={`flex-1 grid ${grid} gap-3 min-h-0 auto-rows-fr`}>
        <VideoTile stream={localStream} label={`${myName} (you)${micOn ? '' : ' · muted'}`} muted mirrored />
        {remoteList.map(([id, r]) => (
          <VideoTile
            key={id}
            stream={r.stream}
            label={r.name || 'Guest'}
            status={r.state === 'failed' ? "Couldn't connect (network blocks direct calls)" : 'Connecting...'}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 sm:gap-3 pb-1">
        <ControlButton onClick={toggleMic} active={micOn} title="Microphone">
          {micOn ? 'Mute' : 'Unmute'}
        </ControlButton>
        <ControlButton onClick={toggleCam} active={camOn} title="Camera">
          {camOn ? 'Camera off' : 'Camera on'}
        </ControlButton>
        <ControlButton onClick={copyLink} title="Copy invite link">
          {copied ? 'Copied!' : 'Invite'}
        </ControlButton>
        <ControlButton onClick={() => navigate('/')} danger title="Leave call">
          Leave
        </ControlButton>
      </div>
    </div>
  );
};

export default VideoCall;
