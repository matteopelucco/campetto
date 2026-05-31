import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { Categoria } from "@/app/generated/prisma/enums";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const squadre = await prisma.squadra.findMany({
    orderBy: { categoria: "asc" },
    include: { _count: { select: { giocatori: true } } },
  });

  return NextResponse.json(squadre);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    nome?: string;
    categoria?: string;
    stagione?: string;
    allenatore?: string;
  };

  if (!body.nome || !body.categoria || !body.stagione) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!Object.values(Categoria).includes(body.categoria as Categoria)) {
    return NextResponse.json({ error: "Invalid categoria" }, { status: 400 });
  }

  const squadra = await prisma.squadra.create({
    data: {
      nome: body.nome,
      categoria: body.categoria as Categoria,
      stagione: body.stagione,
      allenatore: body.allenatore ?? null,
    },
    include: { _count: { select: { giocatori: true } } },
  });

  return NextResponse.json(squadra, { status: 201 });
}
