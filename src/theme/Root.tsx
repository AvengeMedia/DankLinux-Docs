import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { Prism } from "prism-react-renderer";

// Nix syntax highlighting isn't loaded by default
(typeof global !== "undefined" ? global : window).Prism = Prism;
import("prismjs/components/prism-nix");

export default function Root({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const { pathname } = location;
    const isDocsPage = pathname.startsWith('/docs');
    const isBlogPage = pathname.startsWith('/blog');
    const isLandingPage = pathname === '/';

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
  }, [location]);

  return <>{children}</>;
}
