import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { heroScreens } from '../src/lib/data/heroScreens.ts';

// Render this temporary page in Chromium at 3344 × 1882, then export its
// screenshot as responsive WebP images. Ship the composite, not the SVG's
// foreignObject overlays, which disappear in Safari.
const output = resolve(process.argv[2] ?? 'static/hero-render-fixture.html');
const masks = heroScreens
  .map(
    (
      screen,
    ) => `<mask id="${screen.id}" maskUnits="userSpaceOnUse" style="mask-type:alpha" x="0" y="0" width="1672" height="941">
      <path d="${screen.clip}" fill="white" stroke="white" stroke-width="4" stroke-linejoin="round"/>
    </mask>`,
  )
  .join('');
const screens = heroScreens
  .map(
    (screen) => `<g mask="url(#${screen.id})"><foreignObject width="1672" height="941">
      <div class="canvas"><div class="screen" style="transform:${screen.transform}">
        <img src="${screen.src}" alt=""/>
      </div></div>
    </foreignObject></g>`,
  )
  .join('');

await writeFile(
  output,
  `<!doctype html><html lang="en"><meta charset="utf-8"><title>Hero asset render</title>
  <style>
    html,body{margin:0;width:100%;height:100%;overflow:hidden}
    svg{display:block;width:100%;height:100%}
    .canvas{position:relative;width:1672px;height:941px}
    .screen{position:absolute;inset:0 auto auto 0;width:600px;height:1320px;transform-origin:0 0;background:white}
    .screen img{display:block;width:106%;max-width:none;height:auto;margin:-18px 0 0 -3%}
  </style>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1672 941">
    <defs>${masks}</defs>
    <image href="/assets/warm-email-hero-background.jpg" width="1672" height="941" preserveAspectRatio="none"/>
    ${screens}
  </svg></html>`,
);
console.log(`Created ${output}. Wait for all three email images before capturing.`);
