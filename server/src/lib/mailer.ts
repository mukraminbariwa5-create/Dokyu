/**
 * Email sending. In development the "email" is printed to the server log so no email account is needed;
 * a real provider (Resend or Brevo free tier) is plugged in at deployment (plan §5.1).
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
