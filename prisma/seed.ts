import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database…");

  const squadre = [
    {
      nome: "Pulcini 2016",
      categoria: "PULCINI" as const,
      stagione: "2024/25",
      allenatore: "Marco Rossi",
    },
    {
      nome: "Esordienti 2014",
      categoria: "ESORDIENTI" as const,
      stagione: "2024/25",
      allenatore: "Luca Bianchi",
    },
    {
      nome: "Giovanissimi 2012",
      categoria: "GIOVANISSIMI" as const,
      stagione: "2024/25",
      allenatore: "Claudio",
    },
  ];

  for (const s of squadre) {
    const existing = await prisma.squadra.findFirst({
      where: { nome: s.nome, stagione: s.stagione },
    });
    if (!existing) {
      await prisma.squadra.create({ data: s });
      console.log(`  ✅ Creata: ${s.nome}`);
    } else {
      console.log(`  ⏭️  Già esistente: ${s.nome}`);
    }
  }

  console.log("✅ Seed completato");
}

main()
  .catch((e) => {
    console.error("❌ Seed fallito:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
