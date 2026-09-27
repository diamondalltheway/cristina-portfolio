<script lang="ts">
  import SiteHeader from '$lib/components/SiteHeader.svelte';
  import WorkGallery from '$lib/components/WorkGallery.svelte';
  import ContactSection from '$lib/components/ContactSection.svelte';

  const year = new Date().getFullYear();
</script>

<svelte:head>
  <title>Cristina Lalinde — Graphic &amp; Email Designer</title>
  <meta
    name="description"
    content="Cristina Lalinde — graphic and email designer from Medellín, Colombia. Distinctive email design for brands around the globe."
  />
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>
<svg class="svg-definitions" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
  ><defs
    ><symbol id="burst" viewBox="0 0 200 200"
      ><path
        d="M100 4 111 68 138 12 132 77 171 29 148 89 193 63 157 103 198 103 155 118 183 146 142 132 150 183 123 146 112 199 105 153 78 192 87 149 43 179 70 134 10 145 60 115 1 102 60 97 7 60 67 80 33 23 82 69 70 3 96 66Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      /></symbol
    ><symbol id="arrow" viewBox="0 0 24 24"
      ><path
        d="M5 12h14M12 5l7 7-7 7"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
      /></symbol
    ></defs
  ></svg
>
<SiteHeader />
<main id="main">
  <section id="home" class="hero" aria-labelledby="hero-heading">
    <div class="hero-stage">
      <div class="stage-orbit" aria-hidden="true"></div>
      <p class="stage-note">A LITTLE STRATEGY.<br />A LOT OF PERSONALITY.</p>
      <div
        class="phone phone-left"
        role="img"
        aria-label="Cristina's colorful pet clothing email design"
      >
        <div class="phone-screen email-pets"></div>
      </div>
      <div
        class="phone phone-main"
        role="img"
        aria-label="Cristina's jewelry email design displayed on a phone"
      >
        <div class="phone-screen email-jewelry"></div>
      </div>
      <div class="phone phone-right" role="img" aria-label="Cristina's Crude skincare email design">
        <div class="phone-screen email-skincare"></div>
      </div>
      <a class="stage-link" href="#work" aria-label="Explore my email designs"
        ><svg><use href="#arrow" /></svg></a
      ><span class="stage-caption">EMAIL DESIGN, BY CRISTINA</span>
    </div>
    <h1 id="hero-heading">HEY, I’M CRISTINA</h1>
  </section>
  <div class="ticker ticker-orange" aria-label="Emails with personality">
    <div class="ticker-track" aria-hidden="true">
      <span
        >EMAILS WITH PERSONALITY <b>✦</b> EMAILS WITH PERSONALITY <b>✦</b> EMAILS WITH PERSONALITY
        <b>✦</b></span
      ><span
        >EMAILS WITH PERSONALITY <b>✦</b> EMAILS WITH PERSONALITY <b>✦</b> EMAILS WITH PERSONALITY
        <b>✦</b></span
      >
    </div>
  </div>
  <section class="intro section-pad" aria-labelledby="intro-heading">
    <div class="intro-copy">
      <p class="eyebrow">FROM MEDELLÍN, WITH LOVE 🇨🇴</p>
      <h2 id="intro-heading">YOUR NEXT<br />EMAIL DESERVES<br />TO STAND OUT.</h2>
      <p>
        I’m Cristina, a graphic and email designer working with clients all over the globe. I turn
        brand stories into visually engaging emails that feel as good as they look.
      </p>
      <p>
        With 7+ years in marketing, visual design, and branding, I bring creativity and a little
        strategy to every inbox. Clear communication, thoughtful details, and deadlines met? Always.
      </p>
      <a class="pill pill-outline" href="#work">VIEW MY WORK <span>→</span></a>
    </div>
    <div class="intro-visual">
      <div
        class="phone phone-intro"
        role="img"
        aria-label="A Crude skincare email designed by Cristina"
      >
        <div class="phone-screen email-skincare"></div>
      </div>
      <span class="visual-caption">SMALL SCREENS. BIG IDEAS.</span><svg
        class="starburst intro-star"
        aria-hidden="true"><use href="#burst" /></svg
      >
    </div>
  </section>
  <section id="services" class="services zigzag" aria-labelledby="services-heading">
    <div class="service-wave" aria-hidden="true">
      <svg viewBox="0 0 1440 240" preserveAspectRatio="xMidYMid slice"
        ><defs><path id="wave-path" d="M-250 140 Q100 260 450 130 T1150 130 T1850 130" /></defs
        ><text
          ><textPath href="#wave-path"
            >MY SERVICES ✦ MY SERVICES ✦ MY SERVICES ✦ MY SERVICES ✦</textPath
          ></text
        ></svg
      >
    </div>
    <div class="services-lead">
      <div class="service-visual">
        <img
          src="/assets/earth-harbor-emails.gif"
          width="1112"
          height="1112"
          alt="Animated collection of Cristina's Earth Harbor email campaigns"
          loading="lazy"
        /><svg class="starburst service-star" aria-hidden="true"><use href="#burst" /></svg>
      </div>
      <div class="services-copy">
        <p class="eyebrow">DESIGNED TO CONNECT</p>
        <h2 id="services-heading">GOODBYE, BORING<br />EMAIL TEMPLATES.</h2>
        <p>
          Your brand has a personality. Your emails should, too. Let’s bring it to life with
          distinctive design that catches the eye, tells your story, and gives your customers a
          reason to click.
        </p>
        <p class="eyebrow clients-label">A FEW CLIENTS I’VE WORKED WITH</p>
        <div class="client-names">
          <span class="skyro-logo"
            ><img
              src="/assets/skyro-digital.svg"
              alt="Skyro Digital"
              width="330"
              height="68"
            /></span
          ><span class="mineral-logo">mineral.io</span><span class="earth-logo"
            >EARTH<br />HARBOR</span
          ><span>SALES FLOW<br /><small>MARKETING</small></span>
        </div>
      </div>
    </div>
    <div class="service-list">
      <article>
        <span class="service-number">01.</span>
        <h3>EMAIL CAMPAIGNS</h3>
        <p>
          Fresh launches, seasonal moments, and everyday brand stories. Thoughtfully designed
          campaigns that bring your message to life, with a consistent look and a clear call to
          action.
        </p>
      </article>
      <article>
        <span class="service-number">02.</span>
        <h3>EMAIL FLOWS</h3>
        <p>
          A great first hello. A timely reminder. A reason to come back. Cohesive email designs that
          help your brand connect with customers throughout their journey.
        </p>
      </article>
    </div>
    <a class="pill pill-dark services-cta" href="#contact"
      >LET’S TALK ABOUT YOUR PROJECT <span>→</span></a
    >
  </section>
  <WorkGallery />
  <section id="about" class="about section-pad" aria-labelledby="about-heading">
    <div class="about-copy">
      <p class="eyebrow">THE DESIGNER BEHIND THE EMAILS</p>
      <h2 id="about-heading">LET’S GET<br />ACQUAINTED.</h2>
      <p>
        Hey there! I’m Cristina, from Medellín, Colombia — working with clients all over the globe.
      </p>
      <p>
        For more than seven years, I’ve focused my career on marketing, visual design, and branding,
        with an emphasis on creating emails that convert.
      </p>
      <p>
        I pride myself on understanding what a client needs and delivering thoughtful work with
        minimal direction. I value clear communication, and your deadlines are my priority.
      </p>
      <a class="pill pill-pink" href="#contact">SAY HELLO <span>→</span></a>
    </div>
    <div class="about-art">
      <svg class="starburst about-star" aria-hidden="true"><use href="#burst" /></svg>
      <p class="about-years">7<span>+</span></p>
      <p class="about-art-label">YEARS OF IDEAS.<br />ENDLESS POSSIBILITIES.</p>
      <div class="about-location">
        <span>BASED IN MEDELLÍN <span class="location-emoji">🇨🇴</span></span>
        <span>CREATING FOR BRANDS EVERYWHERE <span class="location-emoji">🌎</span></span>
      </div>
    </div>
  </section>
  <div class="ticker ticker-orange" aria-label="Good design, great connections">
    <div class="ticker-track" aria-hidden="true">
      <span>GOOD DESIGN. GREAT CONNECTIONS. <b>✦</b> GOOD DESIGN. GREAT CONNECTIONS. <b>✦</b></span
      ><span>GOOD DESIGN. GREAT CONNECTIONS. <b>✦</b> GOOD DESIGN. GREAT CONNECTIONS. <b>✦</b></span
      >
    </div>
  </div>
  <ContactSection />
</main>
<footer class="site-footer section-inset">
  <div class="footer-top">
    <p>
      Graphic & email designer<br />based in Medellín, Colombia 📍<br />Working with clients all
      over the globe.
    </p>
    <nav aria-label="Footer navigation">
      <a href="#work">WORK</a><a href="#services">SERVICES</a><a href="#about">ABOUT</a><a
        href="#contact">CONTACT ME</a
      >
    </nav>
    <a class="back-to-top" href="#home">BACK TO TOP <span>↑</span></a>
  </div>
  <a class="footer-brand" href="#home">CRISTINA LALINDE</a>
  <div class="footer-bottom">
    <span>© <span id="year">{year}</span> CRISTINA LALINDE</span><span
      >A LITTLE STRATEGY. A LOT OF PERSONALITY.</span
    >
  </div>
</footer>
