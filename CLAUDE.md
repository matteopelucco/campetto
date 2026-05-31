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
3. Esegui npm run test e verifica che passi
4. Esegui npm run build e verifica che passi
5. Commit + PR su GitHub con titolo descrittivo
6. Non mergare autonomamente — aspetta approvazione

## Comandi utili
- npm run dev              → sviluppo locale
- npm run test             → esegui test suite (Vitest)
- npm run test:watch       → test in modalità watch
- npm run build            → verifica build
- npx prisma migrate dev   → nuova migration
- npx prisma studio        → ispeziona DB
