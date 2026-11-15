/**
 * @file Headline: renders text where *starred* words are highlighted (CR-43).
 */
import { highlight } from './highlight';

export function Headline({ text }: { text: string }) {
  return <>{highlight(text).map((p, i) => (p.em ? <em key={i}>{p.text}</em> : <span key={i}>{p.text}</span>))}</>;
}
