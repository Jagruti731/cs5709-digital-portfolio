/**
 * @file Not found page: shown for any address that matches no route, with links back into the site.
 */
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';

export default function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" crumb="Not found" intro="This page doesn't exist. The link might be old or mistyped." />
      <Section>
        <div className="btn-row" style={{ margin: 0 }}>
          <Link className="btn" to="/">
            Go to the home page
          </Link>
          <Link className="btn outline" to="/readme">
            Read the Readme
          </Link>
        </div>
      </Section>
    </>
  );
}
