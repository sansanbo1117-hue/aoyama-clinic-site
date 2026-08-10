-- ユーザー指定の取消済み旧予約1件だけを完全削除する。
-- ID・受付番号・状態のすべてが一致しない限り削除しない。
DELETE FROM "Reservation"
WHERE "id" = 'cmshdrcls0000ky04msqhhyfy'
  AND "requestCode" = 'LEGACY-cmshdrcls0000ky04msqhhyfy'
  AND "status" = 'cancelled';
