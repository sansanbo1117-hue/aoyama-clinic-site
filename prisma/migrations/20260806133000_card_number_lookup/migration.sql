ALTER TABLE "Reservation"
  ADD COLUMN "patientCardNumberLookupHash" TEXT;

CREATE INDEX "Reservation_patientCardNumberLookupHash_idx"
  ON "Reservation"("patientCardNumberLookupHash");
