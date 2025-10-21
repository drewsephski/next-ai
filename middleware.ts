import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Static files and public routes are allowed
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/webhook') ||
    pathname === '/' ||
    pathname === '/pricing' ||
    pathname === '/privacy-policy' ||
    pathname === '/terms-of-service'
  ) {
    return NextResponse.next();
  }

  // For dashboard routes, let the client-side auth handle the protection
  // since Better Auth has Edge Runtime compatibility issues
  if (pathname.startsWith('/dashboard')) {
    // We can't easily validate sessions in Edge Runtime with Better Auth
    // The useRequireAuth hook will handle client-side protection
    return NextResponse.next();
  }

  return NextResponse.next();
}
