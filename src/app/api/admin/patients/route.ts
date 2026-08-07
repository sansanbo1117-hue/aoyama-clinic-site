import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import { getPatientCardLookupHash, normalizePatientCardNumber } from "@/lib/pii";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const query = new URL(request.url).searchParams.get("query")?.trim() ?? "";
  if (query.length < 1) return NextResponse.json({ patients: [] });
  const normalized = normalizePatientCardNumber(query);
  const patients = await prisma.patient.findMany({ where: { OR: [{ name: { contains: query, mode: "insensitive" } }, { nameKana: { contains: query, mode: "insensitive" } }, { phone: { contains: query } }, { patientCardNumberLookupHash: getPatientCardLookupHash(normalized) }, { chartNumberLookupHash: getPatientCardLookupHash(normalized) }] }, orderBy: { updatedAt: "desc" }, take: 10, select: { id: true, name: true, nameKana: true, phone: true, birthDate: true, patientCardNumberLast4: true, chartNumberLast4: true, chartLinkStatus: true } });
  return NextResponse.json({ patients });
}
