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
    'demo',
    {
      type: 'category',
      label: 'DankMaterialShell',
      collapsed: false,
      items: [
        'dankmaterialshell/index',
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
      label: 'DankLinux',
      collapsed: false,
      items: [
        'danklinux/index',
        'danklinux/dankinstall',
        'danklinux/configuration',
        'danklinux/distributions',
        'danklinux/dms-runner',
        'danklinux/plugins',
      ],
    },
    {
      type: 'category',
      label: 'dgop',
      collapsed: false,
      items: [
        'dgop/index',
      ],
    },
    'support',
    'contributing',
  ],
};

export default sidebars;
