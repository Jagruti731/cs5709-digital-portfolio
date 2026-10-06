import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  children?: ReactNode;
  tags?: string[];
}

export function Card({ title, children, tags }: CardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
      {tags && (
        <ul className="tags">
          {tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
