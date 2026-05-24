// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.featurectrl.io',
  integrations: [
    starlight({
      title: 'featurectrl docs',
      description: "An open-source feature flag solution designed to make feature flags type safe yet simple.",
      favicon: "favicon.svg",
      logo: {
        light: "./public/logo.svg",
        dark: "./public/logo-dark.svg",
        alt: "featurectrl",
        replacesTitle: true,
      },
      social: [
        {icon: 'github', label: 'GitHub', href: 'https://github.com/featurectrl/featurectrl'},
      ],
      sidebar: [
        { label: 'What is featurectrl', link: '/' },
        {
          label: 'Quickstart',
          items: [
            { label: 'Platform setup', slug: 'quickstart/platform-setup' },
            { label: 'SDK setup', slug: 'quickstart/sdk-setup' },
          ],
        },
        {
          label: 'Concepts',
          items: [
            { label: 'Flag lifecycle', slug: 'concepts/flag-lifecycle' },
            { label: 'Targeting and rollout', slug: 'concepts/targeting-and-rollout' },
            { label: 'Apps', slug: 'concepts/apps' },
            { label: 'Environments', slug: 'concepts/environments' },
          ],
        },
        {
          label: 'SDKs',
          items: [
            { label: 'TypeScript / JavaScript', slug: 'sdks/javascript' },
            { label: 'Python', slug: 'sdks/python' },
          ],
        },
      ],
    }),
  ],
});
