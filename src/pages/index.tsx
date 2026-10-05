import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import LandingBackground from '../components/LandingBackground';
import ThemePreview from '../components/ThemePreview';
import styles from './index.module.css';

declare global {
  interface Window {
    mediumZoom?: (target: string | HTMLElement | NodeListOf<HTMLElement>, options?: any) => any;
    playerjs?: any;
  }
}

const compositors = [
  { name: 'niri', logo: '/img/niri.svg', duration: 600 },
  { name: 'Hyprland', logo: '/img/hyprland.svg', duration: 600 },
  { name: 'MangoWC', logo: '/img/mango.png', duration: 600 },
  { name: 'Sway', logo: '/img/sway.svg', duration: 600 },
  { name: 'labwc', logo: '/img/labwc.png', duration: 600 },
  { name: 'Miracle', logo: '/img/miraclewm.svg', duration: 600 },
  { name: 'Wayland', logo: null, duration: 0 },
];

const compositorLinks: Record<string, string> = {
  'niri': 'https://github.com/niri-wm/niri',
  'Hyprland': 'https://hyprland.org/',
  'MangoWC': 'https://github.com/DreamMaoMao/mangowc',
  'Sway': 'https://swaywm.org/',
  'labwc': 'https://labwc.github.io/',
  'Miracle': 'https://github.com/miracle-wm-org/miracle-wm',
};

