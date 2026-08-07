"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { isAuthenticated } from "@/lib/auth";
import { encryptPatientCardNumber, getPatientCardLookupHash, normalizePatientCardNumber } from "@/lib/pii";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validations";

export async function savePatient(formData: FormData) {
  if (!(await isAuthenticated())) throw new Error("Unauthorized");
  const parsed = patientSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "患者情報を確認してください。");
  const data = parsed.data;
  const card = data.patientCardNumber ? normalizePatientCardNumber(data.patientCardNumber) : "";
  const chart = data.chartNumber ? normalizePatientCardNumber(data.chartNumber) : "";
  const patientData = { name: data.name, nameKana: data.nameKana || null, phone: data.phone, email: data.email || null, birthDate: data.birthDate || null, ...(card ? { patientCardNumberEncrypted: encryptPatientCardNumber(card), patientCardNumberLookupHash: getPatientCardLookupHash(card), patientCardNumberLast4: card.slice(-4) } : {}), ...(chart ? { chartNumberEncrypted: encryptPatientCardNumber(chart), chartNumberLookupHash: getPatientCardLookupHash(chart), chartNumberLast4: chart.slice(-4), chartSystem: "aoyama-clinic", chartLinkStatus: "linked", chartVerifiedAt: new Date(), chartVerifiedBy: "staff" } : {}) };
  const patient = data.id ? await prisma.patient.update({ where: { id: data.id }, data: patientData }) : await prisma.patient.create({ data: patientData });
  await prisma.auditEvent.create({ data: { actorType: "staff", action: data.id ? "patient_updated" : "patient_created", entityType: "Patient", entityId: patient.id } });
  revalidatePath("/admin/patients");
  revalidatePath(`/admin/patients/${patient.id}`);
  redirect(`/admin/patients/${patient.id}?saved=1`);
}
