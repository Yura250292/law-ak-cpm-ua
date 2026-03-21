-- AlterEnum
ALTER TYPE "DocumentRequestStatus" ADD VALUE 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "DocumentRequest" ADD COLUMN     "lawyerNotes" TEXT;
