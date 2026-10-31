// Finishes the exported web app (run after `expo export --platform web`):
//  1. A light "dokyu" loading screen that shows the moment the page opens, instead of a blank white page while the
//     JavaScript downloads. The app removes it once it is ready (app/_layout.tsx).
//  2. Preloads the Poppins fonts, so they download together with the JavaScript instead of after it.
//
// Usage: node scripts/finish-web.mjs <export-dir>
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node scripts/finish-web.mjs <export-dir>');
  process.exit(1);
}
const indexFile = path.join(dir, 'index.html');
let html = readFileSync(indexFile, 'utf8');

if (html.includes('id="boot"')) {
  console.log('finish-web: already done');
  process.exit(0);
}

function walk(d) {
  return readdirSync(d).flatMap((name) => {
    const full = path.join(d, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const fonts = walk(dir)
  .filter((f) => /Poppins_(400Regular|500Medium|600SemiBold|700Bold)\.[0-9a-f]+\.ttf$/.test(f))
  .map((f) => '/' + path.relative(dir, f).split(path.sep).join('/'));

const preloads = fonts
  .map(
    (href) =>
      `<link rel="preload" href="${encodeURI(href)}" as="font" type="font/ttf" crossorigin>`,
  )
  .join('\n');

const bootStyle = `<style id="boot-style">
#boot{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:#fff;transition:opacity .25s ease}
#boot.hide{opacity:0;pointer-events:none}
#boot .wm{font:700 44px/1 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;letter-spacing:-1px;color:#2042C4}
#boot .wm b{color:#E0A800;font-weight:700}
#boot .dots{display:flex;gap:8px}
#boot .dots i{width:9px;height:9px;border-radius:50%;background:#D5DEFF;animation:bootdot 1s infinite ease-in-out}
#boot .dots i:nth-child(2){animation-delay:.15s}#boot .dots i:nth-child(3){animation-delay:.3s}
@keyframes bootdot{0%,80%,100%{background:#D5DEFF;transform:scale(1)}40%{background:#2042C4;transform:scale(1.25)}}
@media (prefers-reduced-motion:reduce){#boot .dots i{animation:none}}
</style>`;

const boot = `<div id="boot" role="status" aria-label="Loading Dokyu"><div class="wm">dok<b>y</b>u</div><div class="dots"><i></i><i></i><i></i></div></div>`;

html = html.replace('</head>', `${preloads}\n${bootStyle}\n</head>`);
html = html.replace('<div id="root"></div>', `${boot}\n    <div id="root"></div>`);
writeFileSync(indexFile, html);
console.log(`finish-web: loading screen added, ${fonts.length} fonts preloaded`);
