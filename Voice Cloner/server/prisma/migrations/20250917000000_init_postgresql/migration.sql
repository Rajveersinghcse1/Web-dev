-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PRIVATE', 'FRIENDS', 'PUBLIC');

-- CreateEnum
CREATE TYPE "VoiceQuality" AS ENUM ('BASIC', 'STANDARD', 'HIGH', 'PREMIUM');

-- CreateEnum
CREATE TYPE "VoiceGender" AS ENUM ('MALE', 'FEMALE', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "AgeRange" AS ENUM ('CHILD', 'TEEN', 'YOUNG_ADULT', 'ADULT', 'SENIOR');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AudioFormat" AS ENUM ('MP3', 'WAV', 'FLAC', 'OGG');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "profileImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "allowDataCollection" BOOLEAN NOT NULL DEFAULT false,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "defaultVoiceQuality" "VoiceQuality" NOT NULL DEFAULT 'STANDARD',
    "defaultLanguage" TEXT NOT NULL DEFAULT 'en-US',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "gender" "VoiceGender",
    "ageRange" "AgeRange",
    "pitch" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "emotion" TEXT,
    "accent" TEXT,
    "trainingStatus" "TrainingStatus" NOT NULL DEFAULT 'PENDING',
    "trainingProgress" DOUBLE PRECISION DEFAULT 0,
    "sampleAudioUrl" TEXT,
    "sampleDuration" DOUBLE PRECISION,
    "sampleQuality" "VoiceQuality" NOT NULL DEFAULT 'STANDARD',
    "modelVersion" TEXT,
    "modelSize" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voiceProfileId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inputText" TEXT,
    "inputAudioUrl" TEXT,
    "inputLanguage" TEXT NOT NULL DEFAULT 'en-US',
    "outputAudioUrl" TEXT,
    "outputDuration" DOUBLE PRECISION,
    "outputQuality" "VoiceQuality" NOT NULL DEFAULT 'STANDARD',
    "outputFormat" "AudioFormat" NOT NULL DEFAULT 'MP3',
    "status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "progress" DOUBLE PRECISION DEFAULT 0,
    "errorMessage" TEXT,
    "processingStartedAt" TIMESTAMP(3),
    "processingEndedAt" TIMESTAMP(3),
    "processingDuration" DOUBLE PRECISION,
    "similarityScore" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseTime" DOUBLE PRECISION NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "requestSize" INTEGER,
    "responseSize" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_blacklist" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "tokenId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- CreateIndex
CREATE INDEX "api_usage_userId_date_idx" ON "api_usage"("userId", "date");

-- CreateIndex
CREATE INDEX "api_usage_endpoint_timestamp_idx" ON "api_usage"("endpoint", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "token_blacklist_tokenId_key" ON "token_blacklist"("tokenId");

-- CreateIndex
CREATE INDEX "token_blacklist_tokenId_idx" ON "token_blacklist"("tokenId");

-- CreateIndex
CREATE INDEX "token_blacklist_expiresAt_idx" ON "token_blacklist"("expiresAt");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_profiles" ADD CONSTRAINT "voice_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_projects" ADD CONSTRAINT "voice_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voice_projects" ADD CONSTRAINT "voice_projects_voiceProfileId_fkey" FOREIGN KEY ("voiceProfileId") REFERENCES "voice_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_usage" ADD CONSTRAINT "api_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_blacklist" ADD CONSTRAINT "token_blacklist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;