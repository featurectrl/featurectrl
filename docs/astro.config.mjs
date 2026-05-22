// @ts-check
import {defineConfig} from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
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
        {icon: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/company/featurectrl'},
      ],
      sidebar: [
      ],
    }),
  ],
});
