import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Auth-gated routes that require authentication
const protectedRoutes = [
  '/domains/checkout',
  '/domains/[domain]/connect',
  '/domains/[domain]/dns',
  '/dashboard',
  '/microvms',
  '/new-app'
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = [
  '/signin',
  '/signup'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // Check if the current path matches any protected route pattern
  const isProtectedRoute = protectedRoutes.some(route => {
    if (route.includes('[domain]')) {
      // Handle dynamic routes like /domains/[domain]/connect
      return pathname.match(/^\/domains\/[^\/]+\/(connect|dns)$/);
    }
    return pathname.startsWith(route);
  });

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to signin
  if (isProtectedRoute && !token) {
    const returnUrl = encodeURIComponent(pathname + request.nextUrl.search);
    return NextResponse.redirect(new URL(`/signin?next=${returnUrl}`, request.url));
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && token) {
    const nextUrl = request.nextUrl.searchParams.get('next');
    if (nextUrl) {
      return NextResponse.redirect(new URL(nextUrl, request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};