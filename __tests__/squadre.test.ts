import { describe, it, expect, vi, beforeEach } from "vitest";
import { Categoria } from "@/app/generated/prisma/enums";

// ── Mocks (hoisted before imports) ────────────────────────────────────────────

vi.mock("@/app/lib/prisma", () => ({
  prisma: {
    squadra: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import { GET, POST } from "@/app/api/squadre/route";
import {
  GET as GET_ID,
  PUT,
  DELETE,
} from "@/app/api/squadre/[id]/route";
import { prisma } from "@/app/lib/prisma";
import { auth } from "@/auth";

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockSession = { user: { email: "admin@campetto.app", name: "Mister" } };

const makeReq = (body?: unknown, method = "POST") =>
  new Request("http://localhost:3000/api/squadre", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

const makeParams = (id: string) =>
  ({ params: Promise.resolve({ id }) }) as { params: Promise<{ id: string }> };

const sampleSquadra = {
  id: 1,
  nome: "Pulcini 2016",
  categoria: "PULCINI" as Categoria,
  stagione: "2024/25",
  allenatore: "Marco Rossi",
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { giocatori: 0 },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Categoria enum", () => {
  it("has all 5 expected values", () => {
    const values = Object.values(Categoria);
    expect(values).toHaveLength(5);
    expect(values).toContain("PICCOLI_AMICI");
    expect(values).toContain("PULCINI");
    expect(values).toContain("ESORDIENTI");
    expect(values).toContain("GIOVANISSIMI");
    expect(values).toContain("ALLIEVI");
  });
});

describe("GET /api/squadre", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.squadra.findMany).mockResolvedValue([sampleSquadra] as never);
  });

  it("returns 200 with array of squadre", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json() as unknown[];
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(1);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});

describe("POST /api/squadre", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.squadra.create).mockResolvedValue(sampleSquadra as never);
  });

  it("creates a squadra and returns 201", async () => {
    const req = makeReq({
      nome: "Pulcini 2016",
      categoria: "PULCINI",
      stagione: "2024/25",
      allenatore: "Marco Rossi",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json() as { nome: string };
    expect(data.nome).toBe("Pulcini 2016");
    expect(prisma.squadra.create).toHaveBeenCalledOnce();
  });

  it("returns 400 when nome is missing (form validation)", async () => {
    const req = makeReq({ categoria: "PULCINI", stagione: "2024/25" });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toBe("Missing required fields");
  });

  it("returns 400 when categoria is invalid", async () => {
    const req = makeReq({ nome: "Test", categoria: "INVALID", stagione: "2024/25" });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await POST(makeReq({ nome: "X", categoria: "PULCINI", stagione: "2024/25" }));
    expect(res.status).toBe(401);
  });
});

describe("DELETE /api/squadre/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
  });

  it("returns 409 when squadra has giocatori", async () => {
    vi.mocked(prisma.squadra.findUnique).mockResolvedValue({
      ...sampleSquadra,
      _count: { giocatori: 3 },
    } as never);

    const res = await DELETE(new Request("http://localhost"), makeParams("1"));
    expect(res.status).toBe(409);
    const data = await res.json() as { error: string };
    expect(data.error).toMatch(/giocatori/);
  });

  it("deletes successfully when squadra has no giocatori", async () => {
    vi.mocked(prisma.squadra.findUnique).mockResolvedValue(sampleSquadra as never);
    vi.mocked(prisma.squadra.delete).mockResolvedValue(sampleSquadra as never);

    const res = await DELETE(new Request("http://localhost"), makeParams("1"));
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean };
    expect(data.success).toBe(true);
  });

  it("returns 404 when squadra not found", async () => {
    vi.mocked(prisma.squadra.findUnique).mockResolvedValue(null as never);
    const res = await DELETE(new Request("http://localhost"), makeParams("999"));
    expect(res.status).toBe(404);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    const res = await DELETE(new Request("http://localhost"), makeParams("1"));
    expect(res.status).toBe(401);
  });
});

describe("GET /api/squadre/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
  });

  it("returns single squadra", async () => {
    vi.mocked(prisma.squadra.findUnique).mockResolvedValue(sampleSquadra as never);
    const res = await GET_ID(new Request("http://localhost"), makeParams("1"));
    expect(res.status).toBe(200);
    const data = await res.json() as { id: number };
    expect(data.id).toBe(1);
  });

  it("returns 404 when not found", async () => {
    vi.mocked(prisma.squadra.findUnique).mockResolvedValue(null as never);
    const res = await GET_ID(new Request("http://localhost"), makeParams("999"));
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/squadre/[id]", () => {
  beforeEach(() => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.squadra.update).mockResolvedValue({
      ...sampleSquadra,
      nome: "Pulcini 2016 — aggiornato",
    } as never);
  });

  it("updates and returns the squadra", async () => {
    const req = makeReq(
      { nome: "Pulcini 2016 — aggiornato", categoria: "PULCINI", stagione: "2024/25" },
      "PUT",
    );
    const res = await PUT(req, makeParams("1"));
    expect(res.status).toBe(200);
    const data = await res.json() as { nome: string };
    expect(data.nome).toBe("Pulcini 2016 — aggiornato");
  });

  it("returns 400 when required fields are missing", async () => {
    const req = makeReq({ nome: "Test" }, "PUT");
    const res = await PUT(req, makeParams("1"));
    expect(res.status).toBe(400);
  });
});
