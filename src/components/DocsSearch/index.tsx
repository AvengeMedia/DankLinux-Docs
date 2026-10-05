import React, {useCallback, useEffect, useId, useRef, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import SearchBar from '@theme/SearchBar';
import styles from './styles.module.css';

export default function DocsSearch() {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const location = useLocation();
  const [shortcut, setShortcut] = useState('Ctrl K');
  const open = useCallback(() => {
    if (!dialog.current) return;
    if (!dialog.current.open) dialog.current.showModal();
    const input = dialog.current.querySelector('input');
    input?.focus();
    input?.select();
  }, []);

  useEffect(() => {
    if (navigator.platform.includes('Mac')) setShortcut('⌘ K');
    const handleKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'k') return;
      event.preventDefault();
      event.stopPropagation();
      open();
    };
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [open]);

  useEffect(() => {
    dialog.current?.close();
  }, [location.key]);

  return (
    <>
      <button type="button" className={styles.trigger} onClick={open} aria-label="Search documentation" aria-haspopup="dialog" aria-keyshortcuts="Control+k Meta+k">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
        <span>Search</span><kbd>{shortcut}</kbd>
      </button>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} onClick={event => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}>
        <div className={styles.panel}>
          <div className={styles.header}>
            <h2 id={titleId}>Search documentation</h2>
            <button type="button" className={styles.close} onClick={() => dialog.current?.close()} aria-label="Close search">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>
          <SearchBar />
        </div>
      </dialog>
    </>
  );
}
