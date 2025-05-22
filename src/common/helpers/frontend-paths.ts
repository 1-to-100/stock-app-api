// const home = 'http://localhost:3000'; // process.env.FRONTEND_URL as string;
const home = 'https://dev-api-381393991104.us-central1.run.app'; // process.env.FRONTEND_URL as string;
if (!home || !/^https?:\/\//.test(home)) {
  throw new Error('FRONTEND_URL is not defined or invalid.');
}

export const FrontendPaths = {
  home,
  setNewPassword: new URL('/auth/supabase/set-new-password', home).href,
};
