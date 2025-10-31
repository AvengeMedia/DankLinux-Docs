import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const compositors = [
  { name: 'niri', logo: '/img/niri.svg', duration: 600 },
  { name: 'Hyprland', logo: '/img/hyprland.svg', duration: 600 },
  { name: 'MangoWC', logo: '/img/mango.png', duration: 600 },
  { name: 'Sway', logo: '/img/sway.svg', duration: 600 },
  { name: 'Wayland', logo: null, duration: 0 }, // End state - stays forever
];

const compositorLinks: Record<string, string> = {
  'niri': 'https://github.com/YaLTeR/niri',
  'Hyprland': 'https://hyprland.org/',
  'MangoWC': 'https://github.com/YukiWorkshop/MangoWC',
  'Sway': 'https://swaywm.org/',
};

export default function Home() {
  const [typed, setTyped] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [currentCompositor, setCurrentCompositor] = useState(-1);
  const [copied, setCopied] = useState(false);
  const fullText = 'curl -fsSL https://install.danklinux.com | sh';

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
    const handleMouseMove = (e: MouseEvent) => {
      // Set CSS custom properties for basic mouse tracking
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (typed.length < fullText.length) {
      const timeout = setTimeout(() => {
        setTyped(fullText.slice(0, typed.length + 1));
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [typed, fullText]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    // Show niri sooner - right after "for" starts animating
    const showFirstTimeout = setTimeout(() => {
      setCurrentCompositor(0);
    }, 800);
    timeouts.push(showFirstTimeout);

    // Start rotation sequence - use a fixed rhythm for all
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
  }, []);


  return (
    <Layout
      title="Modern Desktop Environment"
      description="A modern Wayland desktop environment with beautiful widgets and powerful monitoring">
      <div className={styles.container}>
        {/* Background pattern overlay */}
        <div className={styles.backgroundPattern}></div>
        
        {/* Animated gradient background orbs */}
        <div className={styles.gradientBackground}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
          <div className={styles.gradientOrb3}></div>
        </div>

        {/* Animated grid overlay with basic mouse tracking */}
        <div className={styles.gridOverlay}></div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Hero Section with massive gradient title */}
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                <span className={styles.heroLine}>Modern Desktop</span>
                <span className={styles.heroLine}>for</span>
                <span className={styles.compositorRotatorWrapper}>
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

              {/* Call to action buttons */}
              <div className={styles.heroCTA}>
                <Link to="/docs/getting-started" className={styles.primaryCTA}>
                  <span>Get Started</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={styles.ctaArrow}>
                    <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link to="/docs" className={styles.secondaryCTA}>
                  Documentation
                </Link>
              </div>

              {/* Floating terminal window */}
              <div className={styles.terminalFloat}>
                <div className={styles.terminalWindow} onClick={handleCopyCommand}>
                  {copied && (
                    <div className={styles.copiedIndicator}>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" style={{ marginRight: '0.5rem' }}>
                        <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Copied!
                    </div>
                  )}
                  <div className={styles.terminalHeader}>
                    <div className={styles.terminalLogos}>
                      {compositors.slice(0, 4).map((compositor) => (
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
                            src={compositor.logo}
                            alt={compositor.name}
                            className={styles.terminalLogo}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className={styles.terminalBody}>
                    <div className={styles.terminalLine}>
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
                      <span className={`${styles.terminalCursor} ${!showCursor ? styles.hidden : ''}`}>█</span>
                    </div>
                    <div className={`${styles.terminalLine} ${typed.length >= fullText.length ? styles.fadeIn : styles.hidden}`}>
                      <span className={styles.output}>→ Detecting distribution...</span>
                    </div>
                    <div className={`${styles.terminalLine} ${typed.length >= fullText.length ? styles.fadeIn : styles.hidden}`} style={{ animationDelay: '0.3s' }}>
                      <span className={styles.success}>✓ Installing dependencies</span>
                    </div>
                    <div className={`${styles.terminalLine} ${typed.length >= fullText.length ? styles.fadeIn : styles.hidden}`} style={{ animationDelay: '0.6s' }}>
                      <span className={styles.success}>✓ Configuring DankMaterialShell</span>
                    </div>
                    <div className={`${styles.terminalLine} ${typed.length >= fullText.length ? styles.fadeIn : styles.hidden}`} style={{ animationDelay: '0.9s' }}>
                      <span className={styles.success}>✓ Ready to rock!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

                    {/* Screenshot Gallery */}
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
              {/* Featured Video - DankMaterialShell Overview */}
              <div className={`${styles.screenshotCard} ${styles.large}`}>
                <div className={styles.screenshotFrame}>
                  <video
                    className={styles.screenshotVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    controlsList="nodownload"
                  >
                    <source src="https://github.com/user-attachments/assets/1200a739-7770-4601-8b85-695ca527819a" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
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
                  />
                  <img
                    src="/img/homepage/dankdash_light.png"
                    alt="DankDash - Overview Dashboard"
                    className={`${styles.screenshotImage} ${styles.lightOnly}`}
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
                  />
                  <img
                    src="/img/homepage/launcher_light.png"
                    alt="Spotlight Launcher"
                    className={`${styles.screenshotImage} ${styles.lightOnly} ${styles.topAlign}`}
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
                  />
                  <img
                    src="/img/homepage/controlcenter_light.png"
                    alt="Control Center"
                    className={`${styles.screenshotImage} ${styles.lightOnly}`}
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
                  />
                  <img
                    src="/img/homepage/process_light.png"
                    alt="System Monitor"
                    className={`${styles.screenshotImage} ${styles.lightOnly}`}
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
                  />
                  <img
                    src="/img/homepage/widget_light.png"
                    alt="Widget Customization"
                    className={`${styles.screenshotImage} ${styles.lightOnly}`}
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
                  />
                  <img
                    src="/img/homepage/plugins_light.png"
                    alt="Plugins"
                    className={`${styles.screenshotImage} ${styles.lightOnly}`}
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>Plugins</h3>
                  <p>Extend functionality with new widgets, launcher features, and more.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features section with cards */}
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
                icon=""
                title="DankMaterialShell"
                description="A modern and beautiful desktop shell with dynamic theming and smooth animations."
              />
              <FeatureCard
                icon=""
                title="Dank Install"
                description="One line installer for an automated quick and easy setup."
              />
              <FeatureCard
                icon=""
                title="Dank GOP"
                description="Stateless system and process monitoring for CPU, memory, GPU, disks, and network interfaces."
              />
              <FeatureCard
                icon=""
                title="Dank Greeter"
                description="An aesthetically pleasing greetd greeter for your desktop."
              />
              <FeatureCard
                icon=""
                title="Dank Search"
                description="Blazingly fast and efficient file system search tool."
              />
              <FeatureCard
                icon=""
                title="Fully Customizable"
                description="Plugins, widgets, themes, and configs to make it yours"
              />
            </div>
          </section>

          {/* Showcase with gradient visualization */}
          <section className={styles.showcase}>
            <div className={styles.showcaseGrid}>
              <div className={styles.showcaseText}>
                <h2 className={styles.showcaseTitle}>
                  Beautiful by <span className={styles.gradientText}>default</span>
                </h2>
                <p className={styles.showcaseDesc}>
                  Dynamic theming powered by matugen extracts colors from your wallpaper
                  to create a cohesive experience.
                </p>
                <ul className={styles.showcaseFeatures}>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Material Design 3 color schemes</span>
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Automatic theming for system applications.</span>
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Automatic light/dark mode</span>
                  </li>
                  <li>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10L8 14L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Smooth animations throughout</span>
                  </li>
                </ul>
              </div>
              <div className={styles.showcaseVisual}>
                <div className={styles.colorGrid}>
                  <div className={styles.colorBlock} style={{ background: 'linear-gradient(135deg, #805AD5, #6B46C1)' }}></div>
                  <div className={styles.colorBlock} style={{ background: 'linear-gradient(135deg, #D0BCFF, #9F7AEA)' }}></div>
                  <div className={styles.colorBlock} style={{ background: 'linear-gradient(135deg, #B794F4, #805AD5)' }}></div>
                  <div className={styles.colorBlock} style={{ background: 'linear-gradient(135deg, #6B46C1, #553C9A)' }}></div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, description }: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.cardIcon}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{description}</p>
      <div className={styles.cardGlow}></div>
    </div>
  );
}
