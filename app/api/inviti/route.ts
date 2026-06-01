import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { sendInviteEmail, buildInviteLink } from "@/app/lib/email";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  // Protected: only admin can send invites
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { email?: string };
  if (!body.email || !body.email.includes("@")) {
    return NextResponse.json({ error: "Email non valida" }, { status: 400 });
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  await prisma.inviteToken.create({
    data: { token, email: body.email, expiresAt },
  });

  const emailSent = await sendInviteEmail(body.email, token);
  const link = buildInviteLink(token);

  return NextResponse.json(
    { success: true, email: body.email, emailSent, link },
    { status: 201 },
  );
}
