import { NextResponse } from "next/server";

import { getAvailability } from "@/lib/booking";
import { allowPublicSubmission } from "@/lib/rate-limit";

export async function GET(request: Request) {
  if (!(await allowPublicSubmission("availability"))) {
    return NextResponse.json({ error: "アクセスが集中しています。時間をおいてから、もう一度お試しください。" }, { status: 429 });
  }
  try {
    const date = new URL(request.url).searchParams.get("date") ?? undefined;
    return NextResponse.json({ slots: await getAvailability(date) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "空き枠を取得できませんでした。" }, { status: 500 });
  }
}
