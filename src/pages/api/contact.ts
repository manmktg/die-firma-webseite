import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();

    const vorname = data.get('vorname')?.toString().trim() ?? '';
    const nachname = data.get('nachname')?.toString().trim() ?? '';
    const email = data.get('email')?.toString().trim() ?? '';
    const honeypot = data.get('_honeypot')?.toString() ?? '';

    // Spam-Check
    if (honeypot) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // Validierung
    if (!vorname || !nachname || !email) {
      return new Response(JSON.stringify({ error: 'Pflichtfelder fehlen' }), { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Ungültige E-Mail' }), { status: 400 });
    }

    // CUSTOMIZE: RESEND_API_KEY als Umgebungsvariable in Vercel setzen
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    // CUSTOMIZE: Empfänger-E-Mail
    const TO_EMAIL = 'kontakt@diefirma.de';

    if (!RESEND_API_KEY) {
      console.log(`[Kontaktanfrage] ${vorname} ${nachname} <${email}>`);
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // CUSTOMIZE: Absender nach Domain-Setup in Vercel anpassen
        from: 'die Firma Website <kontakt@diefirma.de>',
        to: [TO_EMAIL],
        reply_to: email,
        subject: `Neue Anfrage: ${vorname} ${nachname}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;">
            <h2 style="color:#10b2ad;">Neue Kontaktanfrage</h2>
            <p><strong>Name:</strong> ${vorname} ${nachname}</p>
            <p><strong>E-Mail:</strong> <a href="mailto:${email}">${email}</a></p>
            <hr style="border-color:#eee;margin:1rem 0;">
            <p style="color:#888;font-size:12px;">Eingegangen über das Kontaktformular auf die-firma.de</p>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      console.error('[Resend Error]', await resendRes.text());
      return new Response(JSON.stringify({ error: 'E-Mail konnte nicht gesendet werden' }), { status: 500 });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });

  } catch (err) {
    console.error('[Contact API Error]', err);
    return new Response(JSON.stringify({ error: 'Interner Fehler' }), { status: 500 });
  }
};
