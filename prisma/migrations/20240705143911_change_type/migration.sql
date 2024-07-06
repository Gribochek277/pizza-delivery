/*
  Warnings:

  - Changed the type of `timeStamp` on the `Marker` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `Marker` DROP COLUMN `timeStamp`,
    ADD COLUMN `timeStamp` INTEGER NOT NULL;
