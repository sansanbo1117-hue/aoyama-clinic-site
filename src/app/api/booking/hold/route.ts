import { NextResponse } from "next/server";

import { holdSlot } from "@/lib/booking";
import { allowPublicSubmission, getClientIp, hashClientKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!(await allowPublicSubmission("booking-hold"))) {
    return NextResponse.json({ error: "リクエストが集中しています。時間をおいてから、もう一度お試しください。" }, { status: 429 });
  }
  try {
    const body = await request.json() as { slotId?: string };
    if (!body.slotId) return NextResponse.json({ error: "時間枠を選択してください。" }, { status: 400 });
    const clientKey = hashClientKey(await getClientIp());
    return NextResponse.json(await holdSlot(body.slotId, clientKey));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "時間枠を確保できませんでした。" }, { status: 409 });
  }
}
