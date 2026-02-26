-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image" STRING;
ALTER TABLE "users" ADD COLUMN     "name" STRING;
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;
