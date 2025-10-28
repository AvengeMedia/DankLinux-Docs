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
  tagline: 'A modern Wayland desktop environment with beautiful widgets and powerful monitoring',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://docs.danklinux.com',
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
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/danklinux-social-card.jpg',
    colorMode: {
      defaultMode: 'dark',
      respectPrefersColorScheme: true,
    },
    // Algolia DocSearch configuration (placeholder for future setup)
    // algolia: {
    //   appId: 'YOUR_APP_ID',
    //   apiKey: 'YOUR_SEARCH_API_KEY',
    //   indexName: 'danklinux',
    //   contextualSearch: true,
    // },
    navbar: {
      title: 'danklinux',
      logo: {
        alt: 'Dank Linux Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/docs/getting-started',
          label: 'Install',
          position: 'right',
          // Only active on exactly this path
          activeBasePath: 'none', 
        },
        {
          to: '/docs/',
          label: 'Docs',
          position: 'right',
          // Active on /docs/* EXCEPT getting-started and plugins
          activeBaseRegex: '^/docs(?!/getting-started|/dankmaterialshell/plugins).*',
        },
        {
          to: '/docs/dankmaterialshell/plugins',
          label: 'Plugins',
          position: 'right',
          activeBasePath: 'none',
        },
        {
          type: 'search',
          position: 'right',
          className: 'navbar-search-hidden',
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
      copyright: `© ${new Date().getFullYear()} Dank Linux • MIT Licensed`,
    },
    prism: {
      theme: dankPurpleLight,
      darkTheme: dankPurple,
      additionalLanguages: ['bash', 'json', 'yaml', 'toml', 'rust', 'python', 'javascript', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
