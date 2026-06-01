// NextAuth v5 canonical proxy integration.
// `auth` checks the JWT session and uses the `authorized` callback (defined
// in auth.ts) to decide whether to let the request through. If not authorized,
// it automatically redirects to pages.signIn ("/login").
export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/((?!login|invito|api/auth|api/inviti|_next/static|_next/image|favicon.ico).*)",
  ],
};
