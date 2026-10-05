import React from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import Composition from '../ExpressiveShape/Composition';
import styles from './styles.module.css';

interface HeroProps {
  asciiArt?: string;
  hideTitle?: boolean;
}

const projects: Record<string, string> = {
  dankmaterialshell: 'DankMaterialShell',
  dankgreeter: 'DankGreeter',
  dankcalendar: 'DankCalendar',
  danksearch: 'DankSearch',
  dgop: 'dgop',
  dankinstall: 'DankInstall',
};

export default function Hero({hideTitle = true}: HeroProps) {
  const {metadata, contentTitle} = useDoc();
  const project = projects[metadata.id.split('/')[0]] ?? 'Dank Linux';
  const title = contentTitle ?? metadata.title;
  const showProject = !title.toLowerCase().startsWith(project.toLowerCase());
  const replacesTitle = hideTitle || Boolean(contentTitle);
  const Title = replacesTitle ? 'h1' : 'p';

  return (
    <div className={styles.hero} data-replaces-title={replacesTitle} data-content-title={Boolean(contentTitle)}>
      <div className={styles.heroContent}>
        {showProject && <p className={styles.project}>{project}</p>}
        <Title className={styles.title}>{title}</Title>
      </div>
      <Composition variant="header" className={styles.shapes} />
    </div>
  );
}
