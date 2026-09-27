import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    // Explicit output keeps the separate api/contact.js Vercel function alongside the static build.
    adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
  },
};
