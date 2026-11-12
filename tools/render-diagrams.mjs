/**
 * @file Renders every Mermaid diagram in docs/diagrams/*.mmd to public/diagrams/*.svg.
 *
 * The .mmd text files are the source of truth (reviewable in git diffs); the
 * SVGs are what README.md and the Readme page show. Uses the Mermaid package
 * inside headless Chromium (Playwright), so no extra tools are needed.
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
    fontFamily: 'Calibri, Carlito, Segoe UI, Arial, sans-serif',
    themeVariables: {
      primaryColor: '#dbe6fd',
      primaryBorderColor: '#2563eb',
      primaryTextColor: '#1c1f26',
      lineColor: '#5b6270',
      secondaryColor: '#f4f5f7',
      tertiaryColor: '#ffffff',
      clusterBkg: '#f4f5f7',
      clusterBorder: '#d5d9e0',
      fontSize: '15px',
    },
    flowchart: { htmlLabels: false, curve: 'basis' },
  }),
);

for (const file of readdirSync(src).filter((f) => f.endsWith('.mmd'))) {
  const text = readFileSync(new URL(file, src), 'utf8');
  const id = file.replace('.mmd', '');
  const svg = await page.evaluate(async ([id, text]) => (await window.mermaid.render(`d-${id}`, text)).svg, [id, text]);
  // White background so the diagram stays readable in dark mode and on GitHub.
  writeFileSync(new URL(`${id}.svg`, out), svg.replace('<svg ', '<svg style="background:#ffffff" '));
  console.log(`rendered ${id}.svg`);
}
await browser.close();
