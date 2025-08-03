-- AlterTable
ALTER TABLE "users" ADD COLUMN     "demoExpiresAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "suspendedAt" TIMESTAMP(3),
ADD COLUMN     "suspensionReason" TEXT,
ADD COLUMN     "userType" TEXT NOT NULL DEFAULT 'standard';
