import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { Ruolo } from "@/app/generated/prisma/enums";

type Ctx = { params: Promise<{ id: string }> };

type GenitoreInput = {
  nome?: string;
  cognome?: string;
  telefono?: string;
  email?: string;
  relazione?: string;
};

type GiocatoreBody = {
  nome?: string;
  cognome?: string;
  dataNascita?: string;
  codiceFiscale?: string;
  indirizzo?: string;
  numeroMaglia?: number;
  ruolo?: string;
  squadraId?: number | null;
  note?: string;
  genitori?: GenitoreInput[];
};

const INCLUDE = {
  squadra: { select: { id: true, nome: true, categoria: true } },
  genitori: true,
};

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const g = await prisma.giocatore.findUnique({
    where: { id: parseInt(id, 10) },
    include: INCLUDE,
  });

  if (!g) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(g);
}

export async function PUT(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  const body = await req.json() as GiocatoreBody;

  if (!body.nome || !body.cognome || !body.dataNascita) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (body.ruolo && !Object.values(Ruolo).includes(body.ruolo as Ruolo)) {
    return NextResponse.json({ error: "Invalid ruolo" }, { status: 400 });
  }

  try {
    // Replace genitori: delete existing and recreate
    await prisma.genitore.deleteMany({ where: { giocatoreId: numId } });

    const giocatore = await prisma.giocatore.update({
      where: { id: numId },
      data: {
        nome: body.nome,
        cognome: body.cognome,
        dataNascita: new Date(body.dataNascita),
        codiceFiscale: body.codiceFiscale ?? null,
        indirizzo: body.indirizzo ?? null,
        numeroMaglia: body.numeroMaglia ?? null,
        ruolo: (body.ruolo as Ruolo) ?? null,
        squadraId: body.squadraId ?? null,
        note: body.note ?? null,
        genitori: {
          create: (body.genitori ?? [])
            .filter((g) => g.nome)
            .slice(0, 2)
            .map((g) => ({
              nome: g.nome!,
              cognome: g.cognome ?? "",
              telefono: g.telefono ?? null,
              email: g.email ?? null,
              relazione: g.relazione ?? null,
            })),
        },
      },
      include: INCLUDE,
    });
    return NextResponse.json(giocatore);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);

  const g = await prisma.giocatore.findUnique({ where: { id: numId } });
  if (!g) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cascade deletes (Genitore, VisitaMedica, Pagamento) handled by DB
  await prisma.giocatore.delete({ where: { id: numId } });
  return NextResponse.json({ success: true });
}
