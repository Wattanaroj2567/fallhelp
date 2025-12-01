/*
  Warnings:

  - The primary key for the `events` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_eventId_fkey";

-- AlterTable
ALTER TABLE "events" DROP CONSTRAINT "events_pkey",
ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id", "timestamp");

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "eventTimestamp" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_eventId_eventTimestamp_fkey" FOREIGN KEY ("eventId", "eventTimestamp") REFERENCES "events"("id", "timestamp") ON DELETE SET NULL ON UPDATE CASCADE;
