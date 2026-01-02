import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and auth routes
  if (
    pathname.startsWith('/cgi-authorize') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('favicon.ico')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  const redirectToLanding = () => {
    // Redirect to the static landing page /cgi-authorize/auth
    // instead of directly to /cgi-authorize/login
    const landingUrl = new URL('/cgi-authorize/auth', request.nextUrl.origin);
    landingUrl.searchParams.set('redirect_url', request.nextUrl.href);
    return NextResponse.redirect(landingUrl);
  };

  if (!token) {
    return redirectToLanding();
  }

  // Basic verification (Edge compatible via jose in lib/auth)
  const payload = await verifySession(token);
  if (!payload) {
     return redirectToLanding();
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
