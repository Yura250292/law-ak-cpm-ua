-- AlterTable
ALTER TABLE "CaseAnalysis" ADD COLUMN     "chatSummary" TEXT,
ADD COLUMN     "summarizedCount" INTEGER NOT NULL DEFAULT 0;
