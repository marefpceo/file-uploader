/*
  Warnings:

  - Added the required column `file_path` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime_type` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_name` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "file_path" TEXT NOT NULL,
ADD COLUMN     "mime_type" TEXT NOT NULL,
ADD COLUMN     "original_name" TEXT NOT NULL;
