/**
 * @file Splits a headline into plain and highlighted parts (CR-43). Text between *stars* is highlighted,
 * so content files can mark emphasis without HTML.
 */
export interface Part {
  text: string;
  em: boolean;
}

export function highlight(text: string): Part[] {
  return text
    .split('*')
    .map((part, i) => ({ text: part, em: i % 2 === 1 }))
    .filter((p) => p.text.length > 0);
}
