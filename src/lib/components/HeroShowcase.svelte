<script lang="ts">
  import { heroScreens } from '$lib/data/heroScreens';
</script>

<svg
  class="warm-hero-art"
  viewBox="0 0 1672 941"
  preserveAspectRatio="xMidYMid slice"
  role="img"
  aria-label="Original Little Beast, Arcian jewelry and Crude skincare email designs displayed on three smartphones on a sunlit cream tabletop"
>
  <defs>
    {#each heroScreens as screen (screen.id)}
      <mask
        id={`hero-screen-${screen.id}`}
        maskUnits="userSpaceOnUse"
        style="mask-type: alpha"
        x="0"
        y="0"
        width="1672"
        height="941"
      >
        <path
          d={screen.clip}
          fill="white"
          stroke="white"
          stroke-width="4"
          stroke-linejoin="round"
        />
      </mask>
    {/each}
  </defs>
  <image
    href="/assets/warm-email-hero-background.jpg"
    width="1672"
    height="941"
    preserveAspectRatio="none"
  />
  {#each heroScreens as screen (screen.id)}
    <g mask={`url(#hero-screen-${screen.id})`}>
      <foreignObject width="1672" height="941">
        <div class="hero-screen-canvas">
          <div class="hero-email-screen" style:transform={screen.transform}>
            <img src={screen.src} alt="" decoding="async" fetchpriority="high" />
          </div>
        </div>
      </foreignObject>
    </g>
  {/each}
</svg>

<style>
  .warm-hero-art {
    display: block;
    width: 100%;
    height: 100%;
  }
  .hero-screen-canvas {
    position: relative;
    width: 1672px;
    height: 941px;
  }
  .hero-email-screen {
    position: absolute;
    inset: 0 auto auto 0;
    width: 600px;
    height: 1320px;
    transform-origin: 0 0;
    background: white;
  }
  .hero-email-screen img {
    display: block;
    width: 106%;
    max-width: none;
    height: auto;
    margin: -18px 0 0 -3%;
  }
</style>
