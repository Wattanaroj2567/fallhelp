/*
  Warnings:

  - A unique constraint covering the columns `[ticketNumber]` on the table `feedbacks` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "ticketNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "feedbacks_ticketNumber_key" ON "feedbacks"("ticketNumber");

-- CreateIndex
CREATE INDEX "feedbacks_ticketNumber_idx" ON "feedbacks"("ticketNumber");
