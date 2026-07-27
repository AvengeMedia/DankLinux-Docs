import React from 'react';
import Head from '@docusaurus/Head';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './index.module.css';

export default function DankCalendarHome(): React.ReactNode {
  return (
    <div className={styles.page}>
      <Head>
        <title>DankCalendar</title>
        <meta name="application-name" content="DankCalendar" />
        <meta property="og:title" content="DankCalendar" />
        <meta property="og:site_name" content="DankCalendar" />
        <meta
          name="description"
          content="DankCalendar is a free, open-source desktop calendar application for Linux and FreeBSD. It lets users connect their Google Calendar and Google Tasks accounts to view, create, update, delete, and synchronize their own calendar events and tasks."
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'DankCalendar',
            operatingSystem: 'Linux, FreeBSD',
            applicationCategory: 'Productivity',
            url: 'https://danklinux.com/dankcalendar/',
            author: {'@type': 'Organization', name: 'AvengeMedia'},
            description:
              'DankCalendar is a free, open-source desktop calendar application for Linux and FreeBSD. It lets users connect their Google Calendar and Google Tasks accounts to view, create, update, delete, and synchronize their own calendar events and tasks. The application runs locally, has no hosted backend, and stores calendar data and OAuth credentials on the user’s device.',
            offers: {'@type': 'Offer', price: '0', priceCurrency: 'USD'},
          })}
        </script>
      </Head>

      <main className={styles.container}>
        <header className={styles.header}>
          <img className={styles.icon} src={useBaseUrl('/img/dankcalendar-icon.svg')} alt="DankCalendar logo" />
          <h1 className={styles.title}>DankCalendar</h1>
        </header>

        <p className={styles.lead}>
          DankCalendar is a free, open-source desktop calendar application for Linux and FreeBSD. It
          lets users connect their Google Calendar and Google Tasks accounts to view, create, update,
          delete, and synchronize their own calendar events and tasks. It also supports Local,
          Microsoft, CalDAV, and iCloud calendars in the same unified agenda.
        </p>

        <p className={styles.lead}>
          DankCalendar uses Google account data only to provide the calendar and task features
          requested by the user. The application runs locally, has no hosted backend, and stores
          calendar data and OAuth credentials on the user&apos;s device.
        </p>

        <nav className={styles.links} aria-label="DankCalendar links">
          <a className={`${styles.linkButton} ${styles.linkPrimary}`} href="/docs/dankcalendar/installation">
            Download DankCalendar
          </a>
          <a className={styles.linkButton} href="/docs/dankcalendar/">
            Documentation
          </a>
          <a className={styles.linkButton} href="/dankcalendar/privacy">
            Privacy Policy
          </a>
          <a className={styles.linkButton} href="/dankcalendar/terms">
            Terms of Service
          </a>
          <a className={styles.linkButton} href="https://github.com/AvengeMedia/dankcalendar">
            Source Code
          </a>
        </nav>

        <figure className={styles.screenshot}>
          <img
            src={useBaseUrl('/img/blog/dankcalendar/preview.png')}
            alt="DankCalendar month view with the settings and add-account dialogs open"
          />
          <figcaption>DankCalendar&apos;s month view, settings, and account setup.</figcaption>
        </figure>

        <section className={styles.section}>
          <h2>How DankCalendar uses Google user data</h2>
          <p>
            When a user connects a Google account, DankCalendar accesses the user&apos;s calendar
            events and task lists through the Google Calendar and Google Tasks APIs to display and
            synchronize them in the app, and the account&apos;s email address to identify the
            connected account. All data stays on the user&apos;s device: nothing is transmitted to
            the developer or any third party. See the{' '}
            <a href="/dankcalendar/privacy">Privacy Policy</a> for details, including how to revoke
            access.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Free and open source</h2>
          <p>
            DankCalendar is released under the MIT License and developed by AvengeMedia. The
            command-line executable is named <code>dcal</code>.
          </p>
        </section>

        <footer className={styles.footer}>
          <p>
            © 2026 AvengeMedia · <a href="/dankcalendar/privacy">Privacy Policy</a> ·{' '}
            <a href="/dankcalendar/terms">Terms of Service</a> · Contact: avengemedia dot us at gmail dot com
          </p>
        </footer>
      </main>
    </div>
  );
}
