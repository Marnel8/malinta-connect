import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Check if the path starts with /admin
	if (pathname.startsWith("/admin")) {
		// For admin routes, we'll let the client-side ProtectedRoute handle the auth
		// This middleware is mainly for future server-side auth checks if needed
		return NextResponse.next();
	}

	// Check if the path starts with /login and user is already authenticated
	// This would require checking cookies/tokens, but for now we'll let client handle it
	if (pathname.startsWith("/login")) {
		return NextResponse.next();
	}

	// For all other routes, continue normally
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
		 * - images (public images)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|images).*)",
	],
};
