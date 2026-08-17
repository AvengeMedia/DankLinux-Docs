import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Root({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const {i18n, siteConfig} = useDocusaurusContext();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const {pathname} = location;
    const baseUrl = siteConfig.baseUrl.replace(/\/$/, '');
    const localePrefix = i18n.currentLocale === i18n.defaultLocale
      ? ''
      : `/${i18n.currentLocale}`;
    const sitePath = pathname.slice(baseUrl.length) || '/';
    const localizedPath = sitePath.startsWith(localePrefix)
      ? sitePath.slice(localePrefix.length) || '/'
      : sitePath;
    const isDocsPage = localizedPath.startsWith('/docs');
    const isBlogPage = localizedPath.startsWith('/blog');
    const isLandingPage = localizedPath === '/';

    const applyClass = () => {
      document.body.classList.remove('docs-page', 'landing-page', 'blog-page');

      if (isDocsPage) {
        document.body.classList.add('docs-page');
      } else if (isBlogPage) {
        document.body.classList.add('blog-page');
      } else if (isLandingPage) {
        document.body.classList.add('landing-page');
      }

      document.body.setAttribute('data-path', pathname);
    };

    applyClass();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') return;

        const body = document.body.classList;
        const needsReapply =
          (isDocsPage && !body.contains('docs-page')) ||
          (isBlogPage && !body.contains('blog-page')) ||
          (isLandingPage && !body.contains('landing-page'));

        if (needsReapply) applyClass();
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, [i18n.currentLocale, i18n.defaultLocale, location, siteConfig.baseUrl]);

  return <>{children}</>;
}
