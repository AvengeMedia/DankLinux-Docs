import React, { useEffect } from 'react';
import { useLocation } from '@docusaurus/router';

export default function Root({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const { pathname } = location;
    const isDocsPage = pathname.startsWith('/docs');

    const applyClass = () => {
      if (isDocsPage) {
        document.body.classList.add('docs-page');
        document.body.classList.remove('landing-page');
      } else {
        document.body.classList.add('landing-page');
        document.body.classList.remove('docs-page');
      }
      // Add pathname as data attribute for CSS targeting
      document.body.setAttribute('data-path', pathname);
    };

    // Apply initially
    applyClass();

    // Use MutationObserver to watch for class changes and re-apply
    // This is necessary because Docusaurus's theme may try to remove our custom classes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasCorrectClass = isDocsPage
            ? document.body.classList.contains('docs-page')
            : document.body.classList.contains('landing-page');

          if (!hasCorrectClass) {
            applyClass();
          }
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Cleanup: disconnect observer
    return () => {
      observer.disconnect();
    };
  }, [location]);

  return <>{children}</>;
}
