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
    <a class="brand" href="#home" aria-label="Cristina Lalinde, home"
      >CRISTINA LALINDE <span class="brand-emoji">🐅</span></a
    >
    <span class="brand-tagline">EXPERT EMAIL DESIGNER</span>
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
