import { describe, it, expect, vi, beforeEach } from "vitest";
import { Ruolo } from "@/app/generated/prisma/enums";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    giocatore: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    genitore: {
      deleteMany: vi.fn(),
    },
    inviteToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/app/lib/email", () => ({
  sendInviteEmail: vi.fn().mockResolvedValue(undefined),
  sendAdminNotification: vi.fn().mockResolvedValue(undefined),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import { GET, POST } from "@/app/api/giocatori/route";
import { GET as GET_ID, PUT, DELETE } from "@/app/api/giocatori/[id]/route";
import { POST as POST_INVITE } from "@/app/api/inviti/route";
import { GET as GET_TOKEN, POST as POST_TOKEN } from "@/app/api/inviti/[token]/route";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockSession = { user: { email: "admin@campetto.app" } };

const makeReq = (body: unknown, method = "POST") =>
  new Request("http://localhost/api/giocatori", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const makeParams = (key: string, value: string) =>
  ({ params: Promise.resolve({ [key]: value }) }) as never;

const sampleGiocatore = {
  id: 1, nome: "Mario", cognome: "Rossi",
  dataNascita: new Date("2012-03-15"),
  codiceFiscale: null, indirizzo: null,
  numeroMaglia: 10, ruolo: "ATTACCANTE" as Ruolo,
  note: null, attivo: true,
  squadraId: null, squadra: null, genitori: [],
  createdAt: new Date(), updatedAt: new Date(),
};

const sampleToken = {
  id: 1, token: "abc123", email: "genitore@test.com",
  usato: false, expiresAt: new Date(Date.now() + 48 * 3600 * 1000),
  createdAt: new Date(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Ruolo enum", () => {
  it("has all 4 expected values", () => {
    expect(Object.values(Ruolo)).toEqual(["PORTIERE", "DIFENSORE", "CENTROCAMPISTA", "ATTACCANTE"]);
  });
});

describe("GET /api/giocatori", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.giocatore.findMany).mockResolvedValue([sampleGiocatore] as never);
  });

  it("returns 200 with array", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json() as unknown[];
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect((await GET()).status).toBe(401);
  });
});

describe("POST /api/giocatori", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.giocatore.create).mockResolvedValue(sampleGiocatore as never);
  });

  it("creates giocatore and returns 201", async () => {
    const res = await POST(makeReq({ nome: "Mario", cognome: "Rossi", dataNascita: "2012-03-15" }));
    expect(res.status).toBe(201);
    expect(prisma.giocatore.create).toHaveBeenCalledOnce();
  });

  it("returns 400 when nome is missing", async () => {
    const res = await POST(makeReq({ cognome: "Rossi", dataNascita: "2012-03-15" }));
    expect(res.status).toBe(400);
    const d = await res.json() as { error: string };
    expect(d.error).toBe("Missing required fields");
  });

  it("returns 400 when dataNascita is missing", async () => {
    const res = await POST(makeReq({ nome: "Mario", cognome: "Rossi" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when ruolo is invalid", async () => {
    const res = await POST(makeReq({ nome: "Mario", cognome: "Rossi", dataNascita: "2012-03-15", ruolo: "GOALKEEPER" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect((await POST(makeReq({ nome: "Mario", cognome: "Rossi", dataNascita: "2012-03-15" }))).status).toBe(401);
  });
});

describe("DELETE /api/giocatori/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.giocatore.findUnique).mockResolvedValue(sampleGiocatore as never);
    vi.mocked(prisma.giocatore.delete).mockResolvedValue(sampleGiocatore as never);
  });

  it("deletes successfully and returns 200", async () => {
    const res = await DELETE(new Request("http://localhost"), makeParams("id", "1"));
    expect(res.status).toBe(200);
    const d = await res.json() as { success: boolean };
    expect(d.success).toBe(true);
  });

  it("returns 404 when not found", async () => {
    vi.mocked(prisma.giocatore.findUnique).mockResolvedValue(null as never);
    expect((await DELETE(new Request("http://localhost"), makeParams("id", "999"))).status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect((await DELETE(new Request("http://localhost"), makeParams("id", "1"))).status).toBe(401);
  });
});

describe("GET /api/giocatori/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
  });

  it("returns giocatore by id", async () => {
    vi.mocked(prisma.giocatore.findUnique).mockResolvedValue(sampleGiocatore as never);
    const res = await GET_ID(new Request("http://localhost"), makeParams("id", "1"));
    expect(res.status).toBe(200);
  });

  it("returns 404 when not found", async () => {
    vi.mocked(prisma.giocatore.findUnique).mockResolvedValue(null as never);
    expect((await GET_ID(new Request("http://localhost"), makeParams("id", "999"))).status).toBe(404);
  });
});

