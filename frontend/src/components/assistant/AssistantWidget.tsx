'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function MarkdownText({ text }: { text: string }) {
  // Minimal inline rendering: bold, line breaks
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.trim() === '') return <div key={i} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i} className="leading-relaxed">
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function AssistantWidget() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, open]);

  if (!mounted) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const updated: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant', { messages: updated });
      const reply: string = res.data.data.reply;
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...updated, {
        role: 'assistant',
        content: 'Παρουσιάστηκε σφάλμα. Προσπαθήστε ξανά.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center"
        title="AI Assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] flex flex-col rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-black overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-indigo-600 text-white">
            <Bot size={20} />
            <div>
              <p className="font-semibold text-sm">AI Assistant</p>
              <p className="text-xs text-indigo-200">Ρωτήστε οτιδήποτε για την βάση δεδομένων</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0" style={{ maxHeight: 420 }}>
            {messages.length === 0 && (
              <div className="text-center text-slate-400 dark:text-white text-sm mt-8 space-y-2">
                <Bot size={32} className="mx-auto text-slate-300 dark:text-white" />
                <p>Καλώς ήρθατε!</p>
                <p className="text-xs">Μπορείτε να ρωτήσετε για υπαλλήλους, έργα, συμμετοχές, διαθεσιμότητα και πολλά άλλα.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex-none w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center mt-0.5">
                    <Bot size={14} className="text-indigo-600" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-100 dark:bg-black text-slate-800 dark:text-white rounded-bl-sm'
                }`}>
                  {msg.role === 'assistant'
                    ? <MarkdownText text={msg.content} />
                    : msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="flex-none w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center mt-0.5">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="flex-none w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Bot size={14} className="text-indigo-600" />
                </div>
                <div className="bg-slate-100 dark:bg-black rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-indigo-600" />
                  <span className="text-sm text-slate-500 dark:text-white">Αναζήτηση...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 dark:border-slate-800 p-3 flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Γράψτε την ερώτησή σας…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-black dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 max-h-28 overflow-y-auto"
              style={{ lineHeight: '1.5' }}
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="flex-none w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
