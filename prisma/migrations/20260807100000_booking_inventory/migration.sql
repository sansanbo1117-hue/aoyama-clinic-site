CREATE TABLE "ServiceType" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "bookingMode" TEXT NOT NULL DEFAULT 'instant',
  "defaultDurationMinutes" INTEGER NOT NULL DEFAULT 20,
  "defaultCapacity" INTEGER NOT NULL DEFAULT 1,
  "bookingHorizonDays" INTEGER NOT NULL DEFAULT 30,
  "minLeadMinutes" INTEGER NOT NULL DEFAULT 60,
  "cancellationCutoffHours" INTEGER NOT NULL DEFAULT 12,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ServiceType_code_key" ON "ServiceType"("code");

CREATE TABLE "ScheduleRule" (
  "id" TEXT NOT NULL,
  "serviceTypeId" TEXT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "slotMinutes" INTEGER NOT NULL DEFAULT 20,
  "capacity" INTEGER NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ScheduleRule_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ScheduleRule_serviceTypeId_weekday_startTime_endTime_key" ON "ScheduleRule"("serviceTypeId", "weekday", "startTime", "endTime");
CREATE INDEX "ScheduleRule_serviceTypeId_weekday_isActive_idx" ON "ScheduleRule"("serviceTypeId", "weekday", "isActive");

CREATE TABLE "ScheduleException" (
  "id" TEXT NOT NULL,
  "serviceTypeId" TEXT,
  "date" TEXT NOT NULL,
  "startTime" TEXT,
  "endTime" TEXT,
  "kind" TEXT NOT NULL,
  "capacity" INTEGER,
  "note" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ScheduleException_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ScheduleException_date_serviceTypeId_isActive_idx" ON "ScheduleException"("date", "serviceTypeId", "isActive");

CREATE TABLE "AppointmentSlot" (
  "id" TEXT NOT NULL,
  "serviceTypeId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "capacity" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppointmentSlot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AppointmentSlot_serviceTypeId_startsAt_key" ON "AppointmentSlot"("serviceTypeId", "startsAt");
CREATE INDEX "AppointmentSlot_startsAt_status_idx" ON "AppointmentSlot"("startsAt", "status");

CREATE TABLE "SlotHold" (
  "id" TEXT NOT NULL,
  "slotId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SlotHold_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SlotHold_tokenHash_key" ON "SlotHold"("tokenHash");
CREATE INDEX "SlotHold_slotId_expiresAt_idx" ON "SlotHold"("slotId", "expiresAt");

CREATE TABLE "Patient" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nameKana" TEXT,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "birthDate" TEXT,
  "patientCardNumberEncrypted" TEXT,
  "patientCardNumberLookupHash" TEXT,
  "patientCardNumberLast4" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Patient_patientCardNumberLookupHash_idx" ON "Patient"("patientCardNumberLookupHash");
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL,
  "appointmentCode" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "serviceTypeId" TEXT NOT NULL,
  "slotId" TEXT NOT NULL,
  "visitType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'confirmed',
  "source" TEXT NOT NULL DEFAULT 'web',
  "notes" TEXT,
  "cancellationReason" TEXT,
  "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelledAt" TIMESTAMP(3),
  "checkedInAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Appointment_appointmentCode_key" ON "Appointment"("appointmentCode");
CREATE INDEX "Appointment_slotId_status_idx" ON "Appointment"("slotId", "status");
CREATE INDEX "Appointment_patientId_confirmedAt_idx" ON "Appointment"("patientId", "confirmedAt");
CREATE INDEX "Appointment_status_confirmedAt_idx" ON "Appointment"("status", "confirmedAt");

CREATE TABLE "AppointmentAccessToken" (
  "id" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AppointmentAccessToken_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AppointmentAccessToken_tokenHash_key" ON "AppointmentAccessToken"("tokenHash");
CREATE INDEX "AppointmentAccessToken_appointmentId_idx" ON "AppointmentAccessToken"("appointmentId");

CREATE TABLE "AppointmentEvent" (
  "id" TEXT NOT NULL,
  "appointmentId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorType" TEXT NOT NULL,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AppointmentEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AppointmentEvent_appointmentId_createdAt_idx" ON "AppointmentEvent"("appointmentId", "createdAt");

CREATE TABLE "NotificationJob" (
  "id" TEXT NOT NULL,
  "appointmentId" TEXT,
  "type" TEXT NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "providerMessageId" TEXT,
  "lastError" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "NotificationJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NotificationJob_dedupeKey_key" ON "NotificationJob"("dedupeKey");
CREATE INDEX "NotificationJob_status_scheduledFor_idx" ON "NotificationJob"("status", "scheduledFor");

CREATE TABLE "EmailEvent" (
  "id" TEXT NOT NULL,
  "providerEventId" TEXT NOT NULL,
  "appointmentId" TEXT,
  "eventType" TEXT NOT NULL,
  "rawPayload" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "EmailEvent_providerEventId_key" ON "EmailEvent"("providerEventId");
CREATE INDEX "EmailEvent_appointmentId_eventType_idx" ON "EmailEvent"("appointmentId", "eventType");

ALTER TABLE "ScheduleRule" ADD CONSTRAINT "ScheduleRule_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduleException" ADD CONSTRAINT "ScheduleException_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppointmentSlot" ADD CONSTRAINT "AppointmentSlot_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SlotHold" ADD CONSTRAINT "SlotHold_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AppointmentSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "ServiceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AppointmentSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AppointmentAccessToken" ADD CONSTRAINT "AppointmentAccessToken_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AppointmentEvent" ADD CONSTRAINT "AppointmentEvent_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NotificationJob" ADD CONSTRAINT "NotificationJob_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmailEvent" ADD CONSTRAINT "EmailEvent_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
