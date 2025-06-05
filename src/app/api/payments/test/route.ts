import { NextResponse } from "next/server";

export async function GET() {
  // 始终返回401未授权状态
  return new NextResponse(
    JSON.stringify({ error: "Authentication required" }),
    { status: 401 },
  );
}

export async function POST() {
  // 始终返回401未授权状态
  return new NextResponse(
    JSON.stringify({ error: "Authentication required" }),
    { status: 401 },
  );
}
