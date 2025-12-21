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
  updated_at: string;
}

interface Theme {
  id: string;
  name: string;
  author: string;
  description: string;
  version: string;
  dark: Record<string, string>;
  light: Record<string, string>;
  previewUrl: string;
  updated_at: string;
}

interface PluginsResponse {
  plugins: Plugin[];
  count: number;
}

interface ThemesResponse {
  themes: Theme[];
  count: number;
}

type ActiveTab = 'plugins' | 'themes';

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

const sortOptions = [
  { id: 'updated_at', label: 'Recently Updated' },
  { id: 'name', label: 'Name' },
  { id: 'random', label: 'Random' },
];

export default function Plugins() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('plugins');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [filteredThemes, setFilteredThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCapability, setSelectedCapability] = useState('all');
  const [selectedCompositor, setSelectedCompositor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFirstPartyOnly, setShowFirstPartyOnly] = useState(false);
  const [sortBy, setSortBy] = useState('updated_at');

  useEffect(() => {
    switch (activeTab) {
      case 'themes':
        fetchThemes();
        break;
      default:
        fetchPlugins();
    }
  }, [sortBy, activeTab]);

  useEffect(() => {
    filterPlugins();
  }, [plugins, selectedCategory, selectedCapability, selectedCompositor, searchQuery, showFirstPartyOnly]);

  useEffect(() => {
    filterThemes();
  }, [themes, searchQuery]);

  const fetchPlugins = async () => {
    try {
      setLoading(true);
      const isDev = process.env.NODE_ENV === 'development';
      const baseUrl = isDev ? 'http://localhost:8337/plugins' : 'https://api.danklinux.com/plugins';
      const apiUrl = `${baseUrl}?sortBy=${sortBy}`;
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

    setFilteredPlugins(filtered);
  };

  const fetchThemes = async () => {
    try {
      setLoading(true);
      const isDev = process.env.NODE_ENV === 'development';
      const baseUrl = isDev ? 'http://localhost:8337/themes' : 'https://api.danklinux.com/themes';
      const apiUrl = `${baseUrl}?sortBy=${sortBy}`;
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch themes');
      }
      const data: ThemesResponse = await response.json();
      setThemes(data.themes);
      setFilteredThemes(data.themes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterThemes = () => {
    if (!searchQuery) {
      setFilteredThemes(themes);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = themes.filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.author.toLowerCase().includes(query) ||
      t.id.toLowerCase().includes(query)
    );
    setFilteredThemes(filtered);
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

  const formatUpdatedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Updated today';
    }
    if (diffInDays === 1) {
      return 'Updated yesterday';
    }
    if (diffInDays < 7) {
      return `Updated ${diffInDays} days ago`;
    }
    if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `Updated ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `Updated ${months} ${months === 1 ? 'month' : 'months'} ago`;
    }
    const years = Math.floor(diffInDays / 365);
    return `Updated ${years} ${years === 1 ? 'year' : 'years'} ago`;
  };

  return (
    <Layout
      title="Plugins & Themes"
      description="Discover and install plugins and themes for DankMaterialShell - extend your desktop with widgets, launchers, and more.">
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
              Explore <span className={styles.gradientText}>{activeTab === 'plugins' ? 'Plugins' : 'Themes'}</span>
            </h1>
            <p className={styles.subtitle}>
              {activeTab === 'plugins'
                ? 'Extend DankMaterialShell with powerful plugins for widgets, launchers, and more'
                : 'Customize your desktop with beautiful color schemes'}
            </p>
            <div className={styles.tabContainer}>
              <button
                className={`${styles.tabButton} ${activeTab === 'plugins' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('plugins')}
              >
                Plugins
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'themes' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('themes')}
              >
                Themes
              </button>
            </div>
          </section>

          <section className={styles.filters}>
            <div className={styles.topControls}>
              <input
                type="text"
                placeholder={activeTab === 'plugins' ? 'Search plugins...' : 'Search themes...'}
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className={styles.controlsRight}>
                {activeTab === 'plugins' && (
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={showFirstPartyOnly}
                      onChange={(e) => setShowFirstPartyOnly(e.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>Official only</span>
                  </label>
                )}
                <div className={styles.sortGroup}>
                  <label className={styles.filterLabel} htmlFor="sort-select">Sort by</label>
                  <select
                    id="sort-select"
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {activeTab === 'plugins' && (
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
            )}

            <div className={styles.resultsCount}>
              {activeTab === 'plugins'
                ? `${filteredPlugins.length} ${filteredPlugins.length === 1 ? 'plugin' : 'plugins'} found`
                : `${filteredThemes.length} ${filteredThemes.length === 1 ? 'theme' : 'themes'} found`}
            </div>
          </section>

          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading {activeTab}...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorContainer}>
              <p>Error: {error}</p>
              <button
                onClick={activeTab === 'plugins' ? fetchPlugins : fetchThemes}
                className={styles.retryButton}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && activeTab === 'plugins' && (
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
                        {plugin.updated_at && (
                          <span className={styles.tag}>{formatUpdatedAt(plugin.updated_at)}</span>
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

          {!loading && !error && activeTab === 'themes' && (
            <section className={styles.pluginsGrid}>
              {filteredThemes.map(theme => (
                <div key={theme.id} className={styles.pluginCard}>
                  <div className={styles.themePreview}>
                    <img src={theme.previewUrl} alt={theme.name} loading="lazy" />
                  </div>
                  <div className={styles.pluginContent}>
                    <div className={styles.pluginHeader}>
                      <div className={styles.pluginTitleGroup}>
                        <h3 className={styles.pluginName}>{theme.name}</h3>
                        <p className={styles.pluginAuthor}>by {theme.author}</p>
                      </div>
                    </div>

                    <p className={styles.pluginDescription}>{theme.description}</p>

                    <div className={styles.themeColors}>
                      <div className={styles.colorScheme}>
                        <span className={styles.schemeLabel}>Dark</span>
                        <div className={styles.colorSwatches}>
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: theme.dark.primary as string }}
                            title="Primary"
                          />
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: theme.dark.secondary as string }}
                            title="Secondary"
                          />
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: theme.dark.surface as string }}
                            title="Surface"
                          />
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: theme.dark.background as string }}
                            title="Background"
                          />
                        </div>
                      </div>
                      <div className={styles.colorScheme}>
                        <span className={styles.schemeLabel}>Light</span>
                        <div className={styles.colorSwatches}>
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: theme.light.primary as string }}
                            title="Primary"
                          />
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: theme.light.secondary as string }}
                            title="Secondary"
                          />
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: theme.light.surface as string }}
                            title="Surface"
                          />
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: theme.light.background as string }}
                            title="Background"
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.pluginTags}>
                      {theme.version && (
                        <span className={styles.tag}>v{theme.version}</span>
                      )}
                      {theme.updated_at && (
                        <span className={styles.tag}>{formatUpdatedAt(theme.updated_at)}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.cardGlow}></div>
                </div>
              ))}
            </section>
          )}

          {!loading && !error && activeTab === 'plugins' && filteredPlugins.length === 0 && (
            <div className={styles.emptyState}>
              <p>No plugins found matching your criteria.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCapability('all');
                  setSelectedCompositor('all');
                  setSearchQuery('');
                  setShowFirstPartyOnly(false);
                  setSortBy('updated_at');
                }}
                className={styles.resetButton}
              >
                Reset Filters
              </button>
            </div>
          )}

          {!loading && !error && activeTab === 'themes' && filteredThemes.length === 0 && (
            <div className={styles.emptyState}>
              <p>No themes found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSortBy('updated_at');
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
