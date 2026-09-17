-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "civility" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "date_naissance" DATE NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'utilisateur',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artiste" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artiste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_spectacle" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "category_spectacle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spectacle" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date_spectacle" DATE NOT NULL,
    "heure_spectacle" TIME NOT NULL,
    "lieu" TEXT NOT NULL,
    "lien_spectacle" TEXT,
    "category_id" INTEGER,

    CONSTRAINT "spectacle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avis" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "spectacle_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lieu" (
    "id" SERIAL NOT NULL,
    "image_path" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "lieu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_addictionnel" (
    "id" SERIAL NOT NULL,
    "image_path" TEXT NOT NULL,
    "category_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_addictionnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "category_spectacle_code_key" ON "category_spectacle"("code");

-- CreateIndex
CREATE INDEX "spectacle_category_id_idx" ON "spectacle"("category_id");

-- AddForeignKey
ALTER TABLE "spectacle" ADD CONSTRAINT "spectacle_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category_spectacle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avis" ADD CONSTRAINT "avis_spectacle_id_fkey" FOREIGN KEY ("spectacle_id") REFERENCES "spectacle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_addictionnel" ADD CONSTRAINT "photo_addictionnel_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category_spectacle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

