import React, { useState, useEffect } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const compositors = [
  { name: 'niri', logo: '/img/niri.svg', duration: 500 },
  { name: 'Hyprland', logo: '/img/hyprland.svg', duration: 500 },
  { name: 'MangoWC', logo: '/img/mango.png', duration: 500 },
  { name: 'Sway', logo: '/img/sway.svg', duration: 500 },
  { name: 'wayland', logo: null, duration: 0 }, // End state - stays forever
];

export default function Home() {
  const [typed, setTyped] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [currentCompositor, setCurrentCompositor] = useState(-1);
  const [showAllLogos, setShowAllLogos] = useState(false);
  const fullText = 'curl -fsSL https://install.danklinux.com | sh';

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

          // Show all logos after wayland appears
          if (index === compositors.length - 2) {
            setTimeout(() => {
              setShowAllLogos(true);
            }, 400);
          }
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
                  <span className={`${styles.allLogosRow} ${showAllLogos ? styles.showLogos : ''}`}>
                    {compositors.slice(0, 4).map((compositor) => (
                      <img
                        key={compositor.name}
                        src={compositor.logo}
                        alt={compositor.name}
                        className={styles.smallLogo}
                      />
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
                <div className={styles.terminalWindow}>
                  <div className={styles.terminalHeader}>
                    <div className={styles.terminalDots}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <div className={styles.terminalTitle}>~</div>
                    <div className={styles.terminalSpacer}></div>
                  </div>
                  <div className={styles.terminalBody}>
                    <div className={styles.terminalLine}>
                      <span className={styles.prompt}>❯</span>
                      <span className={styles.typedCommand}>{typed}</span>
                      <span className={`${styles.terminalCursor} ${!showCursor ? styles.hidden : ''}`}>█</span>
                    </div>
                    {typed.length >= fullText.length && (
                      <>
                        <div className={`${styles.terminalLine} ${styles.fadeIn}`}>
                          <span className={styles.output}>→ Detecting distribution...</span>
                        </div>
                        <div className={`${styles.terminalLine} ${styles.fadeIn}`} style={{ animationDelay: '0.3s' }}>
                          <span className={styles.success}>✓ Installing dependencies</span>
                        </div>
                        <div className={`${styles.terminalLine} ${styles.fadeIn}`} style={{ animationDelay: '0.6s' }}>
                          <span className={styles.success}>✓ Configuring DankMaterialShell</span>
                        </div>
                        <div className={`${styles.terminalLine} ${styles.fadeIn}`} style={{ animationDelay: '0.9s' }}>
                          <span className={styles.success}>✓ Ready to rock!</span>
                        </div>
                      </>
                    )}
                  </div>
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
                description="A modern and beautiful desktop shell with dynamic theming and smooth animations"
              />
              <FeatureCard
                icon=""
                title="Dank Installer"
                description="One line installer for an automated quick and easy setup"
              />
              <FeatureCard
                icon=""
                title="Dank GOP"
                description="Stateless system and process monitoring for CPU, memory, GPU, and network"
              />
              <FeatureCard
                icon=""
                title="Dank Greeter"
                description="An aesthetically pleasing greetd greeter for your desktop"
              />
              <FeatureCard
                icon=""
                title="Dank Search"
                description="Dsearch is a native fast and efficient file system search tool"
              />
              <FeatureCard
                icon=""
                title="Fully Customizable"
                description="Plugins, widgets, themes, and configs to make it yours"
              />
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
                    <source src="https://github.com/user-attachments/assets/40d2c56e-c1c9-4671-b04f-8f8b7b83b9ec" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>DankMaterialShell in Action</h3>
                  <p>Experience the fluid interface and beautiful animations</p>
                </div>
              </div>

              {/* Dashboard */}
              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="https://github.com/user-attachments/assets/a937cf35-a43b-4558-8c39-5694ff5fcac4"
                    alt="DankDash - Overview Dashboard"
                    className={styles.screenshotImage}
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>Dashboard Overview</h3>
                  <p>Calendar, weather, system info at a glance</p>
                </div>
              </div>

              {/* Application Launcher */}
              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="https://github.com/user-attachments/assets/2da00ea1-8921-4473-a2a9-44a44535a822"
                    alt="Spotlight Launcher"
                    className={styles.screenshotImage}
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>App Launcher</h3>
                  <p>Quick access to all your applications</p>
                </div>
              </div>

              {/* Control Center */}
              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="/img/Control-Center.png"
                    alt="Control Center"
                    className={styles.screenshotImage}
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>Control Center</h3>
                  <p>System settings and quick toggles</p>
                </div>
              </div>

              {/* System Monitor */}
              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="https://github.com/user-attachments/assets/b3c817ec-734d-4974-929f-2d11a1065349"
                    alt="System Monitor"
                    className={styles.screenshotImage}
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>System Monitor</h3>
                  <p>Real-time performance metrics</p>
                </div>
              </div>

              {/* More screenshots... */}
              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="https://github.com/user-attachments/assets/903f7c60-146f-4fb3-a75d-a4823828f298"
                    alt="Widget Customization"
                    className={styles.screenshotImage}
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>Widget Customization</h3>
                  <p>Personalize your desktop experience</p>
                </div>
              </div>

              {/* Plugins */}
              <div className={styles.screenshotCard}>
                <div className={styles.screenshotFrame}>
                  <img
                    src="/img/Plugins.png"
                    alt="Plugins"
                    className={styles.screenshotImage}
                  />
                </div>
                <div className={styles.screenshotLabel}>
                  <h3>Plugins</h3>
                  <p>Browse and install plugins from the DMS registry</p>
                </div>
              </div>
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
                  to create cohesive, personalized experiences.
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
