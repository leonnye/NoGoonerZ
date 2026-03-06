export function redirectSystemPath({
  path,
  initial,
}: { path: string; initial: boolean }) {
  // Always start at the root (SplashScreen) so the app flows:
  // Splash -> Signup/Login -> Onboarding -> Tabs
  return '/';
}
