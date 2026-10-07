<script lang="ts">
  import { onMount } from 'svelte';

  let isOpen = $state(false);
  let menuButton: HTMLButtonElement;
  let navigation: HTMLElement;

  function closeMenu(restoreFocus = false) {
    isOpen = false;
    if (restoreFocus) menuButton.focus();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!isOpen) return;
    if (event.key === 'Escape') closeMenu(true);
    if (event.key === 'Tab') {
      const links = [...navigation.querySelectorAll('a')];
      if (event.shiftKey && document.activeElement === menuButton) {
        event.preventDefault();
        links.at(-1)?.focus();
      } else if (!event.shiftKey && document.activeElement === links.at(-1)) {
        event.preventDefault();
        menuButton.focus();
      }
    }
  }

  $effect(() => {
    document.body.classList.toggle('menu-open', isOpen);
  });

  onMount(() => {
    const desktop = matchMedia('(min-width: 701px)');
    const resized = (event: MediaQueryListEvent) => {
      if (event.matches) closeMenu();
    };
    desktop.addEventListener('change', resized);
    return () => {
      desktop.removeEventListener('change', resized);
      document.body.classList.remove('menu-open');
    };
  });
</script>

<svelte:window onkeydown={handleKeydown} />

<header class="site-header">
  <div class="brand-lockup">
    <a class="brand" href="#home" aria-label="Cristina Lalinde, home">
      <span aria-hidden="true"
        >CRISTINA LAL<span class="brand-star-letter"
          >I<svg class="brand-star" viewBox="0 0 100 100" focusable="false"
            ><path
              d="M50 1C55 34 66 45 99 50C66 55 55 66 50 99C45 66 34 55 1 50C34 45 45 34 50 1Z"
            /></svg
          ></span
        >NDE</span
      >
      <span class="brand-emoji" aria-hidden="true">🐆</span>
    </a>
    <span class="brand-tagline">Creative designer that makes pretty emails</span>
  </div>
  <button
    bind:this={menuButton}
    class="menu-toggle"
    aria-label={isOpen ? 'Close menu' : 'Open menu'}
    aria-expanded={isOpen}
    aria-controls="site-nav"
    onclick={() => {
      isOpen = !isOpen;
    }}
  >
    <span></span><span></span>
  </button>
  <nav bind:this={navigation} id="site-nav" class:is-open={isOpen} aria-label="Main navigation">
    <a href="#services" onclick={() => closeMenu()}>Services</a>
    <a href="#work" onclick={() => closeMenu()}>Work</a>
    <a href="#about" onclick={() => closeMenu()}>About</a>
    <a href="#contact" onclick={() => closeMenu()}>Contact <span>↗</span></a>
  </nav>
</header>
