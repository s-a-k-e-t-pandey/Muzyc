import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const isAuth = req.nextauth.token;
        const isAuthPage = req.nextUrl.pathname.startsWith('/auth');

        if (isAuthPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL('/home', req.url));
            }
            return NextResponse.next();
        }

        if (!isAuth) {
            let from = req.nextUrl.pathname;
            if (req.nextUrl.search) {
                from += req.nextUrl.search;
            }

            return NextResponse.redirect(
                new URL(`/auth?from=${encodeURIComponent(from)}`, req.url)
            );
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
);

export const config = {
    matcher: [
        '/home/:path*',
        '/profile/:path*',
        '/auth',
        '/spaces/:path*'
        // Add other protected routes
    ]
}; 