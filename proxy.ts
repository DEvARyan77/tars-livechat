import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicAuthRoute = createRouteMatcher(["/", "/sign-up"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (userId && isPublicAuthRoute(req)) {
    return NextResponse.redirect(new URL("/users", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
