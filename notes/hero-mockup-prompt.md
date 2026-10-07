# Warm editorial email hero

Tool: built-in `image_gen`.

Reference: `Warm Editorial Smartphone Email Mockup.png`, provided by Cristina.

Final background: `static/assets/warm-email-hero-background.jpg`, 1672 × 941 pixels.

The displayed screens use the original, unmodified website files: `little-beast-love-is-in-the-air.png` (618 × 3703), `arcian-holiday-gifts.png` (520 × 3442) and `crude-leave-the-soap.png` (623 × 3482). Their measured contours and perspective transforms are preserved in `src/lib/data/heroScreens.ts`.

Safari does not display the masked HTML screen overlays inside the original SVG. `HeroShowcase.svelte` therefore serves the finished composition as a normal responsive image, keeping all three phones visible with the same centered mobile crop. The 1672 × 941 WebP is 281,270 bytes; the 3344 × 1882 version is 665,300 bytes. Both were rendered from the original email files, with no generated or redrawn email content.

To update the composition, run `node scripts/prepare-hero.mjs` with Node 24 and the development server running. Open `/hero-render-fixture.html` in Chromium at a 3344 × 1882 viewport, wait for all three email images to load, then capture the viewport. Resize and export the capture at widths 1672 and 3344 as WebP (quality 94), replacing `static/assets/warm-email-hero-1672.webp` and `static/assets/warm-email-hero-3344.webp`. Remove the temporary HTML after capturing; it is ignored by Git. The image preload in `src/app.html` must match the responsive sources and sizes in the component.

## Final generation prompt

Use case: precise-object-edit. Asset type: high-resolution photographic background for a portfolio website hero. Edit target: the attached warm editorial smartphone mockup. Preserve the full landscape composition, the three physical smartphones, their exact positions, shape, orientation, realistic metallic edges, camera notches, cream textured round tabletop, beige architectural background, natural sunlit shadows, lighting and warm neutral colors. Change only the content inside the three phone displays: remove every email, image, word, icon and illustration currently shown and replace each display with a completely plain solid pure white (#FFFFFF) screen, edge to edge within the black bezels. Keep the black top camera notch on each phone unchanged. Do not add any text or graphics anywhere. The white displays must have clean straight screen boundaries and be suitable for inserting original high-resolution email artwork later. No extra phones, no deformation, no hands. Produce the highest-resolution landscape version, approximately 2560 by 1440 pixels or larger, sharp premium editorial product photography.
