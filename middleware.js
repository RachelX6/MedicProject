// middleware.js
import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req) {
  // 1) Create a Supabase client bound to this request/response
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 2) Check if there’s a valid session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // → No session → rewrite to our /401 page
    // This preserves the original URL in the browser but shows /401 content.
    return NextResponse.rewrite(new URL("/401", req.url));

    // If you prefer a direct 401 response (no HTML page), you could instead do:
    // return new Response("Unauthorized", { status: 401 });
  }

  // 3) If session exists, continue to the requested page
  return res;
}

// 4) Configure which routes are protected
export const config = {
  matcher: [
    "/profile",
    "/questionnaire",
    "/interestsQuestionnaire",
    "/my-answers",
    // You can also protect entire folders:
    // "/dashboard/:path*",
  ],
};
