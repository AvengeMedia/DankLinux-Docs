import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {PrismTheme} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Custom Dank Purple Prism Theme
const dankPurple: PrismTheme = {
  plain: {
    color: '#e4e4e7',
    backgroundColor: '#2e2a3d',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#7c7c99',
        fontStyle: 'italic',
      },
    },
    {
      types: ['punctuation'],
      style: {
        color: '#c0c0d0',
      },
    },
    {
      types: ['namespace'],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ['property', 'tag', 'constant', 'symbol', 'deleted'],
      style: {
        color: '#f78c6c',
      },
    },
    {
      types: ['boolean', 'number'],
      style: {
        color: '#f78c6c',
      },
    },
    {
      types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'],
      style: {
        color: '#c3e88d',
      },
    },
    {
      types: ['operator', 'entity', 'url', 'variable'],
      style: {
        color: '#89ddff',
      },
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: {
        color: '#c792ea',
      },
    },
    {
      types: ['function', 'class-name'],
      style: {
        color: '#82aaff',
      },
    },
    {
      types: ['regex', 'important'],
      style: {
        color: '#f07178',
      },
    },
    {
      types: ['important', 'bold'],
      style: {
        fontWeight: 'bold',
      },
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic',
      },
    },
  ],
};

const dankPurpleLight: PrismTheme = {
  plain: {
    color: '#2e2a3d',
    backgroundColor: '#f8f7fb',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#6e7c93',
        fontStyle: 'italic',
      },
    },
    {
      types: ['punctuation'],
      style: {
        color: '#5a5a77',
      },
    },
    {
      types: ['namespace'],
      style: {
        opacity: 0.7,
      },
    },
    {
      types: ['property', 'tag', 'constant', 'symbol', 'deleted'],
      style: {
        color: '#d65d0e',
      },
    },
    {
      types: ['boolean', 'number'],
      style: {
        color: '#d65d0e',
      },
    },
    {
      types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'],
      style: {
        color: '#427b58',
      },
    },
    {
      types: ['operator', 'entity', 'url', 'variable'],
      style: {
        color: '#076678',
      },
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: {
        color: '#8f3f71',
      },
    },
    {
      types: ['function', 'class-name'],
      style: {
        color: '#0969da',
      },
    },
    {
      types: ['regex', 'important'],
      style: {
        color: '#cc241d',
      },
    },
    {
      types: ['important', 'bold'],
      style: {
        fontWeight: 'bold',
      },
    },
    {
      types: ['italic'],
      style: {
        fontStyle: 'italic',
      },
    },
  ],
};

const config: Config = {
  title: 'Dank Linux',
  tagline: 'A modern Linux desktop suite with beautiful widgets and powerful monitoring - optimized for niri, Hyprland, MangoWC, dwl, and Sway.',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Add favicon, icons, and Open Graph meta tags
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/img/favicon-16x16.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/img/favicon-32x32.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '48x48',
        href: '/img/favicon-48x48.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/img/apple-touch-icon.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'manifest',
        href: '/img/site.webmanifest',
      },
    },
    // Open Graph meta tags for social media previews (fallback - per-page images override this)
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:site_name',
        content: 'Dank Linux',
      },
    },
    // Twitter Card meta tags
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    },
  ],

  // Set the production url of your site here
  url: 'https://danklinux.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'AvengeMedia', // Usually your GitHub org/user name.
  projectName: 'dms-docs', // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/AvengeMedia/dms-docs/tree/main',
        },
        blog: false, // Disable blog for now
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
    [
      require.resolve('plugin-image-zoom'),
      {
        id: 'image-zoom-fullscreen',
      },
    ],
    [
      require.resolve('@actinc/docusaurus-plugin-panzoom'),
      {
        id: 'mermaid-panzoom',
      },
    ],
    [
      '@dipakparmar/docusaurus-plugin-umami',
      {
        websiteID: 'b79205dd-087a-4fbd-b7d7-c60650c76414',
        analyticsDomain: 'umami.danklinux.com',
        dataAutoTrack: true,
        dataDomains: 'danklinux.com',
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card (fallback for pages without images)
    image: 'img/homepage/danklinux-preview.png',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    // Panzoom configuration for Mermaid diagrams only (images use fullscreen zoom)
    zoom: {
      selectors: [
        'div.mermaid[data-processed="true"]',
        'div.docusaurus-mermaid-container',
      ],
      wrap: true,
      timeout: 1000,
    },
    // Algolia DocSearch configuration (placeholder for future setup)
    // algolia: {
    //   appId: 'YOUR_APP_ID',
    //   apiKey: 'YOUR_SEARCH_API_KEY',
    //   indexName: 'danklinux',
    //   contextualSearch: true,
    // },
    navbar: {
      logo: {
        alt: 'Dank Linux Logo',
        src: 'img/path32_black.svg',
        srcDark: 'img/path32.svg',
      },
      items: [
        {
          to: '/docs/getting-started',
          label: 'Install',
          position: 'right',
          activeBasePath: '/docs/getting-started',
        },
        {
          to: '/docs/',
          label: 'Docs',
          position: 'right',
          activeBaseRegex: '^/docs(?!/getting-started|/dankmaterialshell/plugins-overview).*',
        },
        {
          href: 'https://plugins.danklinux.com',
          label: 'Plugins',
          position: 'right',
        },
        {
          type: 'search',
          position: 'right',
        },
        {
          href: 'https://github.com/AvengeMedia',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
        {
          href: 'https://discord.gg/danklinux',
          position: 'right',
          className: 'navbar-discord-link',
          'aria-label': 'Discord community',
        },
        {
          href: 'https://ko-fi.com/danklinux',
          position: 'right',
          className: 'navbar-kofi-link',
          'aria-label': 'Support on Ko-fi',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          items: [
            {
              label: 'Install',
              to: '/docs/getting-started',
            },
            {
              label: 'Docs',
              to: '/docs/',
            },
            {
              label: 'Contributing',
              to: '/docs/contributing',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Dank Linux • Free & Open Source`,
    },
    prism: {
      theme: dankPurpleLight,
      darkTheme: dankPurple,
      additionalLanguages: ['bash', 'json', 'yaml', 'toml', 'rust', 'python', 'javascript', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
