import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes - allow access without authentication
  if (pathname === '/login' || pathname === '/register') {
    // If user is already logged in, redirect to appropriate dashboard
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
        const { payload } = await jwtVerify(token, secret);
        
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/adminDashboard', request.url));
        } else {
          return NextResponse.redirect(new URL('/userDashboard', request.url));
        }
      } catch (error) {
        // Invalid token, continue to login/register page
      }
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (pathname.includes('/(auth)')) {
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
      const { payload } = await jwtVerify(token, secret);

      // Check role-based access for admin routes
      if (pathname.startsWith('/adminDashboard') && payload.role !== 'admin') {
        // Unauthorized access to admin routes
        return NextResponse.redirect(new URL('/userDashboard', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 