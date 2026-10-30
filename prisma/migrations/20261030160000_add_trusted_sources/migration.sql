-- CreateTable
CREATE TABLE "TrustedSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrustedSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrustedSource_domain_key" ON "TrustedSource"("domain");

-- Стартовий набір офіційних джерел; адвокат керує списком у меню «Джерела».
INSERT INTO "TrustedSource" ("id", "name", "url", "domain") VALUES
  ('seed_zakon_rada', 'Законодавство України (Верховна Рада)', 'https://zakon.rada.gov.ua', 'zakon.rada.gov.ua'),
  ('seed_reyestr', 'Єдиний державний реєстр судових рішень', 'https://reyestr.court.gov.ua', 'reyestr.court.gov.ua'),
  ('seed_supreme', 'Верховний Суд', 'https://supreme.court.gov.ua', 'supreme.court.gov.ua'),
  ('seed_mil', 'Міністерство оборони України', 'https://www.mil.gov.ua', 'mil.gov.ua');
