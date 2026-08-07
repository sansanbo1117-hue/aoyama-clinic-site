import { NextResponse } from "next/server";

import { issueManageTokenByDetails } from "@/lib/booking";
import { allowPublicSubmission } from "@/lib/rate-limit";
import { appointmentLookupSchema } from "@/lib/validations";

export async function POST(request: Request) {
  if (!(await allowPublicSubmission("appointment-lookup"))) {
    return NextResponse.json({ error: "入力回数が上限に達しました。時間をおいてからお試しください。" }, { status: 429 });
  }

  const parsed = appointmentLookupSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" }, { status: 400 });

  const token = await issueManageTokenByDetails(parsed.data);
  if (!token) return NextResponse.json({ error: "入力内容と一致する予約を確認できませんでした。" }, { status: 404 });
  return NextResponse.json({ token });
}
