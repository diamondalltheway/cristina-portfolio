# Design study — September 6, 2026

Reference: https://www.jannalynnhagan.com/

## Observed design

- Dark espresso (#200603), light pink (#feabda), cream, and vivid orange.
- Archivo Black uppercase headlines with tight tracking and Inter body text.
- A wide email mockup opens the page, followed by an oversized personal introduction.
- Compact top navigation: services, work, about, contact; a menu on mobile.
- Scrolling text separates major sections. The services headline follows a wave.
- Asymmetric image-and-copy sections, outlined starbursts, rounded imagery, pill-shaped calls to action, and zigzag section dividers.
- A compact portfolio grid links to individual projects.
- A personal introduction and a large contact call to action close the main page; oversized branding closes the footer.

## Application to Cristina's portfolio

Use the same palette, type hierarchy, graphic details, and visitor journey with Cristina's existing introduction, four client names, and eight portfolio images. Build the email mockups from her actual work using CSS. Keep navigation within the page and offer an accessible project viewer with keyboard navigation, instead of creating empty project pages. Use the existing functional contact endpoint and retain its local storage behavior. Do not copy Janna's biography, projects, social accounts, or testimonials.

## Verification

Test responsive layouts at 390, 768, 1440, and 1920 pixels; all local images; section links; mobile menu; project dialog controls and focus restoration; form validation, failure recovery, and persisted submission; reduced motion; and absence of external runtime requests or JavaScript errors. Save screenshots for visual review.
