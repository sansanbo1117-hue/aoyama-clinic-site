ALTER TABLE "Patient" ADD COLUMN "chartNumberEncrypted" TEXT;
ALTER TABLE "Patient" ADD COLUMN "chartNumberLookupHash" TEXT;
ALTER TABLE "Patient" ADD COLUMN "chartNumberLast4" TEXT;
ALTER TABLE "Patient" ADD COLUMN "chartSystem" TEXT;
ALTER TABLE "Patient" ADD COLUMN "chartLinkStatus" TEXT NOT NULL DEFAULT 'unlinked';
ALTER TABLE "Patient" ADD COLUMN "chartVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Patient" ADD COLUMN "chartVerifiedBy" TEXT;
CREATE INDEX "Patient_chartNumberLookupHash_idx" ON "Patient"("chartNumberLookupHash");
CREATE INDEX "Patient_chartLinkStatus_idx" ON "Patient"("chartLinkStatus");

ALTER TABLE "Appointment" ADD COLUMN "receptionStatus" TEXT NOT NULL DEFAULT 'booked';

CREATE TABLE "ReceptionTask" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "priority" TEXT NOT NULL DEFAULT 'normal',
  "appointmentId" TEXT,
  "patientId" TEXT,
  "title" TEXT NOT NULL,
  "detail" TEXT,
  "dueAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ReceptionTask_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ReceptionTask_status_priority_dueAt_idx" ON "ReceptionTask"("status", "priority", "dueAt");
CREATE INDEX "ReceptionTask_patientId_status_idx" ON "ReceptionTask"("patientId", "status");
CREATE INDEX "ReceptionTask_appointmentId_status_idx" ON "ReceptionTask"("appointmentId", "status");
ALTER TABLE "ReceptionTask" ADD CONSTRAINT "ReceptionTask_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReceptionTask" ADD CONSTRAINT "ReceptionTask_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
