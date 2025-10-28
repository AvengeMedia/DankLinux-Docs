import type {ReactNode} from 'react';
import {useEffect} from 'react';
import styles from './styles.module.css';

interface HeroProps {
  asciiArt: string;
  hideTitle?: boolean;
}

export default function Hero({asciiArt, hideTitle = true}: HeroProps): ReactNode {
  useEffect(() => {
    if (hideTitle) {
      // Find and hide the page title header
      const header = document.querySelector('.theme-doc-markdown > header');
      if (header) {
        (header as HTMLElement).style.display = 'none';
      }
    }
  }, [hideTitle]);

  return (
    <div className={styles.hero}>
      <div className={styles.heroContent}>
        <pre className={styles.heroAscii}>{asciiArt}</pre>
      </div>
    </div>
  );
}
