import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { Categoria } from "@/app/generated/prisma/enums";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const squadra = await prisma.squadra.findUnique({
    where: { id: parseInt(id, 10) },
    include: { _count: { select: { giocatori: true } } },
  });

  if (!squadra) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(squadra);
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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

  try {
    const squadra = await prisma.squadra.update({
      where: { id: parseInt(id, 10) },
      data: {
        nome: body.nome,
        categoria: body.categoria as Categoria,
        stagione: body.stagione,
        allenatore: body.allenatore ?? null,
      },
      include: { _count: { select: { giocatori: true } } },
    });
    return NextResponse.json(squadra);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const squadra = await prisma.squadra.findUnique({
    where: { id: parseInt(id, 10) },
    include: { _count: { select: { giocatori: true } } },
  });

  if (!squadra) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (squadra._count.giocatori > 0) {
    return NextResponse.json(
      { error: "Impossibile eliminare: la squadra ha giocatori assegnati" },
      { status: 409 },
    );
  }

  await prisma.squadra.delete({ where: { id: parseInt(id, 10) } });
  return NextResponse.json({ success: true });
}
