-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" BOOL NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN     "verificationToken" STRING;
ALTER TABLE "users" ADD COLUMN     "verificationTokenExpires" TIMESTAMP(3);

-- RenameIndex
ALTER INDEX "holidays_name_country_unique" RENAME TO "holidays_name_countryCode_key";
