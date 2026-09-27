<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { projects } from '$lib/data/projects';

  let currentProject = $state(0);
  let hasOpened = $state(false);
  const project = $derived(projects[currentProject]);
  let dialog: HTMLDialogElement;
  let imageWrap: HTMLDivElement;
  let opener: HTMLElement | undefined;
  let focusAfterClose: HTMLElement | undefined;

  async function showProject(index: number) {
    currentProject = (index + projects.length) % projects.length;
    await tick();
    dialog.scrollTop = 0;
    imageWrap.scrollLeft = 0;
  }

  async function openProject(index: number, event: MouseEvent) {
    opener = event.currentTarget as HTMLButtonElement;
    hasOpened = true;
    await showProject(index);
    dialog.showModal();
    document.body.classList.add('modal-open');
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showProject(currentProject + (event.key === 'ArrowRight' ? 1 : -1));
    }
  }

  function closeOnBackdrop(event: MouseEvent) {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  }

  function restoreFocus() {
    document.body.classList.remove('modal-open');
    (focusAfterClose || opener)?.focus({ preventScroll: true });
    focusAfterClose = undefined;
  }

  function contact() {
    focusAfterClose = document.querySelector<HTMLElement>('#contact-heading') ?? undefined;
    focusAfterClose?.setAttribute('tabindex', '-1');
    dialog.close();
  }

  onMount(() => () => document.body.classList.remove('modal-open'));
</script>

<section id="work" class="work" aria-labelledby="work-heading">
  <h2 id="work-heading" class="work-heading">
    <span aria-hidden="true">✦</span> BEST EMAIL DESIGNS <span aria-hidden="true">✦</span>
  </h2>
  <div class="work-grid section-inset">
    {#each projects as item, index (item.src)}
      <button
        class="project-card"
        aria-label={item.label}
        onclick={(event) => openProject(index, event)}
      >
        <span class="project-image">
          <img
            src={item.src}
            width={item.width}
            height={item.height}
            alt={item.alt}
            loading="lazy"
          />
          <span class="project-open" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 19 19 5M5 5h14v14" />
            </svg>
          </span>
        </span>
        <span class="project-caption"><strong>{item.title}</strong><span>EMAIL DESIGN ↗</span></span
        >
      </button>
    {/each}
  </div>
  <div class="work-outro section-inset">
    <h3>YOUR BRAND COULD<br />BE NEXT.</h3>
    <a class="pill pill-dark" href="#contact">LET’S MAKE SOMETHING GREAT <span>→</span></a>
  </div>
</section>

<dialog
  bind:this={dialog}
  id="project-dialog"
  aria-labelledby="project-title"
  onkeydown={handleKeydown}
  onclick={closeOnBackdrop}
  onclose={restoreFocus}
>
  <div class="dialog-top">
    <span class="eyebrow">SELECTED EMAIL DESIGNS</span><button
      class="dialog-close"
      aria-label="Close project"
      onclick={() => dialog.close()}>✕</button
    >
  </div>
  <h2 id="project-title">{project.title}</h2>
  <div bind:this={imageWrap} class="dialog-image-wrap">
    {#if hasOpened}<img id="project-detail-image" src={project.src} alt={project.alt} />{/if}
  </div>
  <div class="dialog-bottom">
    <button
      class="project-prev"
      aria-label="Previous project"
      onclick={() => showProject(currentProject - 1)}>← <span>PREVIOUS</span></button
    >
    <span id="project-counter" aria-live="polite">{currentProject + 1} / {projects.length}</span>
    <button
      class="project-next"
      aria-label="Next project"
      onclick={() => showProject(currentProject + 1)}><span>NEXT</span> →</button
    >
  </div>
  <a class="pill pill-dark dialog-contact" href="#contact" onclick={contact}
    >LET’S WORK TOGETHER <span>→</span></a
  >
</dialog>
