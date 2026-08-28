import React, { useEffect, useRef } from 'react';
import styles from './styles.module.css';

export default function LandingBackground(): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        node.style.setProperty('--mouse-x', `${x}px`);
        node.style.setProperty('--mouse-y', `${y}px`);
      });
    };

    document.addEventListener('mousemove', onMove);
    return () => {
      document.removeEventListener('mousemove', onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={styles.background} aria-hidden="true">
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />
      <div className={styles.pattern} />
      <div className={styles.grid} />
    </div>
  );
}
