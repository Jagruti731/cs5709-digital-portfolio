import type { TitledText } from './profile';

export interface CaseStudy {
  id: string;
  image: string;
  title: string;
  kind: string;
  meta: string;
  summary: string;
  problem: string;
  did: string[];
  tools: string[];
}

/** Case studies, in order of importance. The first three are featured on Home. */
export const caseStudies: CaseStudy[] = [
  {
    id: 'loan',
    image: 'loan-origination.jpg',
    title: 'Consumer vehicle loan origination',
    kind: 'Fintech · current project',
    meta: 'Winjit Technologies · current flagship project · Team Lead',
    summary: 'A platform that handles consumer vehicle loans from application to payout. I lead the team building it as .NET microservices.',
    problem: 'The client needed one system to handle vehicle loan applications from start to finish: applicant details, document checks, credit rules, decision and payout.',
    did: [
      'Led the development team and planned the sprints',
      'Split the system into .NET microservices so each step can change on its own',
      'Built document checks with OCR and Gemini',
    ],
    tools: ['.NET', 'Microservices', 'SQL Server', 'OCR', 'Gemini'],
  },
  {
    id: 'ocr',
    image: 'ocr-pipeline.jpg',
    title: 'Bank statement extraction pipeline',
    kind: 'Document AI',
    meta: 'Winjit Technologies · fintech',
    summary: 'Reads PDF statements from four South African banks and turns them into clean transactions. I built the extractors and fixed the Gemini accuracy issues.',
    problem: "Credit teams were typing transactions from customers' bank statements by hand. Every bank's PDF looks different, so one generic parser was not good enough.",
    did: [
      'Built positional extractors with PdfPig for FNB, ABSA, Capitec and Nedbank',
      'Used Google Gemini as a fallback, first on the whole PDF, then in batches',
      'Found and fixed sign errors, misread digits, cut-off batches and a race condition in parallel processing',
      'Added validation and de-duplication, and made the Excel export stable',
    ],
    tools: ['ASP.NET Core', 'C#', 'PdfPig', 'Gemini', 'EPPlus', 'SemaphoreSlim'],
  },
  {
    id: 'legacy',
    image: 'modernisation.jpg',
    title: 'Legacy .NET MVC modernisation',
    kind: 'Legacy modernisation',
    meta: 'Winjit Technologies',
    summary: 'Working out how to move an older app off paid DevExpress controls to open-source AG Grid, ApexCharts and Bootstrap 5.',
    problem: 'An older ASP.NET MVC app depended on paid DevExpress controls that were hard to update.',
    did: [
      'Explored removing DevExpress in favour of open-source controls',
      'Compared AG Grid (grids), ApexCharts (charts) and Bootstrap 5 (layout) as replacements',
    ],
    tools: ['ASP.NET MVC', 'AG Grid', 'ApexCharts', 'Bootstrap 5'],
  },
  {
    id: 'lexaura',
    image: 'lexaura.jpg',
    title: 'LexAura: AI legal operations portal',
    kind: 'Innovation competition',
    meta: 'Winjit WinTank 2026 innovation competition',
    summary: 'An AI portal for contracts, compliance and legal workflows, designed and pitched for an internal competition.',
    problem: 'Legal teams manage contracts, compliance dates and approvals across email and spreadsheets.',
    did: [
      'Designed a portal for document management, AI contract analysis, compliance tracking and workflows',
      'Built the prototype screens, the pitch deck and the implementation report for the competition',
    ],
    tools: ['React', 'AI contract analysis', 'Product design'],
  },
];

export const otherProjects: TitledText[] = [
  { title: 'Payslip OCR', text: 'Extracted payslip data with Gemini into SQL Server, the first version of our document AI work.' },
  { title: 'Sage–Maximo integration', text: 'Kept finance data in Sage and asset data in IBM Maximo in sync.' },
  { title: 'LeaderRubber TreadTrac', text: 'Tracking system for a tyre retreading business.' },
  { title: 'Ledger Accounting Solution', text: 'Ledger and accounting workflows for business users.' },
  { title: 'People Management System', text: 'Employee records and HR workflows.' },
  { title: 'AI adoption tracker', text: 'Excel tracker for our PMO to measure GitHub Copilot use per sprint task.' },
];

export const skillGroups = [
  { title: 'Back end', items: ['C#', '.NET Core', 'ASP.NET Core Web API', 'ASP.NET MVC', 'Microservices'] },
  { title: 'Front end', items: ['Angular', 'React', 'TypeScript', 'Bootstrap 5', 'AG Grid'] },
  { title: 'Data & cloud', items: ['SQL Server', 'Azure', 'Blob Storage', 'Azure DevOps'] },
  { title: 'AI & documents', items: ['Google Gemini', 'OpenAI API', 'GitHub Copilot', 'PdfPig', 'EPPlus'] },
  { title: 'Delivery', items: ['Team leadership', 'Sprint planning', 'Code review', 'Presales'] },
];

/** CS5709 maintenance categories, each with an example from my own projects. */
export const evolutionConcepts: TitledText[] = [
  { title: 'Corrective', text: 'Fixing faults. Example: sign errors and misread digits in the OCR output.' },
  { title: 'Adaptive', text: 'Adapting to a new environment. Example: adding extractors for new bank layouts.' },
  { title: 'Perfective', text: 'Making it better. Example: a whole-PDF Gemini call with batch fallback.' },
  { title: 'Preventive', text: 'Stopping future problems. Example: validation, de-duplication and concurrency limits.' },
];

export const imagePath = (file: string) => `./images/${file}`;
