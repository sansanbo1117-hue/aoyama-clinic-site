import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { updateReceptionStatus } from "@/lib/booking";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { id?: string; receptionStatus?: string };
  if (!body.id || !body.receptionStatus) return NextResponse.json({ error: "状態が指定されていません。" }, { status: 400 });
  try { await updateReceptionStatus(body.id, body.receptionStatus); return NextResponse.json({ ok: true }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "状態を更新できませんでした。" }, { status: 409 }); }
}
