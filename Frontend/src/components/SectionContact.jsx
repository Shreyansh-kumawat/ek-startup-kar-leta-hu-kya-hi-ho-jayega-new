import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';

// ─── FADE-IN WRAPPER (scale removed, lighter transition) ───────────────────
const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y: direction === 'up' ? 24 : direction === 'down' ? -24 : 0,
        x: direction === 'left' ? 24 : direction === 'right' ? -24 : 0,
      }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

// ─── PARTICLE BG (reduced to 25 particles, lighter) ────────────────────────
const ParticleBg = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.35 + 0.1),
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '#00ffab' : '#06b6d4',
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.001;

        if (p.alpha <= 0 || p.y < -10) {
          particles[i] = {
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            r: Math.random() * 1.2 + 0.3,
            vx: (Math.random() - 0.5) * 0.25,
            vy: -(Math.random() * 0.35 + 0.1),
            alpha: 0.5 + Math.random() * 0.3,
            color: Math.random() > 0.5 ? '#00ffab' : '#06b6d4',
          };
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * 0.5;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

// ─── PRIMARY BUTTON (shimmer removed, simpler glow) ────────────────────────
const PrimaryButton = ({ href, icon: Icon, label, sublabel }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.97 }}
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      background: '#00ffab',
      color: '#0a0f1e',
      fontFamily: "'Inter', system-ui, sans-serif",
      fontWeight: 800,
      padding: '16px 36px',
      borderRadius: 999,
      textDecoration: 'none',
      boxShadow: '0 0 24px #00ffab55',
      transition: 'box-shadow 0.3s ease',
    }}
  >
    <span style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 'clamp(14px, 2vw, 16px)',
    }}>
      <Icon style={{ fontSize: 19 }} />
      {label}
    </span>
    {sublabel && (
      <span style={{
        fontSize: 10,
        opacity: 0.6,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.08em',
      }}>
        {sublabel}
      </span>
    )}
  </motion.a>
);

// ─── SECONDARY BUTTON (backdrop-filter removed) ────────────────────────────
const SecondaryButton = ({ href, icon: Icon, label, sublabel, accentColor = '#06b6d4' }) => (
  <motion.a
    href={href}
    whileHover={{ scale: 1.04, y: -2 }}
    whileTap={{ scale: 0.97 }}
    style={{
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      border: `1.5px solid ${accentColor}44`,
      background: `${accentColor}0c`,
      color: accentColor,
      fontFamily: "'Inter', system-ui, sans-serif",
      fontWeight: 700,
      padding: '16px 32px',
      borderRadius: 999,
      textDecoration: 'none',
    }}
  >
    <span style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontSize: 'clamp(13px, 1.8vw, 15px)',
    }}>
      <Icon style={{ fontSize: 17 }} />
      {label}
    </span>
    {sublabel && (
      <span style={{
        fontSize: 10,
        opacity: 0.55,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.08em',
      }}>
        {sublabel}
      </span>
    )}
  </motion.a>
);

// ─── CONTACT ROW ────────────────────────────────────────────────────────────
const ContactRow = ({ Icon, label, value, href, accentColor, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.a
        href={href}
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        whileHover={{ x: 3, color: accentColor }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          textDecoration: 'none',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: "'Inter', system-ui, sans-serif",
          transition: 'color 0.2s ease',
          padding: '8px 0',
        }}
      >
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: `${accentColor}12`,
          border: `1px solid ${accentColor}28`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon style={{ fontSize: 15, color: accentColor }} />
        </div>
        <div>
          <div style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.12em',
            color: 'rgba(255,255,255,0.28)',
            marginBottom: 2,
          }}>
            {label}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>
            {value}
          </div>
        </div>
      </motion.a>
    </motion.div>
  );
};

// ─── ORBITING RING (only 2 rings, slowest removed) ─────────────────────────
const OrbitingRing = ({ radius, duration, color, opacity = 0.1 }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration, repeat: Infinity, ease: 'linear' }}
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: radius * 2,
      height: radius * 2,
      borderRadius: '50%',
      border: `1px dashed ${color}`,
      opacity,
      pointerEvents: 'none',
    }}
  />
);

