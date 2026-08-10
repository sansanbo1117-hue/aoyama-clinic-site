-- Web予約は各時間3人まで受け付ける。
UPDATE "ServiceType"
SET "defaultCapacity" = 3
WHERE "code" = 'outpatient';

UPDATE "ScheduleRule"
SET "capacity" = 3
WHERE "serviceTypeId" IN (
  SELECT "id" FROM "ServiceType" WHERE "code" = 'outpatient'
);

UPDATE "AppointmentSlot"
SET "capacity" = 3
WHERE "serviceTypeId" IN (
  SELECT "id" FROM "ServiceType" WHERE "code" = 'outpatient'
);

-- 現在の受付終了時刻と一致しない旧ルールは今後の枠生成に使わない。
UPDATE "ScheduleRule" AS rule
SET "isActive" = false
WHERE rule."serviceTypeId" IN (
  SELECT "id" FROM "ServiceType" WHERE "code" = 'outpatient'
)
AND NOT EXISTS (
  SELECT 1
  FROM (VALUES
    (1, '09:00', '11:00'), (1, '14:00', '17:00'),
    (2, '09:00', '11:00'), (2, '14:00', '17:00'),
    (3, '09:00', '11:00'), (3, '15:00', '18:00'),
    (4, '09:00', '11:00'),
    (5, '09:00', '11:00'), (5, '14:00', '17:00'),
    (6, '09:00', '12:00')
  ) AS current_rule(weekday, start_time, end_time)
  WHERE current_rule.weekday = rule."weekday"
    AND current_rule.start_time = rule."startTime"
    AND current_rule.end_time = rule."endTime"
);
