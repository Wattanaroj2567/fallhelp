-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'CAREGIVER');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('PASSWORD_RESET', 'EMAIL_VERIFICATION', 'PHONE_VERIFICATION');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'PAIRED', 'UNPAIRED');

-- CreateEnum
CREATE TYPE "WifiStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'CONFIGURING', 'ERROR');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('FALL', 'HEART_RATE_HIGH', 'HEART_RATE_LOW', 'HEART_RATE_NORMAL', 'DEVICE_OFFLINE', 'DEVICE_ONLINE', 'SENSOR_ERROR');

-- CreateEnum
CREATE TYPE "EventSeverity" AS ENUM ('CRITICAL', 'WARNING', 'NORMAL', 'INFO');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FALL_DETECTED', 'HEART_RATE_ALERT', 'DEVICE_OFFLINE', 'DEVICE_ONLINE', 'SYSTEM_UPDATE', 'EMERGENCY_CONTACT_CALLED');

-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "profileImage" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CAREGIVER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_otps" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" "OtpPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elders" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "diseases" TEXT[],
    "profileImage" TEXT,
    "bloodType" TEXT,
    "allergies" TEXT[],
    "medications" TEXT[],
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "deviceCode" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "elderId" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'INACTIVE',
    "lastOnline" TIMESTAMP(3),
    "firmwareVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_configs" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "ssid" TEXT,
    "wifiPassword" TEXT,
    "wifiStatus" "WifiStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "ipAddress" TEXT,
    "fallThreshold" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "hrLowThreshold" INTEGER NOT NULL DEFAULT 50,
    "hrHighThreshold" INTEGER NOT NULL DEFAULT 120,
    "fallCancelTime" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" TEXT NOT NULL,
    "elderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relationship" TEXT,
    "priority" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "elderId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "severity" "EventSeverity" NOT NULL DEFAULT 'NORMAL',
    "value" DOUBLE PRECISION,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "isNotified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "accelerometerX" DOUBLE PRECISION,
    "accelerometerY" DOUBLE PRECISION,
    "accelerometerZ" DOUBLE PRECISION,
    "gyroscopeX" DOUBLE PRECISION,
    "gyroscopeY" DOUBLE PRECISION,
    "gyroscopeZ" DOUBLE PRECISION,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "fcmToken" TEXT,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_elder_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "elderId" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'VIEWER',
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_elder_access_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "auth_otps_userId_purpose_expiresAt_idx" ON "auth_otps"("userId", "purpose", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "devices_deviceCode_key" ON "devices"("deviceCode");

-- CreateIndex
CREATE UNIQUE INDEX "devices_serialNumber_key" ON "devices"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "devices_elderId_key" ON "devices"("elderId");

-- CreateIndex
CREATE UNIQUE INDEX "device_configs_deviceId_key" ON "device_configs"("deviceId");

-- CreateIndex
CREATE INDEX "emergency_contacts_elderId_priority_idx" ON "emergency_contacts"("elderId", "priority");

-- CreateIndex
CREATE UNIQUE INDEX "emergency_contacts_elderId_priority_key" ON "emergency_contacts"("elderId", "priority");

-- CreateIndex
CREATE INDEX "events_elderId_timestamp_idx" ON "events"("elderId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "events_deviceId_timestamp_idx" ON "events"("deviceId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "events_type_timestamp_idx" ON "events"("type", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_createdAt_idx" ON "notifications"("userId", "isRead", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "user_elder_access_userId_idx" ON "user_elder_access"("userId");

-- CreateIndex
CREATE INDEX "user_elder_access_elderId_idx" ON "user_elder_access"("elderId");

-- CreateIndex
CREATE UNIQUE INDEX "user_elder_access_userId_elderId_key" ON "user_elder_access"("userId", "elderId");

-- AddForeignKey
ALTER TABLE "auth_otps" ADD CONSTRAINT "auth_otps_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "elders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_configs" ADD CONSTRAINT "device_configs_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "elders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "elders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_elder_access" ADD CONSTRAINT "user_elder_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_elder_access" ADD CONSTRAINT "user_elder_access_elderId_fkey" FOREIGN KEY ("elderId") REFERENCES "elders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
