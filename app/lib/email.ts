// Email utility — uses Resend when RESEND_API_KEY is set,
// otherwise returns the link for manual sharing.
//
// Required environment variables:
//   RESEND_API_KEY  – your Resend API key (https://resend.com)
//   RESEND_FROM     – sender address, e.g. "Campetto <noreply@campetto.app>"
//   NEXTAUTH_URL    – base URL used to build invite links
//   ADMIN_EMAIL     – admin address for registration notifications

import { Resend } from "resend";

// NOTE: intentionally NOT a module-level const — reading process.env at call
// time ensures the latest value is used after Vercel env var changes + redeploy.
function getResend(): Resend | null {
  return process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;
}

function getFrom(): string {
  return process.env.RESEND_FROM ?? "Campetto <noreply@campetto.app>";
}

function getBaseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function buildInviteLink(token: string): string {
  return `${getBaseUrl()}/invito/${token}`;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

// ── Send invite link to parent ───────────────────────────────────────────────
// Returns true if the email was actually sent, false if Resend is not configured.

export async function sendInviteEmail(
  toEmail: string,
  token: string,
): Promise<boolean> {
  const resend = getResend();
  const link = buildInviteLink(token);

  if (!resend) {
    console.warn(
      `[EMAIL] RESEND_API_KEY not set — invite link for ${toEmail}: ${link}`,
    );
    return false;
  }

  const { error } = await resend.emails.send({
    from: getFrom(),
    to: toEmail,
    subject: "Completa l'iscrizione del tuo bambino — Campetto ⚽",
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#4caf50">Campetto ⚽</h2>
        <p>Sei stato invitato a registrare il tuo bambino nella squadra.</p>
        <p>Clicca sul link per completare l'iscrizione (valido 48 ore):</p>
        <a href="${link}" style="display:inline-block;background:#4caf50;color:#fff;
          padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold">
          Completa iscrizione
        </a>
        <p style="color:#888;font-size:12px;margin-top:20px">
          Se non riesci a cliccare, copia questo link: ${link}
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("[EMAIL] Resend error:", error);
    throw new Error(`Invio email fallito: ${error.message}`);
  }

  return true;
}

// ── Notify admin of new registration ────────────────────────────────────────

export async function sendAdminNotification(
  nomeGiocatore: string,
  emailGenitore: string,
): Promise<void> {
  const resend = getResend();
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!resend || !adminEmail) {
    console.log(
      `[EMAIL] Nuova iscrizione: ${nomeGiocatore} (genitore: ${emailGenitore})`,
    );
    return;
  }

  const { error } = await resend.emails.send({
    from: getFrom(),
    to: adminEmail,
    subject: `Nuova iscrizione: ${nomeGiocatore}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto">
        <h2 style="color:#4caf50">Campetto ⚽</h2>
        <p>Un genitore ha completato l'iscrizione del bambino:</p>
        <ul>
          <li><strong>Bambino:</strong> ${nomeGiocatore}</li>
          <li><strong>Email genitore:</strong> ${emailGenitore}</li>
        </ul>
        <p>Accedi al gestionale per visualizzare la scheda completa.</p>
      </div>
    `,
  });

  if (error) {
    console.error("[EMAIL] Resend admin notification error:", error);
    // Non-fatal: log only, don't throw
  }
}
