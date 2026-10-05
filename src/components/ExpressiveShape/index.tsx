import React from 'react';
import {paths} from './paths';

export default function ExpressiveShape({shape = 'flower', className}: {shape?: keyof typeof paths; className?: string}) {
  return (
    <svg viewBox="0 0 1 1" className={className} aria-hidden="true" focusable="false">
      <path d={paths[shape]} fill="currentColor" />
    </svg>
  );
}
