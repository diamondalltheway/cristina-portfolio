// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import ContactSection from './ContactSection.svelte';
import { POST } from '../../routes/api/contact/+server';

vi.mock('$env/dynamic/private', () => ({
  env: { SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/TEST/TEST/test' },
}));

const submission = {
  email: 'client@example.com',
  subject: 'A new email project',
  message: 'Hello Cristina, I would love to work together.',
};

function mountForm(delivery = vi.fn<typeof fetch>().mockResolvedValue(new Response('ok'))) {
  // Keep the real form and API handler connected; only replace browser transport and Slack.
  const transport = vi.fn<typeof fetch>().mockImplementation(async (input, init) => {
    const url = new URL(String(input), window.location.href);
    const headers = new Headers(init?.headers);
    headers.set('Origin', window.location.origin);
    const request = new Request(url, { ...init, headers });
    expect(url.pathname).toBe('/api/contact');
    expect(request.method).toBe('POST');
    return POST({ request, url, fetch: delivery } as unknown as Parameters<typeof POST>[0]);
  });
  vi.stubGlobal('fetch', transport);

  const view = render(ContactSection);
  const form = view.container.querySelector<HTMLFormElement>('#contact-form')!;
  const status = view.container.querySelector<HTMLDivElement>('#form-status')!;
  const button = view.getByRole('button') as HTMLButtonElement;
  const email = view.getByLabelText(/YOUR EMAIL/) as HTMLInputElement;
  const subject = view.getByLabelText(/SUBJECT/) as HTMLInputElement;
  const message = view.getByLabelText(/MESSAGE/) as HTMLTextAreaElement;

  async function fill(values = submission) {
    await fireEvent.input(email, { target: { value: values.email } });
    await fireEvent.input(subject, { target: { value: values.subject } });
    await fireEvent.input(message, { target: { value: values.message } });
  }

  return { form, status, button, email, subject, message, fill, transport, delivery };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('contact form build verification', () => {
  it('requires all fields and a valid email before sending a request', async () => {
    const ui = mountForm();
    await fireEvent.submit(ui.form);
    for (const field of [ui.email, ui.subject, ui.message]) {
      expect(field.required).toBe(true);
      expect(field.validity.valueMissing).toBe(true);
    }
    await ui.fill({ ...submission, email: 'invalid-email' });
    await fireEvent.submit(ui.form);
    expect(ui.email.validity.typeMismatch).toBe(true);
    expect(ui.transport).not.toHaveBeenCalled();
    expect(ui.delivery).not.toHaveBeenCalled();
  });

  it('sends the form through the real API and waits for delivery before showing success', async () => {
    let acknowledge!: (response: Response) => void;
    const delivery = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          acknowledge = resolve;
        }),
    );
    const ui = mountForm(delivery);
    await ui.fill();
    await fireEvent.submit(ui.form);
    await waitFor(() => expect(delivery).toHaveBeenCalledOnce());
    expect(ui.form.getAttribute('aria-busy')).toBe('true');
    expect(ui.button.disabled).toBe(true);
    expect(ui.button.textContent).toContain('SENDING');
    expect(ui.form.hidden).toBe(false);
    expect(ui.status.hidden).toBe(true);

    const notification = String(delivery.mock.calls[0][1]?.body);
    for (const value of Object.values(submission)) expect(notification).toContain(value);
    acknowledge(new Response('ok'));
    await waitFor(() => expect(ui.status.textContent).toContain('THANK YOU!'));
    expect(ui.status.classList.contains('success')).toBe(true);
    expect(ui.status.hidden).toBe(false);
    expect(ui.form.hidden).toBe(true);
    expect(document.activeElement).toBe(ui.status);
    expect(ui.transport).toHaveBeenCalledOnce();
  });

  it('preserves the message after a delivery failure and succeeds when the visitor retries', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const delivery = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response('invalid_token', { status: 403 }))
      .mockResolvedValueOnce(new Response('ok'));
    const ui = mountForm(delivery);
    await ui.fill();
    await fireEvent.submit(ui.form);
    await waitFor(() => expect(ui.status.textContent).toContain('Unable to deliver your message'));
    expect(ui.status.classList.contains('error')).toBe(true);
    expect(ui.form.hidden).toBe(false);
    expect(ui.button.disabled).toBe(false);
    expect(ui.email.value).toBe(submission.email);
    expect(ui.subject.value).toBe(submission.subject);
    expect(ui.message.value).toBe(submission.message);
    expect(document.activeElement).toBe(ui.status);

    await fireEvent.submit(ui.form);
    await waitFor(() => expect(ui.status.textContent).toContain('THANK YOU!'));
    expect(ui.form.hidden).toBe(true);
    expect(ui.transport).toHaveBeenCalledTimes(2);
    expect(delivery).toHaveBeenCalledTimes(2);
  });

  it('shows a connection error and keeps the form usable after a network failure', async () => {
    const ui = mountForm();
    ui.transport.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await ui.fill();
    await fireEvent.submit(ui.form);
    await waitFor(() => expect(ui.status.textContent).toContain('Check your connection'));
    expect(ui.form.hidden).toBe(false);
    expect(ui.message.value).toBe(submission.message);
    expect(ui.button.disabled).toBe(false);
    expect(ui.delivery).not.toHaveBeenCalled();

    await fireEvent.submit(ui.form);
    await waitFor(() => expect(ui.status.textContent).toContain('THANK YOU!'));
    expect(ui.form.hidden).toBe(true);
    expect(ui.delivery).toHaveBeenCalledOnce();
  });
});
