import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useStoredState } from '../hooks/useStoredState';

type Room = 'assistant' | 'lounge';
interface Message {
  id: string;
  from: string;
  text: string;
  t: number;
}

const rooms: Record<Room, { name: string; status: string }> = {
  assistant: { name: 'Ask Jagruti', status: 'answers straight away' },
  lounge: { name: 'Visitor lounge', status: 'live between open tabs' },
};

/** Keyword answers for the assistant. The first matching rule wins. */
const answers: [RegExp, string][] = [
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
    'Day to day: C#, .NET Core, Angular, SQL Server, Azure and microservices. This site is React and TypeScript. I also use Copilot, Gemini and Claude to speed up routine work.',
  ],
  [
    /experience|winjit|job|role|lead/i,
    'Six years at Winjit Technologies (RIB Group): intern in 2020, then Software Engineer, Senior Software Engineer, and Project Engineer & Team Lead from 2026.',
  ],
  [
    /evolution|lehman|module|assignment|readme/i,
    "This site is Phase 1 of my CS5709 project. It evolves the lecturer's starter portfolio; the Readme page explains every change.",
  ],
  [/contact|email|linkedin|reach|hire/i, 'LinkedIn is the best way to reach me: in.linkedin.com/in/jagrutibadgujar'],
  [/^(hi|hello|hey|hiya)\b/i, 'Hello! What would you like to know?'],
  [/thank/i, "You're welcome. Enjoy the rest of the portfolio."],
];
export const answerFor = (question: string) =>
  answers.find(([pattern]) => pattern.test(question))?.[1] ??
  "I don't have an automatic answer for that yet. Try projects, education, skills or experience, or message me on LinkedIn.";

const suggestions = [
  'What projects have you worked on?',
  'Tell me about your education',
  'What is your tech stack?',
  'How can I contact you?',
];
const newId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const clock = (t: number) => new Date(t).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });

/**
 * Instant messaging (new in version 1.0; the starter's contact form only logged to the console, TD-03).
 * Two conversations: an assistant that answers at once, and a lounge that
 * delivers messages live to every open tab through BroadcastChannel.
 */
export function Chat() {
  const [me] = useStoredState('jb.chat.me', `Visitor-${Math.floor(1000 + Math.random() * 9000)}`);
  const [log, setLog] = useStoredState<Record<Room, Message[]>>('jb.chat.v2', {
    assistant: [
      {
        id: 'hello',
        from: 'Jagruti',
        text: 'Hi, thanks for visiting. Ask me about my projects, education or skills, or tap a suggestion.',
        t: Date.now(),
      },
    ],
    lounge: [],
  });
  const [room, setRoom] = useState<Room>('assistant');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState('');
  const channel = useRef<BroadcastChannel | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const lastTypingPing = useRef(0);

  const append = (r: Room, m: Message) =>
    setLog((prev) => (prev[r].some((x) => x.id === m.id) ? prev : { ...prev, [r]: [...prev[r], m].slice(-200) }));

  useEffect(() => {
    if (!('BroadcastChannel' in window)) return;
    const ch = new BroadcastChannel('jb-portfolio-chat');
    channel.current = ch;
    let timer: number | undefined;
    ch.onmessage = (event: MessageEvent) => {
      const data = event.data;
      // Treat everything from the channel as untrusted input.
      if (data?.type === 'msg' && data.msg && typeof data.msg.text === 'string') {
        append('lounge', {
          id: String(data.msg.id),
          from: String(data.msg.from).slice(0, 30),
          text: data.msg.text.slice(0, 1000),
          t: Number(data.msg.t),
        });
        setTyping('');
      }
      if (data?.type === 'typing') {
        setTyping(`${String(data.from).slice(0, 30)} is typing…`);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setTyping(''), 1500);
      }
    };
    return () => {
      ch.close();
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log, room, typing]);

  const send = (text: string, e?: FormEvent) => {
    e?.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    const msg: Message = { id: newId(), from: me, text: clean, t: Date.now() };
    append(room, msg);
    setDraft('');
    if (room === 'assistant') {
      setTyping('Jagruti is typing…');
      window.setTimeout(
        () => {
          setTyping('');
          append('assistant', { id: newId(), from: 'Jagruti', text: answerFor(clean), t: Date.now() });
        },
        700 + Math.min(1300, clean.length * 20),
      );
    } else {
      channel.current?.postMessage({ type: 'msg', msg });
    }
  };

  const onDraft = (value: string) => {
    setDraft(value);
    if (room === 'lounge' && Date.now() - lastTypingPing.current > 800) {
      channel.current?.postMessage({ type: 'typing', from: me });
      lastTypingPing.current = Date.now();
    }
  };

  const messages = log[room];
  return (
    <div className="chat">
      <div className="chat-tabs" role="tablist" aria-label="Conversations">
        {(Object.keys(rooms) as Room[]).map((r) => (
          <button
            key={r}
            role="tab"
            type="button"
            aria-selected={room === r}
            onClick={() => {
              setRoom(r);
              setTyping('');
            }}
          >
            <b>{rooms[r].name}</b>
            <small>{rooms[r].status}</small>
          </button>
        ))}
      </div>
      <div className="chat-log" ref={logRef} aria-live="polite">
        {room === 'lounge' && messages.length === 0 && (
          <p className="note">Open this page in a second tab or window and send a message. It appears in the other tab straight away.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`bubble${m.from === me ? ' me' : ''}`}>
            {room === 'lounge' && m.from !== me && <b>{m.from}: </b>}
            {m.text}
            <time>{clock(m.t)}</time>
          </div>
        ))}
        <p className="typing">{typing}</p>
      </div>
      {room === 'assistant' && (
        <div className="quick">
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      <form className="chat-compose" onSubmit={(e) => send(draft, e)}>
        <input
          aria-label="Message"
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          placeholder="Type a message"
          maxLength={1000}
          autoComplete="off"
        />
        <button className="btn" type="submit">
          Send
        </button>
      </form>
      <p className="note">You are chatting as {me}. Messages are kept in this browser.</p>
    </div>
  );
}
