/**
 * @file Renders every Mermaid diagram in docs/diagrams/*.mmd to public/diagrams/*.svg.
 *
 * The .mmd text files are the source of truth (reviewable in git diffs); the
 * SVGs are what README.md and the Readme page show. Uses the Mermaid package
 * inside headless Chromium (Playwright), so no extra tools are needed.
 * CR-51: valid XML (no HTML labels, one style attribute) so the diagrams display everywhere.
 * Usage: node tools/render-diagrams.mjs            (set PW_CHROMIUM to use another Chromium)
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { chromium } from 'playwright';

const src = new URL('../docs/diagrams/', import.meta.url);
const out = new URL('../public/diagrams/', import.meta.url);
const mermaidJs = readFileSync(new URL('../node_modules/mermaid/dist/mermaid.min.js', import.meta.url), 'utf8');

const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: mermaidJs });
await page.evaluate(() =>
  window.mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    // Plain SVG text instead of HTML labels: the files must be valid XML so that they display
    // as <img> on the Readme page and on GitHub (CR-51).
    htmlLabels: false,
    fontFamily: 'Segoe UI, Arial, sans-serif',
    themeVariables: {
      primaryColor: '#e4e9ff',
      primaryBorderColor: '#2a4bff',
      primaryTextColor: '#10162b',
      lineColor: '#586079',
      secondaryColor: '#eceff4',
      tertiaryColor: '#ffffff',
      clusterBkg: '#f4f6fa',
      clusterBorder: '#d3d8e3',
      fontSize: '15px',
    },
    flowchart: { htmlLabels: false, curve: 'basis' },
  }),
);

for (const file of readdirSync(src).filter((f) => f.endsWith('.mmd'))) {
  const text = readFileSync(new URL(file, src), 'utf8');
  const id = file.replace('.mmd', '');
  const svg = await page.evaluate(async ([id, text]) => (await window.mermaid.render(`d-${id}`, text)).svg, [id, text]);
  // White background so the diagram stays readable in dark mode and on GitHub. Mermaid already
  // writes a style attribute, so the background is added to it (a second style attribute is invalid).
  const fixed = svg.includes(' style="')
    ? svg.replace(' style="', ' style="background:#ffffff;')
    : svg.replace('<svg ', '<svg style="background:#ffffff" ');
  writeFileSync(new URL(`${id}.svg`, out), fixed);
  console.log(`rendered ${id}.svg`);
}
await browser.close();
