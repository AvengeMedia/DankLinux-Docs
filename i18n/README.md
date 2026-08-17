# Translation workflow

English is the canonical source for this site. Docusaurus builds every configured
locale as a separate site and uses the English content whenever a translated file
does not exist yet. This makes it safe to translate incrementally.

## Add a locale

1. Add the locale to `locales` and `localeConfigs` in `docusaurus.config.ts`.
2. If necessary, add the language supported by the local-search plugin to its
   `language` option.
3. Install dependencies and create the translation workspace:

   ```bash
   npm ci
   npm run i18n:scaffold -- de
   ```

The scaffold command writes Docusaurus UI message catalogs and copies every
English MD/MDX source file into the correct locale directory. It never overwrites
an existing translation, so it can be re-run to pick up newly added source files.

## Directory layout

```text
i18n/<locale>/
├── code.json
├── docusaurus-plugin-content-docs/
│   ├── current/                 # English source: docs/
│   ├── version-1.5/             # English source: versioned_docs/version-1.5/
│   └── current.json             # sidebar/category UI messages
├── docusaurus-plugin-content-blog/   # English source: blog/
├── docusaurus-plugin-content-pages/  # translatable MD/MDX under src/pages/
└── docusaurus-theme-classic/         # navbar, footer, and theme messages
```

- Translate prose in the copied MD/MDX files without changing document IDs,
  filenames, imports, code samples, or explicit heading IDs.
- Translate React UI strings through `@docusaurus/Translate`; generated messages
  are stored in `code.json`.
- Translate navbar, footer, sidebar, and other generated labels in their JSON
  catalogs. Keep message keys unchanged and edit only their `message` values.
- When English content changes, update the matching translated file manually.
  Re-running the scaffold command adds new files but deliberately preserves all
  existing translations.

## Preview and verify

```bash
npm run start:zh-Hans
npm run build
```

`npm run build` builds every configured locale. To validate only one locale while
working, run `npm run build -- --locale zh-Hans`.
