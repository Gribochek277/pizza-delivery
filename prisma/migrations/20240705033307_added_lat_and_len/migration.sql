/*
  Warnings:

  - Added the required column `lat` to the `Marker` table without a default value. This is not possible if the table is not empty.
  - Added the required column `len` to the `Marker` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Marker` ADD COLUMN `lat` DECIMAL(65, 30) NOT NULL,
    ADD COLUMN `len` DECIMAL(65, 30) NOT NULL;
