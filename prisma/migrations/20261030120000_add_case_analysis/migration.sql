-- CreateTable
CREATE TABLE "CaseAnalysis" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "lawyerTask" TEXT,
    "fileNames" TEXT[],
    "mode" TEXT NOT NULL,
    "models" TEXT[],
    "analysis" TEXT NOT NULL,
    "caseContext" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "documents" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseAnalysis_updatedAt_idx" ON "CaseAnalysis"("updatedAt" DESC);
