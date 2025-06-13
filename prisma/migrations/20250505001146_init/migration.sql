-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "bio" TEXT,
    "profileImageUrl" TEXT,
    "ethAddress" TEXT,
    "cardanoAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIM" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "manifestUrl" TEXT,
    "requiredSpecs" JSONB,
    "licenseType" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "currency" TEXT,
    "tokenContract" TEXT,
    "tokenId" TEXT,
    "chain" TEXT,
    "status" TEXT NOT NULL,
    "imageUrl" TEXT,
    "repoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "ownerId" TEXT,

    CONSTRAINT "AIM_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HyperBox" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specsCpu" TEXT NOT NULL,
    "specsGpu" TEXT NOT NULL,
    "specsRam" TEXT NOT NULL,
    "specsStorage" TEXT NOT NULL,
    "bandwidth" TEXT,
    "location" TEXT,
    "pricePerHour" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "walletAddress" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "HyperBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deployment" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "nodeEndpointUrl" TEXT,
    "aimInstanceId" TEXT,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "aimId" TEXT NOT NULL,
    "hyperBoxId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Deployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_ethAddress_key" ON "User"("ethAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_cardanoAddress_key" ON "User"("cardanoAddress");

-- CreateIndex
CREATE INDEX "User_ethAddress_idx" ON "User"("ethAddress");

-- CreateIndex
CREATE INDEX "User_cardanoAddress_idx" ON "User"("cardanoAddress");

-- CreateIndex
CREATE INDEX "AIM_creatorId_idx" ON "AIM"("creatorId");

-- CreateIndex
CREATE INDEX "AIM_ownerId_idx" ON "AIM"("ownerId");

-- CreateIndex
CREATE INDEX "AIM_status_idx" ON "AIM"("status");

-- CreateIndex
CREATE INDEX "AIM_chain_idx" ON "AIM"("chain");

-- CreateIndex
CREATE INDEX "HyperBox_ownerId_idx" ON "HyperBox"("ownerId");

-- CreateIndex
CREATE INDEX "HyperBox_available_idx" ON "HyperBox"("available");

-- CreateIndex
CREATE INDEX "HyperBox_location_idx" ON "HyperBox"("location");

-- CreateIndex
CREATE INDEX "Deployment_aimId_idx" ON "Deployment"("aimId");

-- CreateIndex
CREATE INDEX "Deployment_hyperBoxId_idx" ON "Deployment"("hyperBoxId");

-- CreateIndex
CREATE INDEX "Deployment_userId_idx" ON "Deployment"("userId");

-- CreateIndex
CREATE INDEX "Deployment_status_idx" ON "Deployment"("status");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_read_idx" ON "Message"("read");

-- AddForeignKey
ALTER TABLE "AIM" ADD CONSTRAINT "AIM_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIM" ADD CONSTRAINT "AIM_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HyperBox" ADD CONSTRAINT "HyperBox_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_aimId_fkey" FOREIGN KEY ("aimId") REFERENCES "AIM"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_hyperBoxId_fkey" FOREIGN KEY ("hyperBoxId") REFERENCES "HyperBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deployment" ADD CONSTRAINT "Deployment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
