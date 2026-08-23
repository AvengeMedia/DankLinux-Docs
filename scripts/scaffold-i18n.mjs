import {constants} from 'node:fs';
import {copyFile, mkdir, readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const locale = process.argv[2];

if (!locale || !/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(locale)) {
  console.error('Usage: npm run i18n:scaffold -- <locale>');
  console.error('Example: npm run i18n:scaffold -- de');
  process.exit(1);
}

if (locale === 'en') {
  console.error('English is the source locale and does not need a translation workspace.');
  process.exit(1);
}

const root = process.cwd();
const localeRoot = path.join(root, 'i18n', locale);
const binDirectory = path.join(root, 'node_modules', '.bin');
const executable = (name) => path.join(
  binDirectory,
  process.platform === 'win32' ? `${name}.cmd` : name,
);

const compile = spawnSync(
  executable('tsc'),
  ['--project', 'tsconfig.client.json'],
  {cwd: root, stdio: 'inherit'},
);

if (compile.error) {
  console.error('Could not run TypeScript. Install dependencies with `npm ci` first.');
  process.exit(1);
}

if (compile.status !== 0) {
  process.exit(compile.status ?? 1);
}

const translations = spawnSync(
  executable('docusaurus'),
  ['write-translations', '--locale', locale],
  {cwd: root, stdio: 'inherit'},
);

if (translations.error) {
  console.error('Could not run Docusaurus. Install dependencies with `npm ci` first.');
  process.exit(1);
}

if (translations.status !== 0) {
  process.exit(translations.status ?? 1);
}

let copied = 0;
let skipped = 0;

async function copyMissingTree(source, destination, include) {
  let entries;
  try {
    entries = await readdir(source, {withFileTypes: true});
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      await copyMissingTree(sourcePath, destinationPath, include);
      continue;
    }

    if (!entry.isFile() || !include(sourcePath)) continue;

    await mkdir(path.dirname(destinationPath), {recursive: true});
    try {
      await copyFile(sourcePath, destinationPath, constants.COPYFILE_EXCL);
      copied += 1;
    } catch (error) {
      if (error.code === 'EEXIST') {
        skipped += 1;
        continue;
      }
      throw error;
    }
  }
}

const isMdxContent = (file) => /\.(md|mdx)$/.test(file);

await copyMissingTree(
  path.join(root, 'docs'),
  path.join(localeRoot, 'docusaurus-plugin-content-docs', 'current'),
  isMdxContent,
);

const versionedDocsRoot = path.join(root, 'versioned_docs');
for (const entry of await readdir(versionedDocsRoot, {withFileTypes: true})) {
  if (!entry.isDirectory() || !entry.name.startsWith('version-')) continue;
  await copyMissingTree(
    path.join(versionedDocsRoot, entry.name),
    path.join(localeRoot, 'docusaurus-plugin-content-docs', entry.name),
    isMdxContent,
  );
}

await copyMissingTree(
  path.join(root, 'blog'),
  path.join(localeRoot, 'docusaurus-plugin-content-blog'),
  isMdxContent,
);

await copyMissingTree(
  path.join(root, 'src', 'pages'),
  path.join(localeRoot, 'docusaurus-plugin-content-pages'),
  isMdxContent,
);

console.log(`Translation workspace ready for ${locale}.`);
console.log(`Copied ${copied} source files; kept ${skipped} existing translations.`);
console.log('Translate the copied files in place. Re-running this command only adds new files.');
