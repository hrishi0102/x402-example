// app/api/protected/route.ts
import { NextResponse } from "next/server";

export async function GET(req) {
  console.log("Protected route hit:", req.headers.get("x-payment"));
  return NextResponse.json({
    message:
      "✅ WOHOOOO Payment successful! Here’s your PREMIUM API DATA !!!!.",
  });
}
