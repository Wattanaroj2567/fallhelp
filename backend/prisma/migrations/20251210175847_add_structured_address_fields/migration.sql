/*
  Warnings:

  - You are about to drop the column `notes` on the `elders` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `emergency_contacts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "elders" DROP COLUMN "notes",
ADD COLUMN     "district" TEXT,
ADD COLUMN     "houseNumber" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "subdistrict" TEXT,
ADD COLUMN     "village" TEXT,
ADD COLUMN     "zipcode" TEXT;

-- AlterTable
ALTER TABLE "emergency_contacts" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" "Gender";
