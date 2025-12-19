import {stackServerApp} from "@/stack";
import { NextResponse } from "next/server";

export async function middleware(request) {
    try {
        const user = await stackServerApp.getUser();
        if (!user) {
            return NextResponse.redirect(new URL('/handler/sign-in', request.url));
        }
        return NextResponse.next();
    } catch (error) {
        console.error('Middleware error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const config = {
    matcher: '/dashboard/:path*',
};