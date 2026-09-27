<script>
  import { tick } from 'svelte';

  let form;
  let status;
  let state = $state('idle');
  let statusText = $state('');

  async function submit(event) {
    event.preventDefault();
    if (state === 'sending' || !form.reportValidity()) return;
    state = 'sending';
    statusText = '';
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      state = 'success';
      statusText = 'THANK YOU! YOUR MESSAGE IS IN. ✦';
    } catch (error) {
      state = 'error';
      statusText = error instanceof TypeError
        ? 'Unable to submit. Check your connection and try again.'
        : error.message;
    }
    await tick();
    status.focus({ preventScroll: true });
  }
</script>

<section id="contact" class="contact section-pad" aria-labelledby="contact-heading"><h2 id="contact-heading">LET’S ELEVATE YOUR EMAIL <br>MARKETING WITH STANDOUT <br>DESIGNS <span>🚀</span></h2><div class="contact-grid"><div class="contact-copy"><p>Ready for emails that feel unmistakably you? Tell me a little about your brand and what you have in mind. Let’s make something worth opening.</p><svg class="starburst contact-star" aria-hidden="true"><use href="#burst"/></svg><p class="contact-location">From Medellín, Colombia<br>to inboxes all over the world.</p></div><div class="contact-form-wrap"><form bind:this={form} id="contact-form" action="/api/contact" method="post" onsubmit={submit} hidden={state === 'success'} aria-busy={state === 'sending' ? 'true' : undefined}><div class="form-field"><label for="email">YOUR EMAIL <span>(required)</span></label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required></div><div class="form-field"><label for="subject">SUBJECT <span>(required)</span></label><input id="subject" name="subject" type="text" maxlength="500" required></div><div class="form-field"><label for="message">MESSAGE <span>(required)</span></label><textarea id="message" name="message" rows="5" maxlength="10000" required></textarea></div><button type="submit" class="pill pill-dark" disabled={state === 'sending'}>{#if state === 'sending'}SENDING…{:else}LET’S CHAT <span aria-hidden="true">→</span>{/if}</button></form><div bind:this={status} id="form-status" role="status" aria-live="polite" tabindex="-1" hidden={!statusText} class:success={state === 'success'} class:error={state === 'error'}>{statusText}</div></div></div></section>
