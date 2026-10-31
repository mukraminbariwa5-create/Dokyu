/**
 * Email sending. In development the "email" is printed to the server log so no email account is needed;
 * a real provider (Brevo or Resend, both over HTTPS: Render's free plan blocks SMTP) is plugged in at
 * deployment (plan §5.1).
 */
export interface Mail {
  to: string;
  subject: string;
  text: string;
}

export interface Mailer {
  send(mail: Mail): Promise<void>;
}

export class LogMailer implements Mailer {
  /** Kept in memory so tests can read the links that were "sent". */
  readonly outbox: Mail[] = [];
  constructor(private readonly print = true) {}
  async send(mail: Mail): Promise<void> {
    this.outbox.push(mail);
    if (this.print) {
      console.log(
        `\n✉️  Email to ${mail.to}\n   Subject: ${mail.subject}\n   ${mail.text.replace(/\n/g, '\n   ')}\n`,
      );
    }
  }
}

/** Sends real email through Resend's HTTP API (free tier). */
export class ResendMailer implements Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}
  async send(mail: Mail): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: this.from,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
      }),
    });
    // Never throw to the user: sign-up and reset answer the same way whether or not email worked.
    if (!res.ok) console.error(`Email to provider failed with status ${res.status}`);
  }
}

/** "Dokyu <no-reply@x.com>" or "no-reply@x.com" → name and address. */
export function parseFrom(from: string): { name?: string; email: string } {
  const m = from.match(/^\s*(.*?)\s*<\s*([^>]+?)\s*>\s*$/);
  if (m) return { ...(m[1] ? { name: m[1].replace(/^"|"$/g, '') } : {}), email: m[2]! };
  return { email: from.trim() };
}

/**
 * Sends real email through Brevo's HTTP API (free: 300 emails a day). Works without owning a domain:
 * the sender address only has to be verified in Brevo (Brevo may show its own sending address for
 * free email providers such as Gmail until a domain is authenticated).
 */
export class BrevoMailer implements Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}
  async send(mail: Mail): Promise<void> {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: parseFrom(this.from),
          to: [{ email: mail.to }],
          subject: mail.subject,
          textContent: mail.text,
        }),
      });
      // Never throw to the user: sign-up and reset answer the same way whether or not email worked.
      if (!res.ok) console.error(`Email to provider failed with status ${res.status}`);
    } catch {
      console.error('Email provider could not be reached');
    }
  }
}

/** Production without an email provider: sends nothing and never writes links (secrets) to the log. */
export class NoMailer implements Mailer {
  async send(): Promise<void> {}
}
