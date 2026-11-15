/**
 * @file Parts of the Home page that tell the evolution story (CR-40): the version log and the three assignments.
 */
import { Link } from 'react-router-dom';
import { imagePath } from '../../lib/assets';

/** A git-log style list of the versions of this portfolio. */
export function GitLog({ name, photo }: { name: string; photo?: string }) {
  return (
    <aside className="gitlog" aria-label="Versions of this portfolio">
      <p className="gitlog-head">
        <span>git log --oneline --decorate</span>
      </p>
      <ol>
        <li>
          <code>v2.0</code>
          <span>Phase 2 · shared feed, quality report, new design</span>
        </li>
        <li>
          <code>v1.1</code>
          <span>Phase 2 · routing, data files, tests, search</span>
        </li>
        <li>
          <code>v1.0</code>
          <span>Phase 1 · the portfolio I was marked on</span>
        </li>
        <li>
          <code>v0</code>
          <span>the lecturer's starter</span>
        </li>
      </ol>
      {photo && (
        <figure className="gitlog-me">
          <img src={imagePath(photo)} alt={name} width={96} height={96} decoding="async" />
          <figcaption>{name}, MSc Software Engineering, University of Limerick</figcaption>
        </figure>
      )}
    </aside>
  );
}

/** The three assignments and how each one shaped this site. */
export function Assignments() {
  return (
    <div className="grid g3 assign">
      <article className="assign-card">
        <span className="assign-no">A1</span>
        <h3>Phase 1 portfolio</h3>
        <p className="score">12.5 / 15</p>
        <p>The lecturer asked for personas and scenarios, comments in the code and clearer sections.</p>
        <Link className="more" to="/readme">
          How I answered it →
        </Link>
      </article>
      <article className="assign-card">
        <span className="assign-no">A2</span>
        <h3>Peer review of my work</h3>
        <p className="score">Chirag Aggarwal</p>
        <p>A reviewer found technical debt and risks in my Phase 1 code. Each finding became a change request.</p>
        <Link className="more" to="/readme">
          See the debt I closed →
        </Link>
      </article>
      <article className="assign-card">
        <span className="assign-no">A3</span>
        <h3>Phase 2 portfolio</h3>
        <p className="score">this site, v2.0</p>
        <p>Iterations 3, 4 and 5, an innovation (a live shared feed), an evaluation and a reflection.</p>
        <Link className="more" to="/dashboard?tab=quality">
          Open the quality report →
        </Link>
      </article>
    </div>
  );
}
