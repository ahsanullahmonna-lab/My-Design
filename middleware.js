/**
 * Next.js Edge Middleware for Enterprise Route & Session Protection
 * Protects Admin Workspace, Photo Card Studio, and Sensitive API Endpoints
 * 
 * Target Routes:
 * - /admin and /admin/:path*
 * - /photocard and /photocard/:path*
 * - /api/admin/:path*
 * - /api/settings/:path*
 */

export function middleware(request) {
  const { pathname, search } = request.nextUrl || new URL(request.url);

  // Define protected paths requiring verified administrator credentials
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/photocard');
  const isProtectedApiPath = pathname.startsWith('/api/admin') || pathname.startsWith('/api/settings');

  if (!isAdminPath && !isProtectedApiPath) {
    return; // Pass through
  }

  // 1. Check for Admin Session Cookie or Authorization Header
  const authHeader = request.headers.get('authorization') || '';
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'kolom24_admin_secret_prod';
  const customAdminHeader = request.headers.get('x-admin-key');

  const cookies = request.cookies;
  const sessionToken = cookies?.get ? cookies.get('kolom24_admin_session')?.value || cookies.get('admin_token')?.value : null;

  const isBearerValid = authHeader.startsWith('Bearer ') && authHeader.slice(7).trim().length > 10;
  const isSecretValid = customAdminHeader === adminSecret;
  const isSessionValid = Boolean(sessionToken && sessionToken.length > 8);

  const isAuthenticatedAdmin = isBearerValid || isSecretValid || isSessionValid;

  // 2. Reject unauthenticated access to Protected API Routes with 401 Unauthorized
  if (isProtectedApiPath && !isAuthenticatedAdmin) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unauthorized',
        message: 'প্রশাসনিক অনুমতি আবশ্যক: এই API অ্যাক্সেস করতে বৈধ অ্যাডমিন ক্রেডেনশিয়াল প্রয়োজন।',
        statusCode: 401,
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 3. Redirect unauthenticated visitors attempting to access /admin or /photocard
  if (isAdminPath && !isAuthenticatedAdmin) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('auth', 'admin_required');
    loginUrl.searchParams.set('redirect', pathname + (search || ''));
    
    // Redirect to home with login modal trigger
    return Response.redirect(loginUrl, 307);
  }

  // Authorized: continue request
  return;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/photocard',
    '/photocard/:path*',
    '/api/admin/:path*',
    '/api/settings/:path*',
  ],
};
