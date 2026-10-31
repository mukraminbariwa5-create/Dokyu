/** Email providers: the request Brevo receives, and the sender format. */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrevoMailer, parseFrom } from '../src/lib/mailer.js';

describe('mailer', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads "Name <address>" and plain addresses', () => {
    expect(parseFrom('Dokyu <no-reply@example.com>')).toEqual({
      name: 'Dokyu',
      email: 'no-reply@example.com',
    });
    expect(parseFrom('"Dokyu PH" <a@b.co>')).toEqual({ name: 'Dokyu PH', email: 'a@b.co' });
    expect(parseFrom(' a@b.co ')).toEqual({ email: 'a@b.co' });
  });

  it('sends through the Brevo API with the key in a header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);
    await new BrevoMailer('key-123', 'Dokyu <me@gmail.com>').send({
      to: 'ana@example.com',
      subject: 'Reset your password',
      text: 'Open this link',
    });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect(init.headers['api-key']).toBe('key-123');
    expect(JSON.parse(init.body)).toEqual({
      sender: { name: 'Dokyu', email: 'me@gmail.com' },
      to: [{ email: 'ana@example.com' }],
      subject: 'Reset your password',
      textContent: 'Open this link',
    });
  });

  it('never throws when the provider fails or is unreachable', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('no', { status: 401 })));
    await expect(
      new BrevoMailer('k', 'a@b.co').send({ to: 'x@y.z', subject: 's', text: 't' }),
    ).resolves.toBeUndefined();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    await expect(
      new BrevoMailer('k', 'a@b.co').send({ to: 'x@y.z', subject: 's', text: 't' }),
    ).resolves.toBeUndefined();
  });
});
