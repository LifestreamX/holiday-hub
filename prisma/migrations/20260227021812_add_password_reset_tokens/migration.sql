-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" STRING NOT NULL,
    "email" STRING NOT NULL,
    "token" STRING NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
