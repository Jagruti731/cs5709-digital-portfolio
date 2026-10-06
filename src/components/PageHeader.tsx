import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  crumb: string;
  intro?: string;
}

/** The banner at the top of every page except Home: breadcrumb, title and a one-line summary. */
export function PageHeader({ title, crumb, intro }: PageHeaderProps) {
  return (
    <section className="page-banner">
      <div className="container">
        <p className="crumbs">
          <Link to="/">Home</Link> / {crumb}
        </p>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </div>
    </section>
  );
}
