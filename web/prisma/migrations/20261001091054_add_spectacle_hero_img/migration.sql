/*
  Warnings:

  - You are about to drop the `admin_user` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "spectacle" ADD COLUMN     "hero_img" TEXT;

-- DropTable
DROP TABLE "admin_user";
