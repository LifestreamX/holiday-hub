-- CreateTable
CREATE TABLE "users" (
    "id" STRING NOT NULL,
    "email" STRING NOT NULL,
    "password" STRING NOT NULL,
    "timezone" STRING NOT NULL DEFAULT 'America/New_York',
    "countryCode" STRING NOT NULL DEFAULT 'US',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "description" STRING NOT NULL,
    "category" STRING NOT NULL,
    "ruleType" STRING NOT NULL,
    "month" INT4,
    "day" INT4,
    "weekday" INT4,
    "nth" INT4,
    "countryCode" STRING NOT NULL DEFAULT 'US',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_holiday_preferences" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "holidayId" STRING NOT NULL,
    "enabled" BOOL NOT NULL DEFAULT true,
    "reminderOffsets" JSONB NOT NULL DEFAULT '[]',
    "reminderTime" STRING NOT NULL DEFAULT '08:00',
    "deliveryMethod" STRING NOT NULL DEFAULT 'email',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_holiday_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "holidayId" STRING NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "sent" BOOL NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "deliveryType" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "endpoint" STRING NOT NULL,
    "p256dh" STRING NOT NULL,
    "auth" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_holiday_preferences_userId_holidayId_key" ON "user_holiday_preferences"("userId", "holidayId");

-- AddForeignKey
ALTER TABLE "user_holiday_preferences" ADD CONSTRAINT "user_holiday_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_holiday_preferences" ADD CONSTRAINT "user_holiday_preferences_holidayId_fkey" FOREIGN KEY ("holidayId") REFERENCES "holidays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_holidayId_fkey" FOREIGN KEY ("holidayId") REFERENCES "holidays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
