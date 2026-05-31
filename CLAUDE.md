@AGENTS.md

# Campetto — istruzioni per Claude Code

## Stack
- Next.js 14 App Router, TypeScript strict
- Prisma ORM + Neon PostgreSQL
- Tailwind CSS
- Deploy su Vercel (Hobby plan)

## Regole
- Ogni modifica deve passare `npm run build` prima del commit
- Mai modificare .env.local
- Sempre usare TypeScript strict, no `any`
- Componenti in src/components/, pagine in src/app/
- Migration Prisma obbligatoria per ogni cambio schema

## SDLC
1. Leggi SPEC.md e TASKS.md prima di iniziare
2. Implementa quanto indicato in TASKS.md
3. Scrivi i test in __tests__/ per ogni feature implementata
   - Unit test per funzioni di utility e logica
   - Integration test per le API routes
   - Almeno un test per ogni model Prisma (create, read)
4. Esegui npm run test → devono passare tutti
5. Esegui npm run build → deve passare
6. Committa con messaggio descrittivo (feat:, fix:, chore:)
7. Apri PR su GitHub con titolo descrittivo usando GitHub MCP
8. Non mergare autonomamente — aspetta approvazione

## Regola test
Every coding task is considered DONE only when:
- Implementation works (npm run dev verified)
- Tests are written and pass (npm run test)
- Build passes (npm run build)
- PR is open on GitHub

No exceptions.

## Comandi utili
- npm run dev              → sviluppo locale
- npm run test             → esegui test suite (Vitest)
- npm run test:watch       → test in modalità watch
- npm run build            → verifica build
- npx prisma migrate dev   → nuova migration
- npx prisma studio        → ispeziona DB
