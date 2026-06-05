-- CreateEnum
CREATE TYPE "Language" AS ENUM ('en', 'sv');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "language" "Language" NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "categories" ADD COLUMN "category_key" TEXT;

-- Backfill category keys from English default names
UPDATE "categories" SET "category_key" = 'vegetables' WHERE "name" = 'Vegetables';
UPDATE "categories" SET "category_key" = 'fruits' WHERE "name" = 'Fruits';
UPDATE "categories" SET "category_key" = 'dairy' WHERE "name" = 'Dairy';
UPDATE "categories" SET "category_key" = 'meat_fish' WHERE "name" = 'Meat & Fish';
UPDATE "categories" SET "category_key" = 'baking' WHERE "name" = 'Baking';
UPDATE "categories" SET "category_key" = 'pantry' WHERE "name" = 'Pantry';
UPDATE "categories" SET "category_key" = 'frozen' WHERE "name" = 'Frozen';
UPDATE "categories" SET "category_key" = 'beverages' WHERE "name" = 'Beverages';
UPDATE "categories" SET "category_key" = 'household' WHERE "name" = 'Household';
UPDATE "categories" SET "category_key" = 'other' WHERE "name" = 'Other';

-- CreateIndex
CREATE UNIQUE INDEX "categories_household_id_category_key_key" ON "categories"("household_id", "category_key");
