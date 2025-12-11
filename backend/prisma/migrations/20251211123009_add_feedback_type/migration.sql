-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('COMMENT', 'REPAIR_REQUEST');

-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "type" "FeedbackType" NOT NULL DEFAULT 'COMMENT';

-- CreateIndex
CREATE INDEX "feedbacks_userId_type_idx" ON "feedbacks"("userId", "type");
