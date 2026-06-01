-- DropForeignKey
ALTER TABLE "Genitore" DROP CONSTRAINT "Genitore_giocatoreId_fkey";

-- DropForeignKey
ALTER TABLE "Pagamento" DROP CONSTRAINT "Pagamento_giocatoreId_fkey";

-- DropForeignKey
ALTER TABLE "VisitaMedica" DROP CONSTRAINT "VisitaMedica_giocatoreId_fkey";

-- CreateTable
CREATE TABLE "InviteToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "usato" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InviteToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InviteToken_token_key" ON "InviteToken"("token");

-- AddForeignKey
ALTER TABLE "Genitore" ADD CONSTRAINT "Genitore_giocatoreId_fkey" FOREIGN KEY ("giocatoreId") REFERENCES "Giocatore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitaMedica" ADD CONSTRAINT "VisitaMedica_giocatoreId_fkey" FOREIGN KEY ("giocatoreId") REFERENCES "Giocatore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_giocatoreId_fkey" FOREIGN KEY ("giocatoreId") REFERENCES "Giocatore"("id") ON DELETE CASCADE ON UPDATE CASCADE;
