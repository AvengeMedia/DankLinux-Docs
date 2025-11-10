import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import styles from './plugins.module.css';

interface Plugin {
  id: string;
  name: string;
  capabilities: string[];
  category: string;
  repo: string;
  author: string;
  firstParty: boolean;
  description: string;
  dependencies: string[];
  compositors: string[];
  distro: string[];
  screenshot?: string;
  version?: string;
  icon?: string;
  permissions?: string[];
  requires_dms?: string;
}

interface PluginsResponse {
  plugins: Plugin[];
  count: number;
}

const categories = [
  { id: 'all', label: 'All Plugins' },
  { id: 'utilities', label: 'Utilities' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'monitoring', label: 'Monitoring' },
];

const capabilities = [
  { id: 'all', label: 'All Types' },
  { id: 'dankbar-widget', label: 'DankBar Widget' },
  { id: 'launcher', label: 'Launcher' },
  { id: 'control-center', label: 'Control Center' },
  { id: 'watch-events', label: 'Event Watcher' },
  { id: 'set-wallpaper', label: 'Wallpaper' },
];

const compositors = [
  { id: 'all', label: 'All Compositors' },
  { id: 'niri', label: 'Niri' },
  { id: 'hyprland', label: 'Hyprland' },
  { id: 'sway', label: 'Sway' },
  { id: 'any', label: 'Any' },
];

