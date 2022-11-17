/*
  Warnings:

  - You are about to drop the column `heigth` on the `Resolution` table. All the data in the column will be lost.
  - Added the required column `height` to the `Resolution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resolution" DROP COLUMN "heigth",
ADD COLUMN     "height" INTEGER NOT NULL;
