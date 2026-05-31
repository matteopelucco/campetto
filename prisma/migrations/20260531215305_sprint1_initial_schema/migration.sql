-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('PICCOLI_AMICI', 'PULCINI', 'ESORDIENTI', 'GIOVANISSIMI', 'ALLIEVI');

-- CreateEnum
CREATE TYPE "Ruolo" AS ENUM ('PORTIERE', 'DIFENSORE', 'CENTROCAMPISTA', 'ATTACCANTE');

-- CreateEnum
CREATE TYPE "TipoVisita" AS ENUM ('AGONISTICA', 'NON_AGONISTICA');

-- CreateEnum
CREATE TYPE "EsitoVisita" AS ENUM ('IDONEO', 'NON_IDONEO', 'DA_RIPETERE');

-- CreateEnum
CREATE TYPE "StatoPagamento" AS ENUM ('IN_ATTESA', 'PAGATO', 'SCADUTO', 'ANNULLATO');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('CONTANTI', 'BONIFICO', 'POS', 'ALTRO');

-- CreateTable
CREATE TABLE "Squadra" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "stagione" TEXT NOT NULL,
    "allenatore" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Squadra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Giocatore" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "dataNascita" TIMESTAMP(3) NOT NULL,
    "codiceFiscale" TEXT,
    "indirizzo" TEXT,
    "numeroMaglia" INTEGER,
    "ruolo" "Ruolo",
    "note" TEXT,
    "attivo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "squadraId" INTEGER,

    CONSTRAINT "Giocatore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genitore" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "relazione" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "giocatoreId" INTEGER NOT NULL,

    CONSTRAINT "Genitore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitaMedica" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoVisita" NOT NULL,
    "dataVisita" TIMESTAMP(3) NOT NULL,
    "dataScadenza" TIMESTAMP(3) NOT NULL,
    "medico" TEXT,
    "struttura" TEXT,
    "esito" "EsitoVisita" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "giocatoreId" INTEGER NOT NULL,

    CONSTRAINT "VisitaMedica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" SERIAL NOT NULL,
    "descrizione" TEXT NOT NULL,
    "importo" DECIMAL(65,30) NOT NULL,
    "dataScadenza" TIMESTAMP(3) NOT NULL,
    "dataPagamento" TIMESTAMP(3),
    "stato" "StatoPagamento" NOT NULL,
    "metodo" "MetodoPagamento",
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "giocatoreId" INTEGER NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Giocatore" ADD CONSTRAINT "Giocatore_squadraId_fkey" FOREIGN KEY ("squadraId") REFERENCES "Squadra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Genitore" ADD CONSTRAINT "Genitore_giocatoreId_fkey" FOREIGN KEY ("giocatoreId") REFERENCES "Giocatore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitaMedica" ADD CONSTRAINT "VisitaMedica_giocatoreId_fkey" FOREIGN KEY ("giocatoreId") REFERENCES "Giocatore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_giocatoreId_fkey" FOREIGN KEY ("giocatoreId") REFERENCES "Giocatore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
