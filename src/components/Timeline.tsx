export interface TimelineItem {
  when: string;
  title: string;
  text: string;
  badge?: string;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="timeline">
      {items.map((item) => (
        <li key={item.when + item.title}>
          <time>{item.when}</time>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
          {item.badge && <span className="grade">{item.badge}</span>}
        </li>
      ))}
    </ol>
  );
}
