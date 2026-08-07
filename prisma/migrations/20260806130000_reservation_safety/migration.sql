-- Add durable request identifiers and isolate the card number representation.
ALTER TABLE "Reservation"
  ADD COLUMN "requestCode" TEXT,
  ADD COLUMN "patientCardNumberEncrypted" TEXT,
  ADD COLUMN "patientCardNumberLast4" TEXT;

UPDATE "Reservation"
SET "requestCode" = 'LEGACY-' || "id"
WHERE "requestCode" IS NULL;

ALTER TABLE "Reservation"
  ALTER COLUMN "requestCode" SET NOT NULL;

CREATE UNIQUE INDEX "Reservation_requestCode_key" ON "Reservation"("requestCode");

CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");
