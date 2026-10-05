import React from 'react';
import DefaultNavbarItem from '@theme-original/NavbarItem/DefaultNavbarItem';
import type {Props} from '@theme/NavbarItem/DefaultNavbarItem';
import {icons} from './icons';

const destinations: Record<string, keyof typeof icons> = {
  '/docs/getting-started': 'download',
  '/docs/': 'auto_stories',
  '/plugins': 'extension',
  '/blog': 'newspaper',
};

export default function ExpressiveNavbarItem(props: Props) {
  if (props.isDropdownItem || props.className?.includes('navbar-version-dropdown')) return <DefaultNavbarItem {...props} />;
  const name = typeof props.to === 'string' ? destinations[props.to] : undefined;
  if (!name) return <DefaultNavbarItem {...props} />;
  const icon = icons[name];

  return (
    <DefaultNavbarItem {...props} label={
      <>
        <span className="navbar-destination-indicator">
          <svg className="navbar-destination-icon" width="24" height="24" viewBox="0 0 960 960" fill="currentColor" aria-hidden="true" focusable="false">
            <path className="navbar-icon-outlined" d={icon.outlined} />
            <path className="navbar-icon-filled" d={icon.filled} />
          </svg>
        </span>
        <span>{props.label}</span>
      </>
    } />
  );
}
