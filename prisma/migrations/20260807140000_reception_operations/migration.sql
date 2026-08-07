ALTER TABLE "NewsPost" ADD COLUMN "publishUntil" TIMESTAMP(3);

CREATE TABLE "FaqEntry" (
  "id" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FaqEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "FaqEntry_isPublished_sortOrder_idx" ON "FaqEntry"("isPublished", "sortOrder");

ALTER TABLE "ContactMessage" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE "ContactMessage" ADD COLUMN "assignedTo" TEXT;
ALTER TABLE "ContactMessage" ADD COLUMN "dueAt" TIMESTAMP(3);
ALTER TABLE "ContactMessage" ADD COLUMN "internalNote" TEXT;
ALTER TABLE "ContactMessage" ADD COLUMN "responseChannel" TEXT;
ALTER TABLE "ContactMessage" ADD COLUMN "responseSummary" TEXT;
ALTER TABLE "ContactMessage" ADD COLUMN "firstRespondedAt" TIMESTAMP(3);
ALTER TABLE "ContactMessage" ADD COLUMN "resolvedAt" TIMESTAMP(3);
ALTER TABLE "ContactMessage" ADD COLUMN "lastNotifiedAt" TIMESTAMP(3);
ALTER TABLE "ContactMessage" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
CREATE INDEX "ContactMessage_priority_dueAt_idx" ON "ContactMessage"("priority", "dueAt");
CREATE INDEX "ContactMessage_createdAt_idx" ON "ContactMessage"("createdAt");

CREATE TABLE "ContactEvent" (
  "id" TEXT NOT NULL,
  "contactMessageId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "actorType" TEXT NOT NULL,
  "detail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ContactEvent_contactMessageId_createdAt_idx" ON "ContactEvent"("contactMessageId", "createdAt");
ALTER TABLE "ContactEvent" ADD CONSTRAINT "ContactEvent_contactMessageId_fkey" FOREIGN KEY ("contactMessageId") REFERENCES "ContactMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "StaffNotificationSetting" (
  "id" TEXT NOT NULL,
  "destinationEmail" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "notificationTypes" TEXT NOT NULL DEFAULT 'contact,appointment_change,email_failed',
  "quietStart" TEXT,
  "quietEnd" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StaffNotificationSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StaffNotificationJob" (
  "id" TEXT NOT NULL,
  "contactMessageId" TEXT,
  "type" TEXT NOT NULL,
  "dedupeKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StaffNotificationJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StaffNotificationJob_dedupeKey_key" ON "StaffNotificationJob"("dedupeKey");
CREATE INDEX "StaffNotificationJob_status_createdAt_idx" ON "StaffNotificationJob"("status", "createdAt");
CREATE INDEX "StaffNotificationJob_contactMessageId_status_idx" ON "StaffNotificationJob"("contactMessageId", "status");
ALTER TABLE "StaffNotificationJob" ADD CONSTRAINT "StaffNotificationJob_contactMessageId_fkey" FOREIGN KEY ("contactMessageId") REFERENCES "ContactMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
