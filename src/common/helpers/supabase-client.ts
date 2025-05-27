import { createClient } from '@supabase/supabase-js';

const supabase_url = 'https://oljhykkvlqrtxdlxgacj.supabase.co'; // process.env.SUPABASE_URL as string;
const service_role_key =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9samh5a2t2bHFydHhkbHhnYWNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njc0MDQ1OSwiZXhwIjoyMDYyMzE2NDU5fQ.rCs318tiHrPiOxjOGItXUZ7JlUHdNGA8Y0wkX-BFfCk'; // process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const supabase = createClient(supabase_url, service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// TODO: Переробити в окремі сервіси
export const supabaseClientAdmin = supabase.auth.admin;
export const supabaseClientAuth = supabase.auth;
export const supabaseClientStorage = supabase.storage;
export const supabaseClientChannel = (channelName: string) => {
  return supabase.channel(channelName);
};

export const sendSupabaseNotification = async (
  channelName: string,
  event: string,
  payload?: unknown,
) => {
  if (!channelName || !event) {
    throw new Error('Channel and event are required');
  }
  if (!supabaseClientChannel) {
    throw new Error('Supabase channel client is not initialized');
  }

  const channel = supabaseClientChannel(channelName);
  channel.subscribe();
  await channel.send({ type: 'broadcast', event, payload });
  await channel.unsubscribe();
};
