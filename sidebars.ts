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
    'dankinstall',
    {
      type: 'category',
      label: 'DankMaterialShell (dms)',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'dankmaterialshell/overview',
          label: 'Overview & Architecture',
        },
        'dankmaterialshell/installation',
        'dankmaterialshell/updating',
        'dankmaterialshell/compositors',
        {
          type: 'category',
          label: 'Themes',
          items: [
            'dankmaterialshell/application-themes',
            'dankmaterialshell/custom-themes',
          ],
        },
        'dankmaterialshell/keybinds-ipc',
        {
          type: 'category',
          label: 'Plugins',
          items: [
            'dankmaterialshell/plugins-overview',
            'dankmaterialshell/plugins-types',
          ],
        },
        'dankmaterialshell/advanced-configuration',
      ],
    },
    {
      type: 'category',
      label: 'DankGreeter (dms-greeter)',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'dankgreeter/index',
          label: 'Overview',
        },
        'dankgreeter/installation',
        'dankgreeter/configuration',
      ],
    },
    {
      type: 'category',
      label: 'DankGOP (dgop)',
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
    {
      type: 'category',
      label: 'DankSearch (dsearch)',
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
    'contributing',
    'support'
  ],
};

export default sidebars;
