/*
  Warnings:

  - You are about to drop the column `fcmToken` on the `notifications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "fcmToken",
ADD COLUMN     "pushToken" TEXT;
