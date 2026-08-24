-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "walletAddress" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 1,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerifiedAt" TIMESTAMP(3),

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userAgent" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_challenges" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "savingsPreference" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DECIMAL(18,2) NOT NULL,
    "currentAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'profit_allocation',
    "amount" DECIMAL(18,2) NOT NULL,
    "percentage" INTEGER NOT NULL DEFAULT 20,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_intents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "destinationAddress" TEXT NOT NULL,
    "tokenAddress" TEXT,
    "assetSymbol" TEXT,
    "assetName" TEXT,
    "amount" DECIMAL(38,18) NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 18,
    "requestId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'prepared',
    "transactionHash" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "confirmedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "chainId" INTEGER NOT NULL,
    "decimals" INTEGER NOT NULL DEFAULT 18,
    "isNative" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_holdings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "quantity" DECIMAL(38,18) NOT NULL,
    "averageCost" DECIMAL(38,18) NOT NULL,
    "costBasis" DECIMAL(38,18) NOT NULL,
    "currentPrice" DECIMAL(38,18) NOT NULL,
    "totalValue" DECIMAL(38,18) NOT NULL,
    "unrealizedPnl" DECIMAL(38,18) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trade_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "transactionHash" TEXT,
    "externalId" TEXT,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL(38,18) NOT NULL,
    "unitPrice" DECIMAL(38,18) NOT NULL,
    "totalValue" DECIMAL(38,18) NOT NULL,
    "fees" DECIMAL(38,18) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    "source" TEXT NOT NULL DEFAULT 'manual',
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trade_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pnl_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL,
    "totalPnl" DECIMAL(38,18) NOT NULL,
    "realizedPnl" DECIMAL(38,18) NOT NULL,
    "unrealizedPnl" DECIMAL(38,18) NOT NULL,
    "portfolioValue" DECIMAL(38,18) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pnl_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_challenges_nonce_key" ON "wallet_challenges"("nonce");

-- CreateIndex
CREATE INDEX "wallet_challenges_walletAddress_idx" ON "wallet_challenges"("walletAddress");

-- CreateIndex
CREATE INDEX "wallet_challenges_expiresAt_idx" ON "wallet_challenges"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "savings_goals_userId_status_idx" ON "savings_goals"("userId", "status");

-- CreateIndex
CREATE INDEX "savings_records_userId_createdAt_idx" ON "savings_records"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_intents_requestId_key" ON "transaction_intents"("requestId");

-- CreateIndex
CREATE INDEX "transaction_intents_userId_status_createdAt_idx" ON "transaction_intents"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "transaction_intents_walletAddress_chainId_idx" ON "transaction_intents"("walletAddress", "chainId");

-- CreateIndex
CREATE INDEX "user_alerts_userId_isRead_createdAt_idx" ON "user_alerts"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "assets_symbol_chainId_idx" ON "assets"("symbol", "chainId");

-- CreateIndex
CREATE UNIQUE INDEX "assets_chainId_address_key" ON "assets"("chainId", "address");

-- CreateIndex
CREATE INDEX "portfolio_holdings_userId_walletAddress_idx" ON "portfolio_holdings"("userId", "walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_holdings_userId_walletAddress_assetId_chainId_key" ON "portfolio_holdings"("userId", "walletAddress", "assetId", "chainId");

-- CreateIndex
CREATE INDEX "trade_records_userId_walletAddress_timestamp_idx" ON "trade_records"("userId", "walletAddress", "timestamp");

-- CreateIndex
CREATE INDEX "trade_records_assetId_timestamp_idx" ON "trade_records"("assetId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "trade_records_userId_transactionHash_key" ON "trade_records"("userId", "transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "trade_records_userId_externalId_key" ON "trade_records"("userId", "externalId");

-- CreateIndex
CREATE INDEX "pnl_snapshots_userId_period_snapshotAt_idx" ON "pnl_snapshots"("userId", "period", "snapshotAt");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_goals" ADD CONSTRAINT "savings_goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_records" ADD CONSTRAINT "savings_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_intents" ADD CONSTRAINT "transaction_intents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_alerts" ADD CONSTRAINT "user_alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_holdings" ADD CONSTRAINT "portfolio_holdings_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_records" ADD CONSTRAINT "trade_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_records" ADD CONSTRAINT "trade_records_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pnl_snapshots" ADD CONSTRAINT "pnl_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
