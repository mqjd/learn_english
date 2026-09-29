// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkBaseImages from './src/plugins/base-images/index.js';
import remarkMasonry from './src/plugins/masonry/index.js';
import starlightThemeBlog from './src/theme/index.ts';

/** @type {import('astro').AstroIntegration} */
const markdownIntegration = {
  name: 'learn-english-markdown',
  hooks: {
    'astro:config:setup': ({ config, updateConfig }) => {
      updateConfig({
        markdown: {
          ...config.markdown,
          processor: unified({
            gfm: true,
            remarkPlugins: [
              [remarkBaseImages, { base: config.base }],
              [
                remarkMasonry,
                { importSource: 'virtual:starlight-theme-blog/masonry' },
              ],
            ],
          }),
        },
      });
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://mqjd.github.io',
  base: '/learn_english/',
  integrations: [
    markdownIntegration,
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
        { label: 'Tags', href: '/tags/' },
      ],
      accentColor: '#3f51b5',
    }),
  ],
});
