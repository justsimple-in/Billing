import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/view/")
  ) {
    return NextResponse.next();
  }

  // User not logged in
  if (!req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};