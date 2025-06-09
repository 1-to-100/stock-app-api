const home = process.env.FRONTEND_URL as string;
if (!home || !/^https?:\/\//.test(home)) {
  throw new Error('FRONTEND_URL is not defined or invalid.');
}

export const FrontendPaths = {
  home,
  dashboardOverview: new URL('/dashboard/user-management', home).href,
  setNewPassword: new URL('/auth/supabase/set-new-password', home).href,
  callbackPkce: (() => {
    const callbackPkceUrl = new URL('/auth/supabase/callback/pkce', home);
    callbackPkceUrl.searchParams.set('next', '/dashboard/user-management');
    return callbackPkceUrl.href;
  })(),
  callbackImplicit: (() => {
    const callbackImplicitUrl = new URL(
      '/auth/supabase/callback/implicit',
      home,
    );
    callbackImplicitUrl.searchParams.set('next', '/dashboard/user-management');
    return callbackImplicitUrl.href;
  })(),
};
