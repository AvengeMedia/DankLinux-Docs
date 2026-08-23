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
        {
          type: 'category',
          key: 'dankmaterialshell-nixos-installation',
          label: 'Installation - NixOS',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'dankmaterialshell/nixos',
              key: 'dankmaterialshell-nixos-module',
              label: 'NixOS module',
            },
            {
              type: 'doc',
              id: 'dankmaterialshell/nixos-flake',
              label: 'Flake (NixOS/home-manager)',
            },
          ],
        },
        'dankmaterialshell/calendar-integration',
        'dankmaterialshell/lock-screen-authentication',
        {
          type: 'doc',
          id: 'dankmaterialshell/managing',
          label: 'Managing Your Installation',
        },
        'dankmaterialshell/compositors',
        'dankmaterialshell/layers',
        'dankmaterialshell/compositor-blur',
        {
          type: 'category',
          label: 'Themes',
          collapsed: false,
          items: [
            'dankmaterialshell/application-themes',
            'dankmaterialshell/icon-theming',
            'dankmaterialshell/custom-themes',
          ],
        },
        'dankmaterialshell/keybinds-ipc',
        {
          type: 'category',
          label: 'CLI',
          collapsed: false,
          items: [
            'dankmaterialshell/cli-setup',
            'dankmaterialshell/cli-doctor',
            {
              type: 'doc',
              id: 'dankmaterialshell/cli-system-updater',
              label: 'System updater',
            },
            'dankmaterialshell/cli-process-management',
            'dankmaterialshell/cli-keybinds-cheatsheets',
            {
              type: 'doc',
              id: 'dankmaterialshell/cli-dank16',
              label: 'Dank16 (ANSI Colors)',
            },
            {
              type: 'doc',
              id: 'dankmaterialshell/cli-color-picker',
              label: 'Color Picker',
            },
            'dankmaterialshell/cli-brightness',
            {
              type: 'doc',
              id: 'dankmaterialshell/cli-clipboard',
              label: 'Clipboard Manager',
            },
            'dankmaterialshell/cli-screenshot',
            {
              type: 'doc',
              id: 'dankmaterialshell/cli-qr',
              label: 'QR Codes',
            },
          ],
        },
        {
          type: 'category',
          label: 'Plugins',
          collapsed: false,
          items: [
            'dankmaterialshell/plugins-overview',
            'dankmaterialshell/plugin-development',
          ],
        },
        'dankmaterialshell/advanced-configuration',
      ],
    },
    {
      type: 'category',
      label: 'DankLinux Repository',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'danklinux/index',
          key: 'danklinux-overview',
          label: 'Overview',
        },
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
          key: 'dankgreeter-overview',
          label: 'Overview',
        },
        'dankgreeter/installation',
        {
          type: 'category',
          key: 'dankgreeter-nixos-installation',
          label: 'Installation - NixOS',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'dankgreeter/nixos',
              key: 'dankgreeter-nixos-module',
              label: 'NixOS module',
            },
            {
              type: 'doc',
              id: 'dankgreeter/nixos-flake',
              label: 'Flake',
            },
          ],
        },
        'dankgreeter/configuration',
        'dankgreeter/authentication',
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
          key: 'dgop-overview',
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
          key: 'danksearch-overview',
          label: 'Overview',
        },
        'danksearch/installation',
        {
          type: 'category',
          key: 'danksearch-nixos-installation',
          label: 'Installation - NixOS',
          collapsed: true,
          items: [
            {
              type: 'doc',
              id: 'danksearch/nixos-flake',
              label: 'Flake (home-manager)',
            },
            {
              type: 'doc',
              id: 'danksearch/nixos',
              key: 'danksearch-nixos-module',
              label: 'NixOS module',
            },
          ],
        },
        'danksearch/configuration',
        'danksearch/usage',
      ],
    },
    {
      type: 'category',
      label: 'DankCalendar (dcal)',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'dankcalendar/index',
          key: 'dankcalendar-overview',
          label: 'Overview',
        },
        'dankcalendar/installation',
        'dankcalendar/accounts',
        'dankcalendar/usage',
        'dankcalendar/navigation',
        'dankcalendar/ipc',
      ],
    },
    'contributing',
    {
      type: 'doc',
      id: 'contributing-registry',
      label: 'Contributing Plugins & Themes',
    },
    'support',
    'dankmaterialshell/changelog',
  ],
};

export default sidebars;
