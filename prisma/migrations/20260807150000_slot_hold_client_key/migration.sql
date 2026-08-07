ALTER TABLE "SlotHold" ADD COLUMN "clientKey" TEXT;
CREATE INDEX "SlotHold_clientKey_consumedAt_expiresAt_idx" ON "SlotHold"("clientKey", "consumedAt", "expiresAt");
