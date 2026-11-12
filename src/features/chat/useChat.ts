/**
 * @file useChat: all logic of instant messaging, with no markup (CR-13).
 *
 * Peer review: "do the same [split] for Chat.tsx", and "magic numbers (Chat:98)".
 * Two conversations:
 *   - assistant: answers at once from the rule table in answers.ts
 *   - lounge: delivers messages live to every open tab through BroadcastChannel
 * History is kept in localStorage and capped at LIMITS.chatHistory messages per room.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_TIMING, LIMITS } from '../../config/site';
import { useStoredState } from '../../hooks/useStoredState';
import { newId } from '../../lib/ids';
import { answerFor } from './answers';

export type Room = 'assistant' | 'lounge';

export interface ChatMessage {
  id: string;
  from: string;
  text: string;
  t: number;
}

export const ROOMS: Record<Room, { name: string; status: string }> = {
  assistant: { name: 'Ask Jagruti', status: 'answers straight away' },
  lounge: { name: 'Visitor lounge', status: 'live between open tabs' },
};

const CHANNEL_NAME = 'jb-portfolio-chat';
const ASSISTANT = 'Jagruti';
const MAX_NAME = 30;

/** How long the assistant "types" before answering a question of this length. */
export const replyDelay = (question: string): number =>
  CHAT_TIMING.replyBaseMs + Math.min(CHAT_TIMING.replyMaxExtraMs, question.length * CHAT_TIMING.replyPerCharMs);

/**
 * Turns anything received from another tab into a safe message, or null.
 * Messages from the channel are untrusted input: lengths are capped and types forced.
 */
export function parseIncoming(data: unknown): ChatMessage | null {
  const msg = (data as { type?: string; msg?: Partial<ChatMessage> })?.msg;
  if ((data as { type?: string })?.type !== 'msg' || !msg || typeof msg.text !== 'string') return null;
  return { id: String(msg.id), from: String(msg.from).slice(0, MAX_NAME), text: msg.text.slice(0, LIMITS.chatChars), t: Number(msg.t) };
}

/** Adds a message to one room, ignoring duplicates and keeping only the newest messages. */
export function appendMessage(log: Record<Room, ChatMessage[]>, room: Room, m: ChatMessage): Record<Room, ChatMessage[]> {
  if (log[room].some((x) => x.id === m.id)) return log;
  return { ...log, [room]: [...log[room], m].slice(-LIMITS.chatHistory) };
}

const greeting: ChatMessage = {
  id: 'hello',
  from: ASSISTANT,
  text: 'Hi, thanks for visiting. Ask me about my projects, education or skills, or tap a suggestion.',
  t: 0,
};

export function useChat() {
  const [me] = useStoredState('jb.chat.me', `Visitor-${Math.floor(1000 + Math.random() * 9000)}`);
  const [log, setLog] = useStoredState<Record<Room, ChatMessage[]>>('jb.chat.v2', { assistant: [greeting], lounge: [] });
  const [room, setRoom] = useState<Room>('assistant');
  const [typing, setTyping] = useState('');
  const channel = useRef<BroadcastChannel | null>(null);
  const lastTypingPing = useRef(0);
  const replyTimers = useRef<number[]>([]);

  // Cancel pending assistant replies when the chat closes (inspection D3: they used to fire after unmount).
  useEffect(() => () => replyTimers.current.forEach((t) => window.clearTimeout(t)), []);

  const append = useCallback((r: Room, m: ChatMessage) => setLog((prev) => appendMessage(prev, r, m)), [setLog]);

  // Listen to other tabs for the lounge.
  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channel.current = ch;
    let timer: number | undefined;
    ch.onmessage = (event: MessageEvent) => {
      const incoming = parseIncoming(event.data);
      if (incoming) {
        append('lounge', incoming);
        setTyping('');
      } else if (event.data?.type === 'typing') {
        setTyping(`${String(event.data.from).slice(0, MAX_NAME)} is typing…`);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setTyping(''), CHAT_TIMING.typingVisibleMs);
      }
    };
    return () => {
      ch.close();
      window.clearTimeout(timer);
    };
  }, [append]);

  /** Sends a message in the current room. */
  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    const msg: ChatMessage = { id: newId(), from: me, text: clean, t: Date.now() };
    append(room, msg);
    if (room === 'assistant') {
      setTyping(`${ASSISTANT} is typing…`);
      const timer = window.setTimeout(() => {
        replyTimers.current = replyTimers.current.filter((t) => t !== timer);
        setTyping('');
        append('assistant', { id: newId(), from: ASSISTANT, text: answerFor(clean), t: Date.now() });
      }, replyDelay(clean));
      replyTimers.current.push(timer);
    } else {
      channel.current?.postMessage({ type: 'msg', msg });
    }
  };

  /** Tells other tabs "X is typing", at most once per CHAT_TIMING.typingPingMs. */
  const notifyTyping = () => {
    if (room !== 'lounge' || Date.now() - lastTypingPing.current < CHAT_TIMING.typingPingMs) return;
    channel.current?.postMessage({ type: 'typing', from: me });
    lastTypingPing.current = Date.now();
  };

  const switchRoom = (r: Room) => {
    setRoom(r);
    setTyping('');
  };

  return { me, room, switchRoom, messages: log[room], typing, send, notifyTyping };
}
