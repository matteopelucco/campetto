# Campetto — Specifiche funzionali

## Cos'è
Gestionale web per squadre di calcio giovanile.
Utente amministrativo unico: il responsabile della squadra (Mister).

## Moduli

### 1. Giocatori
Anagrafica completa dei bambini iscritti.
Campi: nome, cognome, data nascita, codice fiscale,
indirizzo, numero maglia, ruolo, note.
Per ogni giocatore: fino a 2 contatti genitore
(nome, telefono, email).

### 2. Squadre
Raggruppamento dei giocatori per categoria.
Categorie: Piccoli Amici, Pulcini, Esordienti,
Giovanissimi, Allievi.
Campi: nome, categoria, stagione, allenatore.

### 3. Visite Mediche
Tracciamento scadenze visite per ogni giocatore.
Tipo: agonistica / non agonistica.
Alert automatici: rosso <14gg, giallo <30gg, verde ok.

### 4. Pagamenti
Quote e rate per ogni giocatore.
Stati: In attesa, Pagato, Scaduto, Annullato.
Registrazione rapida pagamento ricevuto.

### 5. Scadenzario
Vista unificata visite + pagamenti in scadenza.
Orizzonte: 90 giorni. Raggruppato per settimana.

### 6. Dashboard
Riepilogo con alert attivi e statistiche principali.

## Autenticazione
Login singolo admin con email e password.
Nessuna area pubblica.

## UI
Dark theme, moderno, ottimizzato desktop.
