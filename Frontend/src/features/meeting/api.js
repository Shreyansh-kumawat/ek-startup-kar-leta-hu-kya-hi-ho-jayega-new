import { supabase } from '../../lib/supabase';
import { meetingApi } from '../../services/apiClient';

export const requestMeeting = (meetingData) => meetingApi.requestMeeting(meetingData);
export const getUserMeetings = (params) => meetingApi.getUserMeetings(params);

export const getMeetingRequests = async () => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*, profiles!user_id(name, email), templates!template_id(name)')
    .eq('status', 'requested')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { success: true, data };
};

export const getAllMeetings = async () => {
  const { data, error } = await supabase
    .from('meetings')
    .select('*, profiles!user_id(name, email), templates!template_id(name)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return { success: true, data };
};

export const scheduleMeeting = async (meetingId, scheduleData) => {
  const { data, error } = await supabase
    .from('meetings')
    .update({
      scheduled_date: scheduleData.scheduledDate,
      scheduled_time: scheduleData.scheduledTime,
      meeting_link: scheduleData.meetingLink,
      status: 'scheduled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', meetingId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, message: 'Meeting scheduled', data };
};

export const updateMeetingStatus = async (meetingId, status) => {
  const { data, error } = await supabase
    .from('meetings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', meetingId)
    .select()
    .single();

  if (error) throw error;
  return { success: true, data };
};