describe("PUT /api/giocatori/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.genitore.deleteMany).mockResolvedValue({ count: 0 } as never);
    vi.mocked(prisma.giocatore.update).mockResolvedValue(sampleGiocatore as never);
  });

  it("updates giocatore and returns 200", async () => {
    const req = makeReq({ nome: "Mario", cognome: "Rossi", dataNascita: "2012-03-15" }, "PUT");
    const res = await PUT(req, makeParams("id", "1"));
    expect(res.status).toBe(200);
  });

  it("returns 400 when required fields missing", async () => {
    const req = makeReq({ nome: "Mario" }, "PUT");
    expect((await PUT(req, makeParams("id", "1"))).status).toBe(400);
  });
});

describe("POST /api/inviti — create invite (protected)", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.inviteToken.create).mockResolvedValue(sampleToken as never);
  });

  it("creates invite and returns 201", async () => {
    const res = await POST_INVITE(makeReq({ email: "genitore@test.com" }));
    expect(res.status).toBe(201);
    expect(prisma.inviteToken.create).toHaveBeenCalledOnce();
  });

  it("returns 400 when email is invalid", async () => {
    const res = await POST_INVITE(makeReq({ email: "notanemail" }));
    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect((await POST_INVITE(makeReq({ email: "x@y.com" }))).status).toBe(401);
  });
});

describe("GET /api/inviti/[token] — public", () => {
  it("returns invite info for valid token", async () => {
    vi.mocked(prisma.inviteToken.findUnique).mockResolvedValue(sampleToken as never);
    const res = await GET_TOKEN(new Request("http://localhost"), makeParams("token", "abc123"));
    expect(res.status).toBe(200);
    const d = await res.json() as { email: string };
    expect(d.email).toBe("genitore@test.com");
  });

  it("returns 404 when token not found", async () => {
    vi.mocked(prisma.inviteToken.findUnique).mockResolvedValue(null as never);
    expect((await GET_TOKEN(new Request("http://localhost"), makeParams("token", "bad"))).status).toBe(404);
  });

  it("returns 410 when token already used", async () => {
    vi.mocked(prisma.inviteToken.findUnique).mockResolvedValue({ ...sampleToken, usato: true } as never);
    expect((await GET_TOKEN(new Request("http://localhost"), makeParams("token", "abc123"))).status).toBe(410);
  });

  it("returns 410 when token expired", async () => {
    vi.mocked(prisma.inviteToken.findUnique).mockResolvedValue({
      ...sampleToken, expiresAt: new Date(Date.now() - 1000),
    } as never);
    expect((await GET_TOKEN(new Request("http://localhost"), makeParams("token", "abc123"))).status).toBe(410);
  });
});

describe("POST /api/inviti/[token] — complete registration", () => {
  beforeEach(() => {
    vi.mocked(prisma.inviteToken.findUnique).mockResolvedValue(sampleToken as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) =>
      fn({
        giocatore: { create: vi.fn().mockResolvedValue(sampleGiocatore) },
        inviteToken: { update: vi.fn().mockResolvedValue(sampleToken) },
      } as never),
    );
  });

  it("creates giocatore and returns 201", async () => {
    const req = makeReq({ nome: "Mario", cognome: "Rossi", dataNascita: "2012-03-15" });
    const res = await POST_TOKEN(req, makeParams("token", "abc123"));
    expect(res.status).toBe(201);
  });

  it("returns 400 when required fields missing", async () => {
    const req = makeReq({ nome: "Mario" });
    expect((await POST_TOKEN(req, makeParams("token", "abc123"))).status).toBe(400);
  });

  it("returns 410 when token is invalid", async () => {
    vi.mocked(prisma.inviteToken.findUnique).mockResolvedValue(null as never);
    const req = makeReq({ nome: "Mario", cognome: "Rossi", dataNascita: "2012-03-15" });
    expect((await POST_TOKEN(req, makeParams("token", "bad"))).status).toBe(410);
  });
});
