// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { Showcase } from '../../types/content';
import { CareerPath } from './CareerPath';
import { Numbers } from './Numbers';
import { Pillars } from './Pillars';
import { ScanHero } from './ScanHero';
import { SkillTicker } from './SkillTicker';
import { SystemsPlayer } from './SystemsPlayer';
import { TechRadar } from './TechRadar';

afterEach(cleanup);

const data: Showcase = JSON.parse(readFileSync(`${process.cwd()}/public/data/showcase.json`, 'utf8'));

describe('showcase components (at rest, as with reduced motion)', () => {
  it('ScanHero shows the headline, every extracted field and the JSON', () => {
    render(
      <MemoryRouter>
        <ScanHero hero={data.hero} name="Jagruti Badgujar" photo="profile.jpg" />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1 }).getAttribute('aria-label')).toBe('I build systems that read, reason and deliver.');
    data.hero.fields.forEach(([, v]) => expect(screen.getAllByText(v, { exact: false }).length).toBeGreaterThan(0));
    expect(screen.getByText(/"based_in": "Limerick, Ireland"/)).toBeTruthy();
    expect(screen.getByRole('link', { name: /See the work/ }).getAttribute('href')).toBe('/knowledge');
  });

  it('Numbers shows the final values from the start', () => {
    render(<Numbers numbers={data.numbers} />);
    expect(screen.getByText('6+')).toBeTruthy();
    expect(screen.getByText('~1,000')).toBeTruthy();
  });

  it('Pillars shows three pillars with their proof', () => {
    render(<Pillars pillars={data.pillars} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(screen.getByText(/A person checks every AI decision/)).toBeTruthy();
  });

  it('SystemsPlayer lists every system and switches when one is picked', () => {
    render(<SystemsPlayer systems={data.systems} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(data.systems.length);
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    fireEvent.click(tabs[1]);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tabpanel').textContent).toContain('Statements in');
    expect(screen.getByText('statement.pdf received')).toBeTruthy();
  });

  it('TechRadar draws a dot per item and links dots and names on hover', () => {
    const { container } = render(<TechRadar radar={data.radar} />);
    const blips = container.querySelectorAll('.blip');
    expect(blips).toHaveLength(data.radar.items.length);
    fireEvent.mouseEnter(blips[0]);
    const name = data.radar.items.find((i) => blips[0].getAttribute('aria-label')?.startsWith(i[0]))?.[0];
    expect(screen.getByText(name as string, { selector: 'li' }).className).toBe('hi');
    fireEvent.mouseLeave(blips[0]);
    const chip = screen.getByText('Claude', { selector: 'li' });
    fireEvent.mouseEnter(chip);
    expect(container.querySelector('.blip.hi')?.getAttribute('aria-label')).toBe('Claude: Growing');
    fireEvent.mouseLeave(chip);
    fireEvent.focus(blips[1]);
    expect(blips[1].getAttribute('class')).toContain('hi');
    fireEvent.blur(blips[1]);
  });

  it('SkillTicker and CareerPath render their items', () => {
    render(<SkillTicker skills={data.skills} />);
    expect(screen.getAllByText('Document AI')).toHaveLength(2);
    render(<CareerPath path={data.path} />);
    expect(screen.getByText('Consultant')).toBeTruthy();
  });
});
