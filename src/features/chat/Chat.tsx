/**
 * @file Chat: the instant messaging window (CR-13).
 * Display only. Conversation state lives in useChat; assistant answers in answers.ts.
 */
import { useEffect, useRef, useState } from 'react';
import { LIMITS } from '../../config/site';
import { clockTime } from '../../lib/ids';
import { SUGGESTIONS } from './answers';
import { ROOMS, useChat, type Room } from './useChat';

export function Chat() {
  const chat = useChat();
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [chat.messages, chat.room, chat.typing]);

  const send = (text: string) => {
    chat.send(text);
    setDraft('');
  };

  return (
    <div className="chat">
      <div className="chat-tabs" role="tablist" aria-label="Conversations">
        {(Object.keys(ROOMS) as Room[]).map((r) => (
          <button key={r} role="tab" type="button" aria-selected={chat.room === r} onClick={() => chat.switchRoom(r)}>
            <b>{ROOMS[r].name}</b>
            <small>{ROOMS[r].status}</small>
          </button>
        ))}
      </div>
      <div className="chat-log" ref={logRef} aria-live="polite">
        {chat.room === 'lounge' && chat.messages.length === 0 && (
          <p className="note">Open this page in a second tab or window and send a message. It appears in the other tab straight away.</p>
        )}
        {chat.messages.map((m) => (
          <div key={m.id} className={`bubble${m.from === chat.me ? ' me' : ''}`}>
            {chat.room === 'lounge' && m.from !== chat.me && <b>{m.from}: </b>}
            {m.text}
            {m.t > 0 && <time>{clockTime(m.t)}</time>}
          </div>
        ))}
        <p className="typing">{chat.typing}</p>
      </div>
      {chat.room === 'assistant' && (
        <div className="quick">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        className="chat-compose"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <input
          aria-label="Message"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            chat.notifyTyping();
          }}
          placeholder="Type a message"
          maxLength={LIMITS.chatChars}
          autoComplete="off"
        />
        <button className="btn" type="submit">
          Send
        </button>
      </form>
      <p className="note">You are chatting as {chat.me}. Messages are kept in this browser.</p>
    </div>
  );
}
