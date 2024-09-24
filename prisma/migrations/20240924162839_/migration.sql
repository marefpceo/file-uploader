/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[folderId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "File_ownerId_key" ON "File"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "File_folderId_key" ON "File"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "Folder_ownerId_key" ON "Folder"("ownerId");