export default function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCapability, setSelectedCapability] = useState('all');
  const [selectedCompositor, setSelectedCompositor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFirstPartyOnly, setShowFirstPartyOnly] = useState(false);

  useEffect(() => {
    fetchPlugins();
  }, []);

  useEffect(() => {
    filterPlugins();
  }, [plugins, selectedCategory, selectedCapability, selectedCompositor, searchQuery, showFirstPartyOnly]);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const isDev = process.env.NODE_ENV === 'development';
      const apiUrl = isDev ? 'http://localhost:8337/plugins' : 'https://api.danklinux.com/plugins';
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch plugins');
      }
      const data: PluginsResponse = await response.json();
      setPlugins(data.plugins);
      setFilteredPlugins(data.plugins);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterPlugins = () => {
    let filtered = [...plugins];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedCapability !== 'all') {
      filtered = filtered.filter(p => p.capabilities.includes(selectedCapability));
    }

    if (selectedCompositor !== 'all') {
      filtered = filtered.filter(p =>
        p.compositors.includes(selectedCompositor) || p.compositors.includes('any')
      );
    }

    if (showFirstPartyOnly) {
      filtered = filtered.filter(p => p.firstParty);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      if (a.firstParty && !b.firstParty) return -1;
      if (!a.firstParty && b.firstParty) return 1;
      return Math.random() - 0.5;
    });

    setFilteredPlugins(filtered);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    document.addEventListener('mousemove', handleGlobalMouseMove);
    return () => document.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  const getPluginIcon = (plugin: Plugin) => {
    if (plugin.icon) {
      return (
        <span className={`material-symbols-outlined ${styles.pluginIconMaterial}`}>
          {plugin.icon}
        </span>
      );
    }
    return null;
  };

  return (
    <Layout
      title="Plugin Registry"
      description="Discover and install plugins for DankMaterialShell - extend your desktop with widgets, launchers, and more.">
      <Head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </Head>
      <div className={styles.container} onMouseMove={handleMouseMove}>
        <div className={styles.backgroundPattern}></div>

        <div className={styles.gradientBackground}>
          <div className={styles.gradientOrb1}></div>
          <div className={styles.gradientOrb2}></div>
          <div className={styles.gradientOrb3}></div>
        </div>

        <div className={styles.gridOverlay}></div>

        <div className={styles.content}>
          <section className={styles.header}>
            <h1 className={styles.title}>
              Explore <span className={styles.gradientText}>Plugins</span>
            </h1>
            <p className={styles.subtitle}>
              Extend DankMaterialShell with powerful plugins for widgets, launchers, and more
            </p>
          </section>

          <section className={styles.filters}>
            <div className={styles.filterGroup}>
              <input
                type="text"
                placeholder="Search plugins..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className={styles.filterRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Category</label>
                <div className={styles.filterButtons}>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      className={`${styles.filterButton} ${selectedCategory === cat.id ? styles.active : ''}`}
                      onClick={() => setSelectedCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Type</label>
                <div className={styles.filterButtons}>
                  {capabilities.map(cap => (
                    <button
                      key={cap.id}
                      className={`${styles.filterButton} ${selectedCapability === cap.id ? styles.active : ''}`}
                      onClick={() => setSelectedCapability(cap.id)}
                    >
                      {cap.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Compositor</label>
                <div className={styles.filterButtons}>
                  {compositors.map(comp => (
                    <button
                      key={comp.id}
                      className={`${styles.filterButton} ${selectedCompositor === comp.id ? styles.active : ''}`}
                      onClick={() => setSelectedCompositor(comp.id)}
                    >
                      {comp.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={showFirstPartyOnly}
                  onChange={(e) => setShowFirstPartyOnly(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>Official plugins only</span>
              </label>
            </div>

            <div className={styles.resultsCount}>
              {filteredPlugins.length} {filteredPlugins.length === 1 ? 'plugin' : 'plugins'} found
            </div>
          </section>

          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading plugins...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorContainer}>
              <p>Error: {error}</p>
              <button onClick={fetchPlugins} className={styles.retryButton}>
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <section className={styles.pluginsGrid}>
              {filteredPlugins.map(plugin => (
                <div key={plugin.id} className={styles.pluginCard}>
                  {plugin.screenshot && (
                    <div className={styles.pluginImage}>
                      <img src={plugin.screenshot} alt={plugin.name} loading="lazy" />
                    </div>
                  )}
                  <div className={styles.pluginContent}>
                    <div className={styles.pluginHeader}>
                      {getPluginIcon(plugin)}
                      <div className={styles.pluginTitleGroup}>
                        <h3 className={styles.pluginName}>
                          {plugin.name}
                          {plugin.firstParty && (
                            <span className={styles.officialBadge}>Official</span>
                          )}
                        </h3>
                        <p className={styles.pluginAuthor}>by {plugin.author}</p>
                      </div>
                    </div>

                    <p className={styles.pluginDescription}>{plugin.description}</p>

                    <div className={styles.pluginMeta}>
                      <div className={styles.pluginTags}>
                        <span className={styles.tag}>{plugin.category}</span>
                        {plugin.version && (
                          <span className={styles.tag}>v{plugin.version}</span>
                        )}
                      </div>

                      <div className={styles.pluginCapabilities}>
                        {plugin.capabilities.slice(0, 2).map(cap => (
                          <span key={cap} className={styles.capability}>
                            {cap}
                          </span>
                        ))}
                        {plugin.capabilities.length > 2 && (
                          <span className={styles.capability}>
                            +{plugin.capabilities.length - 2}
                          </span>
                        )}
                      </div>

                      {plugin.compositors.length > 0 && (
                        <div className={styles.pluginCompositors}>
                          {plugin.compositors.map(comp => (
                            <span key={comp} className={styles.compositor}>
                              {comp}
                            </span>
                          ))}
                        </div>
                      )}

                      {plugin.dependencies.length > 0 && (
                        <div className={styles.pluginDeps}>
                          <strong>Dependencies:</strong> {plugin.dependencies.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className={styles.pluginActions}>
                      <a
                        href={plugin.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.repoButton}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        View Repository
                      </a>
                    </div>
                  </div>
                  <div className={styles.cardGlow}></div>
                </div>
              ))}
            </section>
          )}

          {!loading && !error && filteredPlugins.length === 0 && (
            <div className={styles.emptyState}>
              <p>No plugins found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCapability('all');
                  setSelectedCompositor('all');
                  setSearchQuery('');
                  setShowFirstPartyOnly(false);
                }}
                className={styles.resetButton}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
