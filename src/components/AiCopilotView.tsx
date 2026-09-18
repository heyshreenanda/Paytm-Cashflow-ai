import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Clock,
  RotateCw,
} from 'lucide-react';
import { CopilotMessage } from '../types';

interface AiCopilotViewProps {
  onSendQuery: (query: string) => Promise<{
    answer: string;
    actionSuggestion?: {
      type: 'simulate_tx' | 'simulate_loan' | 'view_commitments' | 'view_forecast';
      payload?: any;
      label: string;
    };
    groundedFacts: string[];
  }>;
  onOpenSimulator: () => void;
  onNavigateTab: (tab: any) => void;
  initialQuery?: string;
}

export const AiCopilotView: React.FC<AiCopilotViewProps> = ({
  onSendQuery,
  onOpenSimulator,
  onNavigateTab,
  initialQuery,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: 'Hello Rahul! I am your CashFlow AI Copilot. I analyze your commitments, spending velocity, and forecast timeline to explain what financial decisions mean for your future liquidity.',
      timestamp: 'Just now',
      groundedFacts: [
        'Liquid Balance: ₹28,000',
        'Projected Buffer: ₹9,500',
        'Week 3 is the primary pressure period',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>(initialQuery || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const samplePrompts = [
    'Why is Week 3 under pressure?',
    'What happens if I spend ₹3,000 today?',
    'What happens if I take a ₹2 lakh loan?',
    'What commitments are coming up?',
    'What did I spend most on?',
    'What happens if my insurance premium is due this week?',
  ];

  const handleSend = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await onSendQuery(text);
      const assistantMsg: CopilotMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        actionSuggestion: response.actionSuggestion,
        groundedFacts: response.groundedFacts,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: CopilotMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'I was unable to consult the AI layer at this moment. You can inspect your forecast timeline or run a manual What-If scenario.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action: { type: string; payload?: any }) => {
    if (action.type === 'simulate_tx') {
      onOpenSimulator();
    } else if (action.type === 'simulate_loan') {
      onNavigateTab('whatif');
    } else if (action.type === 'view_commitments') {
      onNavigateTab('commitments');
    } else if (action.type === 'view_forecast') {
      onNavigateTab('cashflow');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight sm:text-2xl flex items-center gap-2">
            <span>AI Cash-Flow Copilot</span>
            <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold text-cyan-400">
              Grounded AI
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Ask natural questions grounded strictly in your synthetic financial timeline. Zero hallucinated balances.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
          <span>The AI informs you; it does not make financial decisions.</span>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Recommended Financial Questions
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500/50 hover:text-cyan-400 transition cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 min-h-[380px] max-h-[550px] overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                  isUser
                    ? 'bg-cyan-600 text-white font-medium rounded-tr-none'
                    : 'border border-slate-800 bg-slate-950/80 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {/* Grounded facts badge if provided */}
                {!isUser && m.groundedFacts && m.groundedFacts.length > 0 && (
                  <div className="rounded-xl border border-slate-800/80 bg-slate-900/90 p-2.5 space-y-1 mt-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-cyan-400" />
                      Grounded Financial Facts
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.groundedFacts.map((fact, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
                        >
                          {fact}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actionable Suggestion */}
                {!isUser && m.actionSuggestion && (
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleActionClick(m.actionSuggestion!)}
                      className="flex items-center gap-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 text-xs font-bold text-slate-950 transition cursor-pointer"
                    >
                      <span>{m.actionSuggestion.label}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className={`text-[10px] ${isUser ? 'text-cyan-200' : 'text-slate-500'} text-right`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <RotateCw className="h-4 w-4 animate-spin" />
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Reasoning across financial timeline and commitments...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputQuery);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask e.g. 'What happens if I spend ₹2,000 today?' or 'Why is Week 3 tight?'"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900/90 py-3 px-4 text-xs text-white focus:border-cyan-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="flex items-center justify-center h-11 w-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition disabled:opacity-50 cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
