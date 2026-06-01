import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendAdminNotification } from "@/app/lib/email";
import { Ruolo } from "@/app/generated/prisma/enums";

type Ctx = { params: Promise<{ token: string }> };

type RegistrazioneBody = {
  // Child
  nome?: string;
  cognome?: string;
  dataNascita?: string;
  codiceFiscale?: string;
  indirizzo?: string;
  // Parent
  genitoreNome?: string;
  genitoreCognome?: string;
  genitoreTelefono?: string;
  genitoreRelazione?: string;
};

// GET /api/inviti/[token] — returns invite info (public)
export async function GET(_req: Request, { params }: Ctx) {
  const { token } = await params;

  const invite = await prisma.inviteToken.findUnique({ where: { token } });

  if (!invite) {
    return NextResponse.json({ error: "Link non valido" }, { status: 404 });
  }
  if (invite.usato) {
    return NextResponse.json({ error: "Link già utilizzato" }, { status: 410 });
  }
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link scaduto" }, { status: 410 });
  }

  return NextResponse.json({ email: invite.email, expiresAt: invite.expiresAt });
}

// POST /api/inviti/[token] — complete registration (public)
export async function POST(req: Request, { params }: Ctx) {
  const { token } = await params;

  const invite = await prisma.inviteToken.findUnique({ where: { token } });

  if (!invite || invite.usato || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link non valido o scaduto" }, { status: 410 });
  }

  const body = await req.json() as RegistrazioneBody;

  if (!body.nome || !body.cognome || !body.dataNascita) {
    return NextResponse.json({ error: "Campi obbligatori mancanti" }, { status: 400 });
  }

  // Create giocatore + genitore in a transaction
  const giocatore = await prisma.$transaction(async (tx) => {
    const g = await tx.giocatore.create({
      data: {
        nome: body.nome!,
        cognome: body.cognome!,
        dataNascita: new Date(body.dataNascita!),
        codiceFiscale: body.codiceFiscale ?? null,
        indirizzo: body.indirizzo ?? null,
        ruolo: null as Ruolo | null,
        genitori: {
          create: {
            nome: body.genitoreNome ?? "Genitore",
            cognome: body.genitoreCognome ?? "",
            email: invite.email,
            telefono: body.genitoreTelefono ?? null,
            relazione: body.genitoreRelazione ?? null,
          },
        },
      },
    });

    await tx.inviteToken.update({
      where: { token },
      data: { usato: true },
    });

    return g;
  });

  await sendAdminNotification(
    `${giocatore.nome} ${giocatore.cognome}`,
    invite.email,
  );

  return NextResponse.json({ success: true, giocatoreId: giocatore.id }, { status: 201 });
}