// ─── FOOTER STRIP ───────────────────────────────────────────────────────────
const FooterStrip = () => (
  <div style={{
    marginTop: 48,
    paddingTop: 24,
    borderTop: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{
        fontSize: 20,
        fontWeight: 900,
        color: '#00ffab',
        fontFamily: "'Inter', system-ui, sans-serif",
        letterSpacing: '-0.02em',
      }}>
        3Digree
      </span>
      <span style={{
        fontSize: 10,
        color: 'rgba(255,255,255,0.22)',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '0.12em',
      }}>
        WEBSITE DELIVERY INFRASTRUCTURE
      </span>
    </div>
    <span style={{
      fontSize: 10,
      color: 'rgba(255,255,255,0.18)',
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: '0.2em',
    }}>
      VERSION 3.2
    </span>
    <span style={{
      fontSize: 11,
      color: 'rgba(255,255,255,0.18)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      © {new Date().getFullYear()} 3Digree. All rights reserved.
    </span>
  </div>
);

// ─── SECTION CONTACT — main export ─────────────────────────────────────────
export default function SectionContact() {
  const sectionRef = useRef(null);

  return (
    <section
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: 'clamp(72px, 10vw, 120px) clamp(20px, 5vw, 60px) clamp(44px, 7vw, 72px)',
        background: '#080c18',
        overflow: 'hidden',
      }}
    >
      {/* Particle canvas */}
      <ParticleBg />

      {/* Static radial glow (no animate loop) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,171,0.07), transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 2 Orbiting rings only */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <OrbitingRing radius={220} duration={30} color="#00ffab44" opacity={0.1} />
        <OrbitingRing radius={340} duration={50} color="#06b6d433" opacity={0.07} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Label */}
        <FadeIn>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid rgba(0,255,171,0.25)',
              background: 'rgba(0,255,171,0.05)',
              borderRadius: 999,
              padding: '5px 14px',
            }}>
              {/* Static dot (no pulse loop) */}
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00ffab',
              }} />
              <span style={{
                color: '#00ffab',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.18em',
              }}>
                LET'S WORK TOGETHER
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Headline */}
        <FadeIn delay={0.08}>
          <h2 style={{
            textAlign: 'center',
            fontSize: 'clamp(30px, 6vw, 62px)',
            fontWeight: 900,
            color: '#ffffff',
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            margin: '0 0 16px',
          }}>
            Ready to{' '}
            <span style={{ color: '#00ffab' }}>
              Scale Your Delivery
            </span>
            ?
          </h2>
        </FadeIn>

        {/* Sub-headline */}
        <FadeIn delay={0.14}>
          <p style={{
            textAlign: 'center',
            fontSize: 'clamp(14px, 2vw, 17px)',
            color: 'rgba(255,255,255,0.42)',
            fontFamily: "'Inter', system-ui, sans-serif",
            lineHeight: 1.7,
            maxWidth: 520,
            margin: '0 auto 44px',
          }}>
            Let's talk about how 3Digree becomes your silent backend
            infrastructure — so you can focus on closing deals.
          </p>
        </FadeIn>

        {/* CTA Buttons */}
        <FadeIn delay={0.2}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 14,
            marginBottom: 48,
          }}>
            <PrimaryButton
              href="https://wa.me/918741967971"
              icon={FaWhatsapp}
              label="Partner With Us on WhatsApp"
              sublabel="Fastest response"
            />
            <SecondaryButton
              href="tel:+918741967971"
              icon={FaPhone}
              label="Call Us Now"
              sublabel="+91 87419 67971"
              accentColor="#06b6d4"
            />
          </div>
        </FadeIn>

        {/* Divider */}
        <FadeIn delay={0.26}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 32,
          }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06))' }} />
            <span style={{
              color: 'rgba(255,255,255,0.16)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.2em',
              whiteSpace: 'nowrap',
            }}>
              OR REACH OUT DIRECTLY
            </span>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.06), transparent)' }} />
          </div>
        </FadeIn>

        {/* Contact Rows */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2px 28px',
          maxWidth: 680,
          margin: '0 auto 48px',
        }}>
          <ContactRow Icon={FaPhone}    label="PRIMARY"   value="+91 87419 67971"        href="tel:+918741967971"            accentColor="#00ffab" delay={0.3}  />
          <ContactRow Icon={FaPhone}    label="SECONDARY" value="+91 77288 46516"        href="tel:+917728846516"            accentColor="#06b6d4" delay={0.36} />
          <ContactRow Icon={FaEnvelope} label="EMAIL"     value="info.3digree@gmail.com" href="mailto:info.3digree@gmail.com" accentColor="#a78bfa" delay={0.42} />
          <ContactRow Icon={FaWhatsapp} label="WHATSAPP"  value="Chat with us instantly"  href="https://wa.me/918741967971"   accentColor="#00ffab" delay={0.48} />
        </div>

        {/* Trust Badges */}
        <FadeIn delay={0.38}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 10,
            marginBottom: 40,
          }}>
            {[
              { label: 'NDA on Request',      color: '#00ffab' },
              { label: '3-Day Delivery',       color: '#06b6d4' },
              { label: 'Zero Upfront Cost',    color: '#a78bfa' },
              { label: 'No Long-Term Lock-in', color: '#f472b6' },
              { label: 'Pay Per Project',      color: '#fb923c' },
            ].map(({ label, color }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  border: `1px solid ${color}28`,
                  background: `${color}08`,
                  borderRadius: 999,
                  padding: '6px 14px',
                }}
              >
                <div style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                }} />
                <span style={{
                  color,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  ✓ {label}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Footer */}
        <FadeIn delay={0.46}>
          <FooterStrip />
        </FadeIn>

      </div>
    </section>
  );
}
