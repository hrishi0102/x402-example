// app/api/protected/route.ts
import { NextResponse } from "next/server";

export async function GET(req) {
  console.log("Protected route hit:", req.headers.get("x-payment"));
  return NextResponse.json({
    message: "✅ Payment successful! Here’s your premium API data.",
  });
}
