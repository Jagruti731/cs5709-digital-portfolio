/**
 * @file CaseCover: the typographic cover of a case study (CR-42). It replaced the diagram pictures:
 * a large serif number, the kind of work and the main tools, drawn with CSS so it suits light and dark themes.
 */
interface CaseCoverProps {
  index: number;
  kind: string;
  tools: string[];
}

export function CaseCover({ index, kind, tools }: CaseCoverProps) {
  return (
    <div className="case-cover" aria-hidden="true">
      <span className="case-cover-no">{String(index).padStart(2, '0')}</span>
      <span className="case-cover-kind">{kind}</span>
      <span className="case-cover-tools">{tools.slice(0, 3).join(' · ')}</span>
    </div>
  );
}
