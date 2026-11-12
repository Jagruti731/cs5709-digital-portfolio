/**
 * @file Unit tests for the chat assistant and message handling (CR-13/CR-15).
 */
import { describe, expect, it } from 'vitest';
import { CHAT_TIMING, LIMITS } from '../../config/site';
import { FALLBACK_ANSWER, answerFor } from './answers';
import { appendMessage, parseIncoming, replyDelay, type ChatMessage } from './useChat';

describe('answerFor', () => {
  it.each([
    ['What projects have you worked on?', 'loan origination'],
    ['Where did you study?', 'University of Limerick'],
    ['what is your tech stack', '.NET'],
    ['How can I contact you?', 'LinkedIn'],
    ['hello', 'Hello!'],
  ])('answers "%s"', (question, expected) => {
    expect(answerFor(question)).toContain(expected);
  });

  it('falls back politely for unknown questions', () => {
    expect(answerFor('What is the weather like?')).toBe(FALLBACK_ANSWER);
  });
});

describe('message handling', () => {
  const msg = (id: string): ChatMessage => ({ id, from: 'a', text: id, t: 1 });

  it('ignores duplicates and caps the history', () => {
    let log = { assistant: [] as ChatMessage[], lounge: [] as ChatMessage[] };
    log = appendMessage(log, 'lounge', msg('x'));
    expect(appendMessage(log, 'lounge', msg('x'))).toBe(log);
    for (let i = 0; i < LIMITS.chatHistory + 5; i++) log = appendMessage(log, 'lounge', msg(`m${i}`));
    expect(log.lounge).toHaveLength(LIMITS.chatHistory);
  });

  it('treats messages from other tabs as untrusted', () => {
    expect(parseIncoming({ type: 'typing' })).toBeNull();
    expect(parseIncoming({ type: 'msg', msg: { text: 42 } })).toBeNull();
    const long = parseIncoming({ type: 'msg', msg: { id: 1, from: 'x'.repeat(99), text: 'y'.repeat(5000), t: '5' } });
    expect(long?.from).toHaveLength(30);
    expect(long?.text).toHaveLength(LIMITS.chatChars);
    expect(long?.t).toBe(5);
  });

  it('waits longer for longer questions, up to a limit', () => {
    expect(replyDelay('hi')).toBe(CHAT_TIMING.replyBaseMs + 2 * CHAT_TIMING.replyPerCharMs);
    expect(replyDelay('x'.repeat(10_000))).toBe(CHAT_TIMING.replyBaseMs + CHAT_TIMING.replyMaxExtraMs);
  });
});