export default function Home() {
  const [typed, setTyped] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);
  const [currentCompositor, setCurrentCompositor] = useState(-1);
  const [copied, setCopied] = useState(false);
  const fullText = 'curl -fsSL https://install.danklinux.com | sh';
  const videoRef = React.useRef<HTMLIFrameElement>(null);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduceMotion(preference.matches);
    updateMotion();
    preference.addEventListener('change', updateMotion);
    return () => preference.removeEventListener('change', updateMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setTyped(fullText);
      return;
    }
    if (typed.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTyped(fullText.slice(0, typed.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [typed, fullText, reduceMotion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initZoom = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        let mediumZoom: any;

        if (window.mediumZoom) {
          mediumZoom = window.mediumZoom;
        } else {
          try {
            const zoomModule = await import('medium-zoom');
            mediumZoom = zoomModule.default || zoomModule;
          } catch (e) {
            return;
          }
        }

        if (!mediumZoom) return;

        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const background = isLight
          ? 'rgba(248, 247, 251, 0.95)'
          : 'rgba(17, 17, 17, 0.95)';

        let zoomableImages = document.querySelectorAll('img[data-zoom]');

        if (zoomableImages.length < 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          zoomableImages = document.querySelectorAll('img[data-zoom]');
        }

        if (zoomableImages.length > 0) {
          mediumZoom(zoomableImages, {
            background,
            margin: 24,
          });
        }
      } catch (err) {
        console.warn('Could not initialize image zoom:', err);
      }
    };

    initZoom();

    const observer = new MutationObserver(() => {
      initZoom();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setCurrentCompositor(compositors.length - 1);
      return;
    }
    const timeouts: NodeJS.Timeout[] = [];

    const showFirstTimeout = setTimeout(() => {
      setCurrentCompositor(0);
    }, 800);
    timeouts.push(showFirstTimeout);

    let cumulativeDelay = 800;
    compositors.forEach((compositor, index) => {
      if (index < compositors.length - 1) {
        cumulativeDelay += compositor.duration;
        const timeout = setTimeout(() => {
          setCurrentCompositor(index + 1);
        }, cumulativeDelay);
        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (!videoRef.current || typeof window === 'undefined') return;

    let player: any = null;

    const script = document.createElement('script');
    script.src = '//assets.mediadelivery.net/playerjs/playerjs-latest.min.js';
    script.async = true;

    script.onload = () => {
      // @ts-ignore - playerjs is loaded from external script
      if (window.playerjs && videoRef.current) {
        // @ts-ignore
        player = new window.playerjs.Player(videoRef.current);

        player.on('ready', () => {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting && player) {
                  player.play();
                } else if (player) {
                  player.pause();
                }
              });
            },
            { threshold: 0.5 }
          );

          if (videoRef.current) {
            observer.observe(videoRef.current);
          }
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);


  return (
    <Layout
      title="Modern Desktop Suite"
      description="A modern Linux desktop suite with beautiful widgets and powerful monitoring - optimized for niri, Hyprland, MangoWC, Sway, and Miracle WM.">
      <Head>
        <meta property="og:image" content="https://danklinux.com/img/homepage/danklinux-preview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:image" content="https://danklinux.com/img/homepage/danklinux-preview.png" />
      </Head>
      <noscript>
        <style>{`
          .noscript-warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            color: #92400e;
            padding: 1rem 1.5rem;
            margin: 1rem;
            border-radius: 0.5rem;
            text-align: center;
            font-size: 0.95rem;
          }
          [data-theme='dark'] .noscript-warning {
            background: #422006;
            border-left-color: #f59e0b;
            color: #fef3c7;
          }
        `}</style>
        <div className="noscript-warning">
          ⚠️ JavaScript is disabled. Some interactive features and animations on this site require JavaScript to function properly.
        </div>
      </noscript>
      <div className={styles.container}>
        <LandingBackground />
        <div className={styles.content}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                <span className={styles.heroLine}>Modern Desktop</span>
                <span className={styles.heroLine}>for</span>
                <span className={styles.compositorRotatorWrapper}>
                  <noscript>
                    <span style={{display: 'inline', fontSize: 'inherit', color: 'inherit'}}>
                      niri, Hyprland, Sway, and Wayland
                    </span>
                  </noscript>
                  <span className={styles.compositorRotator}>
                    {compositors.map((compositor, index) => (
                      <span
                        key={compositor.name}
                        className={`${styles.compositorSlide} ${
                          index === currentCompositor ? styles.compositorActive : ''
                        }`}
                      >
                        {compositor.logo && (
                          <img
                            src={compositor.logo}
                            alt={compositor.name}
                            className={styles.compositorLogo}
                          />
                        )}
                        <span className={styles.compositorName}>{compositor.name}</span>
                      </span>
                    ))}
                  </span>
                </span>
              </h1>

              <div className={styles.heroCTA}>
                <Link to="/docs/getting-started" className={styles.primaryCTA}>
                  <span>Get Started</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.ctaArrow}>
                    <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link to="/docs/" className={styles.secondaryCTA}>
                  Documentation
                </Link>
              </div>

              <div className={styles.terminalFloat}>
                <div className={styles.terminalWindow}>
                  {copied && (
                    <div className={styles.copiedIndicator} role="status">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ marginRight: '0.5rem' }}>
                        <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Copied
                    </div>
                  )}
                  <div className={styles.terminalHeader}>
                    <div className={styles.terminalLogos}>
                      {compositors
                        .slice(0, 5)
                        .filter((compositor) => compositor.logo)
                        .map((compositor) => (
                          <a
                            key={compositor.name}
                            href={compositorLinks[compositor.name]}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={compositor.name}
                            className={styles.terminalLogoLink}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img
                              src={compositor.logo!}
                              alt={compositor.name}
                              className={styles.terminalLogo}
                            />
                          </a>
                        ))}
                    </div>
                  </div>
                  <button type="button" className={styles.terminalBody} onClick={handleCopyCommand} aria-label={`Copy install command: ${fullText}`}>
                    <span className={styles.terminalLine}>
                      <span className={styles.prompt}>❯</span>
                      <span className={styles.typedCommand}>
                        {typed.length > 0 && (
                          <>
                            <span className={styles.cmdCommand}>{typed.slice(0, Math.min(4, typed.length))}</span>
                            {typed.length > 4 && (
                              <span className={styles.cmdFlag}>{typed.slice(4, Math.min(10, typed.length))}</span>
                            )}
                            {typed.length > 10 && (
                              <span className={styles.cmdUrl}>{typed.slice(10, Math.min(42, typed.length))}</span>
                            )}
                            {typed.length > 42 && (
                              <span className={styles.cmdPipe}>{typed.slice(42, Math.min(45, typed.length))}</span>
                            )}
                            {typed.length > 45 && (
                              <span className={styles.cmdCommand}>{typed.slice(45)}</span>
                            )}
                          </>
                        )}
                      </span>
                    </span>
                    <span className={`${styles.terminalLine} ${typed.length >= fullText.length ? styles.fadeIn : styles.hidden}`}>
                      <span className={styles.output}>→ Detecting distribution...</span>
                    </span>
                    <span className={`${styles.terminalLine} ${typed.length >= fullText.length ? styles.fadeIn : styles.hidden}`} style={{ animationDelay: '0.3s' }}>
                      <span className={styles.success}>✓ Installing dependencies</span>
                    </span>
                    <span className={`${styles.terminalLine} ${typed.length >= fullText.length ? styles.fadeIn : styles.hidden}`} style={{ animationDelay: '0.6s' }}>
                      <span className={styles.success}>✓ Configuring DankMaterialShell</span>
                    </span>
                    <span className={`${styles.terminalLine} ${typed.length >= fullText.length ? styles.fadeIn : styles.hidden}`} style={{ animationDelay: '0.9s' }}>
                      <span className={styles.success}>✓ Ready to rock!</span>
                    </span>
                  </button>
                </div>
              </div>

              <div className={styles.preconfiguredRow}>
                <span className={styles.preconfiguredLabel}>Pre-configured flavors</span>
                <div className={styles.preconfiguredCards}>
                  <a
                    href="https://github.com/zirconium-dev/zirconium/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.preconfiguredCard}
                  >
                    <img src="/img/z.svg" alt="Zirconium" className={styles.preconfiguredLogo} />
                    <div className={styles.preconfiguredInfo}>
                      <span className={styles.preconfiguredName}>Zirconium</span>
                      <span className={styles.preconfiguredDesc}>Fedora-based immutable OS with niri + DMS</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className={styles.preconfiguredArrow}>
                      <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                  <a
                    href="https://fedoraproject.org/spins/miraclewm/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.preconfiguredCard}
                  >
                    <img src="/img/fedora-mark.svg" alt="Fedora" className={styles.preconfiguredLogo} />
                    <div className={styles.preconfiguredInfo}>
                      <span className={styles.preconfiguredName}>Fedora Miracle Spin</span>
                      <span className={styles.preconfiguredDesc}>Official Fedora Spin with MiracleWM + DMS</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className={styles.preconfiguredArrow}>
                      <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.screenshotGallery}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                See it <span className={styles.gradientText}>in action</span>
              </h2>
              <p className={styles.sectionDesc}>
                Beautiful, functional, and ready to use
              </p>
            </div>

            <div className={styles.screenshotsGrid}>
              <div className={`${styles.screenshotCard} ${styles.large}`}>
                <div className={styles.screenshotFrame}>
                  <iframe
                    ref={videoRef}
                    className={styles.screenshotVideo}
                    src="https://player.mediadelivery.net/embed/526968/28e655a4-2553-48d0-8325-6a0864237eac?muted=true&loop=true"
                    loading="lazy"
                    style={{ border: 0, width: '100%', height: '100%' }}
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen={true}
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>DankMaterialShell in Action</h3>
                  <p>Experience the fluid interface and beautiful animations</p>
                </div>
              </div>

              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="/img/homepage/dankdash_dark.png"
                    alt="DankDash - Overview Dashboard"
                    className={`${styles.screenshotImage} ${styles.darkOnly}`}
                    data-zoom
                  />
                  <img
                    src="/img/homepage/dankdash_light.png"
                    alt="DankDash - Overview Dashboard"
                    className={`${styles.screenshotImage} ${styles.lightOnly}`}
                    data-zoom
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>Dank Dash</h3>
                  <p>Media controls, weather, calendar, and system info at a glance</p>
                </div>
              </div>

              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="/img/homepage/launcher_dark.png"
                    alt="Spotlight Launcher"
                    className={`${styles.screenshotImage} ${styles.darkOnly} ${styles.topAlign}`}
                    data-zoom
                  />
                  <img
                    src="/img/homepage/launcher_light.png"
                    alt="Spotlight Launcher"
                    className={`${styles.screenshotImage} ${styles.lightOnly} ${styles.topAlign}`}
                    data-zoom
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>Launcher</h3>
                  <p>Launch applications, filesystem searches, and more with the launcher & plugins.</p>
                </div>
              </div>

              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="/img/homepage/controlcenter_dark.png"
                    alt="Control Center"
                    className={`${styles.screenshotImage} ${styles.darkOnly}`}
                    data-zoom
                  />
                  <img
                    src="/img/homepage/controlcenter_light.png"
                    alt="Control Center"
                    className={`${styles.screenshotImage} ${styles.lightOnly}`}
                    data-zoom
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>Control Center</h3>
                  <p>Fully configurable system settings and quick toggles.</p>
                </div>
              </div>

              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="/img/homepage/process_dark.png"
                    alt="System Monitor"
                    className={`${styles.screenshotImage} ${styles.darkOnly}`}
                    data-zoom
                  />
                  <img
                    src="/img/homepage/process_light.png"
                    alt="System Monitor"
                    className={`${styles.screenshotImage} ${styles.lightOnly}`}
                    data-zoom
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>System Monitor</h3>
                  <p>Real-time system & process metrics</p>
                </div>
              </div>

              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="/img/homepage/widget_dark.png"
                    alt="Widget Customization"
                    className={`${styles.screenshotImage} ${styles.darkOnly}`}
                    data-zoom
                  />
                  <img
                    src="/img/homepage/widget_light.png"
                    alt="Widget Customization"
                    className={`${styles.screenshotImage} ${styles.lightOnly}`}
                    data-zoom
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>Widget Customization</h3>
                  <p>Personalize your desktop experience</p>
                </div>
              </div>

              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="/img/homepage/plugins_dark.png"
                    alt="Plugins"
                    className={`${styles.screenshotImage} ${styles.darkOnly}`}
                    data-zoom
                  />
                  <img
                    src="/img/homepage/plugins_light.png"
                    alt="Plugins"
                    className={`${styles.screenshotImage} ${styles.lightOnly}`}
                    data-zoom
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>Plugins</h3>
                  <p>Extend functionality with new widgets, launcher features, and more.</p>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.features}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Everything <span className={styles.gradientText}>you need</span>
              </h2>
              <p className={styles.sectionDesc}>
                A complete desktop experience, out of the box
              </p>
            </div>

            <div className={styles.featuresGrid}>
              <FeatureCard
                title="DankMaterialShell"
                description="A modern and beautiful desktop shell with dynamic theming and smooth animations."
                imageDark="/img/desktop.png"
                imageLight="/img/desktoplight.png"
              />
              <FeatureCard
                title="Dank Install"
                description="One line installer for an automated quick and easy setup."
                imageDark="/img/dankinstall.png"
                imageLight="/img/dankinstalallight.png"
              />
              <FeatureCard
                title="Dank GOP"
                description="Stateless system and process monitoring for CPU, memory, GPU, disks, and network interfaces."
                imageDark="/img/dgop.png"
                imageLight="/img/dgoplight.png"
              />
              <FeatureCard
                title="Dank Greeter"
                description="An aesthetically pleasing greetd greeter for your desktop."
                imageDark="/img/dgreet.png"
                imageLight="/img/dgreetlight.png"
              />
              <FeatureCard
                title="Dank Search"
                description="Blazingly fast and efficient file system search tool."
                imageDark="/img/dsearch.png"
                imageLight="/img/dsearchlight.png"
                imageAlign="top"
              />
              <FeatureCard
                title="DankCalendar"
                description="Your calendars, events, and tasks together, with Google, Microsoft, CalDAV, and iCloud support."
                imageDark="/img/blog/v1.6/dcal_drag.png"
                imageLight="/img/blog/v1.6/dcal_drag.png"
                imageAlign="top"
                href="/docs/dankcalendar"
              />
            </div>
          </section>

          <section className={styles.showcase}>
            <div className={styles.showcaseGrid}>
              <div className={styles.showcaseText}>
                <h2 className={styles.showcaseTitle}>
                  One theme.<br /><span className={styles.gradientText}>Across your apps.</span>
                </h2>
                <p className={styles.showcaseDesc}>
                  DMS automatically generates matching colors for supported GTK and Qt apps,
                  terminals, editors, and more.
                </p>
                <p className={styles.showcaseDesc}>
                  Our custom <Link to="/docs/dankmaterialshell/cli-dank16">dank16</Link> algorithm builds a full 16-color palette
                  for terminals and syntax highlighting, with contrast tuned for light and dark themes.
                </p>
                <ul className={styles.showcaseFeatures}>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>GTK3, GTK4, and Qt</span>
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Terminal and editor color schemes</span>
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Light and dark modes</span>
                  </li>
                </ul>
                <Link to="/docs/dankmaterialshell/application-themes" className={styles.themingLink}>
                  Set up app theming <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <ThemePreview />
            </div>
          </section>

          <section className={styles.support}>
            <div className={styles.supportCard}>
              <div className={styles.supportText}>
                <h2 className={styles.supportTitle}>
                  Free and open source. <span className={styles.gradientText}>Kept going by you.</span>
                </h2>
                <p className={styles.supportDesc}>
                  Dank Linux costs nothing to use. If it has earned a spot on your desktop,
                  a tip helps cover the time and infrastructure that keep releases coming.
                </p>
              </div>
              <div className={styles.supportActions}>
                <a
                  href="https://ko-fi.com/danklinux"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.primaryCTA}
                >
                  <span className={styles.kofiIcon} aria-hidden="true" />
                  <span>Tip on Ko-fi</span>
                </a>
                <Link to="/docs/contributing" className={styles.secondaryCTA}>
                  Contribute code
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ title, description, imageDark, imageLight, imageAlign = 'center', href }: {
  title: string;
  description: string;
  imageDark?: string;
  imageLight?: string;
  imageAlign?: 'top' | 'center';
  href?: string;
}) {
  return (
    <div className={styles.featureCard}>
      {imageDark && imageLight && (
        <div className={styles.cardImageContainer}>
          <img
            src={imageDark}
            alt={title}
            className={`${styles.cardImage} ${styles.darkOnly} ${imageAlign === 'top' ? styles.topAlign : ''}`}
            data-zoom
          />
          <img
            src={imageLight}
            alt={title}
            className={`${styles.cardImage} ${styles.lightOnly} ${imageAlign === 'top' ? styles.topAlign : ''}`}
            data-zoom
          />
        </div>
      )}
      <h3 className={styles.cardTitle}>{href ? <Link to={href}>{title} <span aria-hidden="true">↗</span></Link> : title}</h3>
      <p className={styles.cardDesc}>{description}</p>
    </div>
  );
}
