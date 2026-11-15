/**
 * @file The chat assistant's answers (CR-13).
 *
 * A keyword rule table: the first rule whose pattern matches the question
 * wins. Kept apart from the chat UI so it can be unit-tested and edited
 * without touching any React code.
 */

/** [pattern, answer] pairs, checked in order. */
export const ANSWER_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [
    /project|work|built|loan|ocr/i,
    'My main projects: a consumer vehicle loan origination platform (.NET microservices), a bank statement OCR pipeline, a Sage–Maximo integration, TreadTrac, a ledger accounting solution and a people management system. The Professional Knowledge page has the case studies.',
  ],
  [
    /educat|degree|study|msc|limerick|university/i,
    "I'm doing an MSc in Software Engineering at the University of Limerick (2026–27). Before that: BE Computer Engineering (2020), Diploma in Computer Engineering (2016) and SSC (2013).",
  ],
  [
    /skill|stack|tech|\.net|angular|azure|react|c#/i,
    'Day to day: C#, .NET Core, Angular, SQL Server, Azure and microservices. This site is React and TypeScript.',
  ],
  [
    /experience|winjit|job|role|lead/i,
    'Six years at Winjit Technologies (RIB Group): intern in 2020, then developer, engineer, senior engineer, project engineer and team lead, and now Consultant.',
  ],
  [
    /site|portfolio|built|how.*made/i,
    'I designed and built this site myself in React and TypeScript, with a CI/CD pipeline, automated tests and a live quality report on the Dashboard.',
  ],
  [/contact|email|linkedin|reach|hire/i, 'LinkedIn is the best way to reach me: in.linkedin.com/in/jagrutibadgujar'],
  [/^(hi|hello|hey|hiya)\b/i, 'Hello! What would you like to know?'],
  [/thank/i, "You're welcome. Enjoy the rest of the portfolio."],
];

export const FALLBACK_ANSWER =
  "I don't have an automatic answer for that yet. Try projects, education, skills or experience, or message me on LinkedIn.";

/** Questions offered as one-tap buttons under the assistant conversation. */
export const SUGGESTIONS = [
  'What projects have you worked on?',
  'Tell me about your education',
  'What is your tech stack?',
  'How can I contact you?',
];

/** Returns the assistant's answer to a question. */
export const answerFor = (question: string): string => ANSWER_RULES.find(([pattern]) => pattern.test(question))?.[1] ?? FALLBACK_ANSWER;
