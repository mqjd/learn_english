// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMasonry from './src/plugins/masonry/index.js';
import starlightThemeBlog from './src/theme/index.ts';

// https://astro.build/config
export default defineConfig({
  base: '/learn_english/',
  markdown: {
    processor: unified({
      gfm: true,
      remarkPlugins: [
        [
          remarkMasonry,
          { importSource: 'virtual:starlight-theme-blog/masonry' },
        ],
      ],
    }),
  },
  integrations: [
    starlightThemeBlog({
      title: 'MQJD',
      favicon: '/favicon.ico',
      pagefind: true,
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/mqjd' },
      ],
      navs: [
        { label: 'Reading', dirName: 'reading' },
        { label: 'Listening', dirName: 'listening' },
        { label: 'Exercise', dirName: 'exercise' },
        { label: 'Media', dirName: 'medias' },
      ],
      accentColor: '#0d9488',
    }),
  ],
});
