export type ChangeType = 'corrective' | 'adaptive' | 'perfective' | 'preventive';

export interface Change {
  id: string;
  change: string;
  type: ChangeType;
  closes: string;
  commit: string;
}

/** Version 0 → 1.0, one commit per change (git log v0-starter..v1.0). */
export const changes: Change[] = [
  { id: 'CR-01', change: 'Removed the 43 MB saved web page, the committed .git backup, 40 unused UI primitives and 3 unrendered components', type: 'preventive', closes: 'TD-05, TD-08', commit: '6cbc945' },
  { id: 'CR-02', change: 'URL routing with React Router: one route per page, NotFound, menu generated from the page list', type: 'perfective', closes: 'TD-01, TD-02', commit: '6781388' },
  { id: 'CR-03', change: 'Home page; About, Education, Professional Knowledge and Pictures rebuilt from typed data and shared components', type: 'perfective', closes: '—', commit: '882bd6a' },
  { id: 'CR-04', change: 'One hand-written stylesheet with dark mode replaces 58 KB of pre-compiled utilities', type: 'perfective', closes: 'TD-10', commit: 'c4c1b98' },
  { id: 'CR-05', change: 'Video gallery, blog and feed evolved; instant messaging and search added; one storage path; API address setting', type: 'perfective', closes: 'TD-03, TD-04, TD-11', commit: 'efb6850' },
  { id: 'CR-06', change: 'Strict TypeScript in every build; matching type packages; 43 unused packages and 40 import aliases removed', type: 'preventive', closes: 'TD-05, TD-07', commit: '2ddacae' },
  { id: 'CR-07', change: 'API server: salted password hashes; only the signed-in author can delete a post', type: 'corrective', closes: 'TD-06', commit: '4053e97' },
  { id: 'CR-08', change: 'Relative asset paths, page metadata, cross-platform deploy script', type: 'adaptive', closes: 'TD-09', commit: '3335364' },
  { id: 'CR-09', change: 'README and ARCHITECTURE rewritten; this Readme page, diagrams, metrics and tests', type: 'preventive', closes: 'TD-12', commit: 'tag v1.0' },
];
