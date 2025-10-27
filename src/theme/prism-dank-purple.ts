/**
 * Dank Purple - Custom Prism Theme for Dank Linux Documentation
 * Based on the code-colors.png reference with dark purple aesthetic
 */

import type { PrismTheme } from 'prism-react-renderer';

const dankPurple: PrismTheme = {
  plain: {
    color: '#e4e4e7', // Light gray text
    backgroundColor: '#2e2a3d', // Dark purple background
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#7c7c99', // Muted purple-gray
        fontStyle: 'italic',
      },
    },
    {
      types: ['punctuation'],
      style: {
        color: '#c0c0d0', // Light gray-purple
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
        color: '#f78c6c', // Orange
      },
    },
    {
      types: ['boolean', 'number'],
      style: {
        color: '#f78c6c', // Orange for numbers
      },
    },
    {
      types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'],
      style: {
        color: '#c3e88d', // Green for strings
      },
    },
    {
      types: ['operator', 'entity', 'url', 'variable'],
      style: {
        color: '#89ddff', // Cyan
      },
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: {
        color: '#c792ea', // Light purple for keywords
      },
    },
    {
      types: ['function', 'class-name'],
      style: {
        color: '#82aaff', // Bright blue
      },
    },
    {
      types: ['regex', 'important'],
      style: {
        color: '#f07178', // Coral red
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
    // Bash-specific token styling to match reference image
    {
      types: ['builtin'],
      languages: ['bash', 'shell'],
      style: {
        color: '#c792ea', // Commands like curl, systemctl in light purple
      },
    },
    {
      types: ['parameter'],
      languages: ['bash', 'shell'],
      style: {
        color: '#82aaff', // Flags like --user, --compositor in bright blue
      },
    },
    {
      types: ['string'],
      languages: ['bash', 'shell'],
      style: {
        color: '#c3e88d', // Arguments in green
      },
    },
  ],
};

// Light theme variant with better contrast
const dankPurpleLight: PrismTheme = {
  plain: {
    color: '#2e2a3d', // Dark text on light background
    backgroundColor: '#f8f7fb', // Light purple-tinted background
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
        color: '#d65d0e', // Darker orange for light mode
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
        color: '#427b58', // Darker green for light mode
      },
    },
    {
      types: ['operator', 'entity', 'url', 'variable'],
      style: {
        color: '#076678', // Darker cyan
      },
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: {
        color: '#8f3f71', // Darker purple for keywords
      },
    },
    {
      types: ['function', 'class-name'],
      style: {
        color: '#0969da', // Darker blue
      },
    },
    {
      types: ['regex', 'important'],
      style: {
        color: '#cc241d', // Darker red
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

export { dankPurple, dankPurpleLight };
export default dankPurple;
