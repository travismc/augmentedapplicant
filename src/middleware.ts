import { authMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export default authMiddleware({
  publicRoutes: [
    "/",
    "/auth/sign-in(.*)",
    "/auth/sign-up(.*)",
    "/api/webhook/clerk"
  ],
  ignoredRoutes: ["/api/webhook/clerk"],
  async afterAuth(auth, req) {
    const res = NextResponse.next();
    
    // If the user is signed in, sync their session with Supabase
    if (auth.userId) {
      try {
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get: (name: string) => req.cookies.get(name)?.value,
              set: (name: string, value: string, options: any) => {
                res.cookies.set({
                  name,
                  value,
                  ...options,
                });
              },
              remove: (name: string, options: any) => {
                res.cookies.set({
                  name,
                  value: '',
                  ...options,
                });
              },
            },
          }
        );

        const token = await auth.getToken({ template: 'supabase' });
        
        if (token) {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: ''
          });
        }
      } catch (error) {
        console.error('Error setting Supabase session:', error);
      }
    }

    return res;
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
