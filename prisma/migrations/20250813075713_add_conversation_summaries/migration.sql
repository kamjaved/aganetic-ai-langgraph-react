-- CreateTable
CREATE TABLE "public"."ConversationSummary" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ConversationSummary_threadId_idx" ON "public"."ConversationSummary"("threadId");
