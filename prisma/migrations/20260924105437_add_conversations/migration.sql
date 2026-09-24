-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('RECEIVED', 'UPLOADED', 'TRANSCRIBING', 'TRANSCRIBED', 'SUMMARIZING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "ConversationSource" AS ENUM ('TELEGRAM', 'UPLOAD', 'BINOTEL');

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "source" "ConversationSource" NOT NULL,
    "externalId" TEXT,
    "direction" TEXT,
    "title" TEXT,
    "clientName" TEXT,
    "clientPhone" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "telegramChatId" TEXT,
    "telegramMessageId" INTEGER,
    "fileName" TEXT,
    "audioR2Key" TEXT,
    "audioMimeType" TEXT,
    "audioSizeBytes" INTEGER,
    "audioDurationMs" INTEGER,
    "status" "ConversationStatus" NOT NULL DEFAULT 'RECEIVED',
    "assemblyTranscriptId" TEXT,
    "transcript" TEXT,
    "utterances" JSONB,
    "summary" TEXT,
    "structured" JSONB,
    "aiModel" TEXT,
    "aiInputTokens" INTEGER,
    "aiOutputTokens" INTEGER,
    "lawyerNotes" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "processingError" TEXT,
    "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_assemblyTranscriptId_key" ON "Conversation"("assemblyTranscriptId");

-- CreateIndex
CREATE INDEX "Conversation_recordedAt_idx" ON "Conversation"("recordedAt" DESC);

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_source_externalId_key" ON "Conversation"("source", "externalId");
