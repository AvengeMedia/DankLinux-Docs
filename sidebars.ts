import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'index',
    'getting-started',
    {
      type: 'category',
      label: 'DankLinux',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'danklinux/index',
          label: 'Overview',
        },
        'danklinux/dankinstall',
        'danklinux/configuration',
        'danklinux/distributions',
        'danklinux/dms-runner',
        'danklinux/plugins',
      ],
    },
    {
      type: 'category',
      label: 'DankMaterialShell',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'dankmaterialshell/index',
          label: 'Overview',
        },
        'dankmaterialshell/installation',
        'dankmaterialshell/configuration',
        'dankmaterialshell/compositors',
        'dankmaterialshell/theming',
        {
          type: 'category',
          label: 'Plugins',
          items: [
            'dankmaterialshell/plugins',
            'dankmaterialshell/plugins-first-party',
            'dankmaterialshell/plugins-third-party',
            'dankmaterialshell/plugins-dev',
          ],
        },
        'dankmaterialshell/ipc',
        'dankmaterialshell/greeter',
        'dankmaterialshell/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'DankSearch',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'danksearch/index',
          label: 'Overview',
        },
        'danksearch/installation',
        'danksearch/configuration',
        'danksearch/usage',
      ],
    },
    {
      type: 'category',
      label: 'DGOP',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'dgop/index',
          label: 'Overview',
        },
        'dgop/installation',
        'dgop/configuration',
        'dgop/usage',
      ],
    },
    'contributing',
    'demo',
    'support'
  ],
};

export default sidebars;
