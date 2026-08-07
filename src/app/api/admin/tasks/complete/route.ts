import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json() as { id?: string };
  if (!body.id) return NextResponse.json({ error: "タスクが指定されていません。" }, { status: 400 });
  await prisma.receptionTask.update({ where: { id: body.id }, data: { status: "done", completedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
