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
    ><symbol id="asterisk-solid" viewBox="160 100 740 840"
      ><path
        d="M540 138 603 125Q625 120 620 143L593 348Q588 371 608 360L764 231Q780 220 793 233L833 263Q846 274 831 293L755 380 665 465Q649 480 664 491L871 617Q891 629 875 642L832 672Q820 682 801 676L638 617Q616 607 627 629L718 857Q726 876 708 882L649 906Q628 917 619 897L530 737Q516 712 508 740L454 900Q448 915 430 917 410 920 413 899L423 627Q429 599 408 614L248 720Q231 735 219 721L190 691Q177 677 192 666L382 535Q406 520 384 509L205 419Q185 411 203 393 213 379 236 386L365 411Q389 416 381 394L327 241Q315 216 340 209L368 202Q387 194 398 217L458 327Q480 358 486 338L525 159Q528 141 540 138Z"
        fill="currentColor"
      /></symbol
    ><symbol id="asterisk-outline" viewBox="130 120 410 440"
      ><path
        d="M314 140 357 141Q368 140 367 151L363 256Q362 270 371 260L438 169Q445 158 453 168L482 201Q490 208 481 218L423 291Q412 305 428 301L493 291Q504 288 506 301L512 326Q514 335 502 337L440 350Q426 352 440 361L514 406Q525 413 517 424L488 459Q482 468 472 461L412 413Q400 403 403 420L418 497Q421 508 409 512L340 535Q330 538 331 525L327 448Q328 433 320 445L276 525Q270 538 259 531L222 510Q212 505 218 494L260 427Q269 413 254 420L182 450Q169 457 168 443L160 383Q158 373 169 370L248 340Q263 335 250 326L155 261Q144 254 156 244L200 207Q208 199 219 208L291 269Q303 281 302 265L304 151Q304 139 314 140Z"
        fill="none"
        stroke="currentColor"
        stroke-width="5"
        stroke-linejoin="round"
      /></symbol
    ><symbol id="star-solid" viewBox="110 100 390 380"
      ><path
        d="M211 124 274 193Q282 203 290 194L346 129Q356 117 359 133L370 198Q371 207 381 204L434 184Q452 177 442 194L402 264Q396 275 408 281L467 306Q482 313 466 319L387 346Q377 349 380 360L385 445Q387 463 374 450L305 383Q297 375 286 382L190 444Q174 455 180 436L207 332Q211 321 200 315L139 276Q124 267 142 262L199 246Q211 244 209 232L205 130Q203 115 211 124Z"
        fill="currentColor"
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
  <div class="ticker ticker-coral" aria-label="Emails with personality">
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
      <div class="phone phone-intro">
        <div class="phone-screen email-stack">
          <img
            src="/assets/arcian-stack-moment.png"
            width="252"
            height="804"
            alt="Arcian’s The Stack Moment jewelry email designed by Cristina, featuring colorful stacking rings"
            loading="lazy"
          />
        </div>
      </div>
      <span class="visual-caption">SMALL SCREENS. BIG IDEAS.</span><svg
        class="starburst intro-star"
        aria-hidden="true"><use href="#asterisk-solid" /></svg
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
        /><svg class="starburst service-star" aria-hidden="true"><use href="#star-solid" /></svg>
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
      <img
        class="about-portrait"
        src="/assets/cristina-lalinde.jpg"
        alt="Cristina Lalinde smiling while seated in an armchair"
        width="901"
        height="901"
        loading="lazy"
      />
      <div class="about-location">
        <span>BASED IN MEDELLÍN <span class="location-emoji">🇨🇴</span></span>
        <span>CREATING FOR BRANDS EVERYWHERE <span class="location-emoji">🌎</span></span>
      </div>
    </div>
  </section>
  <div class="ticker ticker-mint" aria-label="Good design, great connections">
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
