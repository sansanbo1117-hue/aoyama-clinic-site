import { NextResponse } from "next/server";

import { holdSlot } from "@/lib/booking";
import { allowPublicSubmission, getClientIp, hashClientKey } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { slotId?: string; clientId?: string };
    if (!body.slotId) return NextResponse.json({ error: "時間枠を選択してください。" }, { status: 400 });
    if (!(await allowPublicSubmission("booking-hold"))) {
      return NextResponse.json(
        { error: "短時間に多くの時間枠が選択されました。10分ほど待ってから、もう一度お試しください。" },
        { status: 429, headers: { "Retry-After": "600" } }
      );
    }
    const browserId = typeof body.clientId === "string" && /^[a-zA-Z0-9_-]{16,128}$/.test(body.clientId)
      ? body.clientId
      : "legacy-client";
    const clientKey = hashClientKey(`${await getClientIp()}:${browserId}`);
    return NextResponse.json(await holdSlot(body.slotId, clientKey));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "時間枠を確保できませんでした。" }, { status: 409 });
  }
}
