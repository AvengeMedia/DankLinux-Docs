import React from 'react';
import ExpressiveShape from '../ExpressiveShape';
import Composition from '../ExpressiveShape/Composition';
import styles from './styles.module.css';

export default function LandingBackground(): React.JSX.Element {
  return (
    <div className={styles.background} aria-hidden="true">
      <Composition variant="bloom" className={styles.bloom} />
      <Composition variant="garden" className={styles.garden} />
      <ExpressiveShape shape="cookie6" className={styles.cookie} />
      <div className={styles.orbit} />
    </div>
  );
}
