# Campetto — Test Suite

Documento di riferimento per tutti i test del progetto.
Per i test automatici: `npm run test` (Vitest).
Per i test manuali: eseguire seguendo le istruzioni.

---

## Test automatici (Vitest — `npm run test`)

| File | Test | Stato |
|---|---|---|
| `__tests__/health.test.ts` | `1 + 1 = 2` — smoke test setup Vitest | ✅ |

---

## Test manuali — Autenticazione

### AUTH-01 — Redirect unauthenticated
**Precondizioni:** nessun cookie di sessione attivo  
**Passaggi:**
1. Aprire il browser in modalità incognita
2. Navigare su `/dashboard` (o qualsiasi route protetta)

**Risultato atteso:** redirect `307` a `/login?callbackUrl=...`  
**Risultato verificato:** `curl` → `307 → http://localhost:3000/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fdashboard` ✅

---

### AUTH-02 — Login con credenziali corrette
**Precondizioni:** nessuna sessione attiva  
**Passaggi:**
1. Andare su `/login`
2. Inserire email: `admin@campetto.app`
3. Inserire password: `campetto2024`
4. Cliccare "Accedi"

**Risultato atteso:** redirect a `/dashboard`, layout con sidebar visibile, "Benvenuto, Mister" nella dashboard  
**Risultato verificato:** ✅

---

### AUTH-03 — Login con credenziali errate
**Precondizioni:** nessuna sessione attiva  
**Passaggi:**
1. Andare su `/login`
2. Inserire credenziali non valide
3. Cliccare "Accedi"

**Risultato atteso:** messaggio di errore "Credenziali non valide. Riprova." — pagina rimane su `/login`  
**Risultato verificato:** ✅

---

### AUTH-04 — Logout
**Precondizioni:** sessione attiva  
**Passaggi:**
1. Cliccare "Esci" nella sidebar
2. Confermare

**Risultato atteso:** redirect a `/login`, cookie di sessione rimosso  
**Risultato verificato:** ✅

---

## Test manuali — Layout e navigazione

### NAV-01 — Navigazione sidebar completa
**Precondizioni:** sessione attiva  
**Passaggi:** cliccare ogni voce della sidebar in ordine

| Voce | Route | Titolo top-bar | Highlight sidebar |
|---|---|---|---|
| Dashboard | `/dashboard` | Dashboard | ✅ |
| Giocatori | `/giocatori` | Giocatori | ✅ |
| Squadre | `/squadre` | Squadre | ✅ |
| Visite Mediche | `/visite` | Visite Mediche | ✅ |
| Pagamenti | `/pagamenti` | Pagamenti | ✅ |
| Scadenzario | `/scadenzario` | Scadenzario | ✅ |

**Risultato verificato:** ✅

---

### NAV-02 — Active route highlight
**Precondizioni:** sessione attiva  
**Verifica:** la voce attiva in sidebar mostra bordo sinistro verde (`#4caf50`) e sfondo verde tenue  
**Risultato verificato:** ✅

---

### NAV-03 — Data nel top bar
**Verifica:** il top bar mostra la data corrente in italiano (es. "Lunedì 1 Giugno 2026")  
**Risultato verificato:** ✅

---

## Test manuali — API

### API-01 — Health check database
**Passaggi:**
1. Avviare `npm run dev`
2. Navigare su `/api/health`

**Risultato atteso:**
```json
{ "status": "ok", "database": "connected", "timestamp": "..." }
```
**Risultato verificato:** ✅

---

## Test manuali — Build

### BUILD-01 — Build di produzione
**Comando:** `npm run build`  
**Risultato atteso:** compilazione TypeScript OK, tutte le route generate, nessun errore  
**Risultato verificato:** ✅ (11 route: `/`, `/_not-found`, `/api/auth/[...nextauth]`, `/api/health`, `/dashboard`, `/giocatori`, `/login`, `/pagamenti`, `/scadenzario`, `/squadre`, `/visite`)

---

## Checklist pre-commit

- [ ] `npm run test` → tutti i test automatici passano
- [ ] `npm run build` → build di produzione OK
- [ ] Test manuali AUTH-01, AUTH-02 verificati
- [ ] Nessun `any` nel codice TypeScript
