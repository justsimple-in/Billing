import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;



const rateLimiter =
  upstashUrl && upstashToken
    ? new Ratelimit({
        redis: new Redis({
          url: upstashUrl,
          token: upstashToken,
        }),
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        prefix: "billing:view",
      })
    : null;

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
];

export default auth(async (req) => {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/view/") && rateLimiter) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp =
      forwardedFor?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const shareId = pathname.split("/")[2];
    const identifier = `${clientIp}:${shareId}`;

    const { success, limit, remaining, reset } = await rateLimiter.limit(
      identifier,
    );

    if (!success) {
      return new NextResponse("Too many requests", {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
          ),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
        },
      });
    }
  }

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