<script>
  import { onMount, tick } from 'svelte';
  import { projects } from '$lib/data/projects.js';

  let currentProject = $state(0);
  let hasOpened = $state(false);
  const project = $derived(projects[currentProject]);
  let dialog;
  let imageWrap;
  let opener;
  let focusAfterClose;

  async function showProject(index) {
    currentProject = (index + projects.length) % projects.length;
    await tick();
    dialog.scrollTop = 0;
    imageWrap.scrollLeft = 0;
  }

  async function openProject(index, event) {
    opener = event.currentTarget;
    hasOpened = true;
    await showProject(index);
    dialog.showModal();
    document.body.classList.add('modal-open');
  }

  function handleKeydown(event) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showProject(currentProject + (event.key === 'ArrowRight' ? 1 : -1));
    }
  }

  function closeOnBackdrop(event) {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }

  function restoreFocus() {
    document.body.classList.remove('modal-open');
    (focusAfterClose || opener)?.focus({ preventScroll: true });
    focusAfterClose = undefined;
  }

  function contact() {
    focusAfterClose = document.querySelector('#contact-heading');
    focusAfterClose.setAttribute('tabindex', '-1');
    dialog.close();
  }

  onMount(() => () => document.body.classList.remove('modal-open'));
</script>

<section id="work" class="work" aria-labelledby="work-heading">
  <h2 id="work-heading" class="work-heading">MY WORK <span aria-hidden="true">✦ MY WORK ✦ MY WORK</span></h2>
  <div class="work-grid section-inset">
    {#each projects as item, index (item.src)}
      <button class="project-card" aria-label={item.label} onclick={event => openProject(index, event)}>
        <span class="project-image">
          <img src={item.src} width={item.width} height={item.height} alt={item.alt} loading="lazy" />
          <span class="project-open" aria-hidden="true">↗</span>
        </span>
        <span class="project-caption"><strong>{item.title}</strong><span>EMAIL DESIGN ↗</span></span>
      </button>
    {/each}
  </div>
  <div class="work-outro section-inset">
    <h3>YOUR BRAND COULD<br />BE NEXT.</h3>
    <a class="pill pill-dark" href="#contact">LET’S MAKE SOMETHING GREAT <span>→</span></a>
  </div>
</section>

<dialog bind:this={dialog} id="project-dialog" aria-labelledby="project-title" onkeydown={handleKeydown} onclick={closeOnBackdrop} onclose={restoreFocus}>
  <div class="dialog-top"><span class="eyebrow">SELECTED EMAIL DESIGNS</span><button class="dialog-close" aria-label="Close project" onclick={() => dialog.close()}>✕</button></div>
  <h2 id="project-title">{project.title}</h2>
  <div bind:this={imageWrap} class="dialog-image-wrap">
    {#if hasOpened}<img id="project-detail-image" src={project.src} alt={project.alt} />{/if}
  </div>
  <div class="dialog-bottom">
    <button class="project-prev" aria-label="Previous project" onclick={() => showProject(currentProject - 1)}>← <span>PREVIOUS</span></button>
    <span id="project-counter" aria-live="polite">{currentProject + 1} / {projects.length}</span>
    <button class="project-next" aria-label="Next project" onclick={() => showProject(currentProject + 1)}><span>NEXT</span> →</button>
  </div>
  <a class="pill pill-dark dialog-contact" href="#contact" onclick={contact}>LET’S WORK TOGETHER <span>→</span></a>
</dialog>
