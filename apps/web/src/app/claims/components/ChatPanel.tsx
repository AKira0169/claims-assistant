'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from './ChatMessage';

interface ChatPanelProps {
  onToggle: () => void;
  onClaimClick?: (claimNumber: string) => void;
}

export function ChatPanel({ onToggle, onClaimClick }: ChatPanelProps) {
  const { messages, isLoading, error, sendMessage, clearChat, retryLast } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput('');
    sendMessage(trimmed);
  };

  return (
    <div className="w-full h-[calc(100vh-220px)] flex flex-col border-[3px] border-brutal-black bg-white shadow-brutal brutal-animate-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-brutal-blue text-white border-b-[3px] border-brutal-black">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-brutal-lime animate-pulse" />
          <span className="font-mono text-sm font-bold uppercase tracking-wider">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="font-mono text-[10px] font-bold uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
          >
            Clear
          </button>
          <button
            onClick={onToggle}
            className="w-6 h-6 flex items-center justify-center font-bold hover:bg-white/20 transition-colors"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream/50">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 bg-brutal-yellow border-[3px] border-brutal-black mx-auto flex items-center justify-center">
              <span className="text-xl">?</span>
            </div>
            <p className="font-mono text-sm text-brutal-black/50 uppercase font-bold">
              Ask about claims
            </p>
            <div className="space-y-1">
              {[
                'How many claims are under review?',
                'Show me recent activity',
                'What is the status of CLM-2026-00001?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="block w-full text-left px-3 py-2 font-mono text-xs text-brutal-black/60 hover:bg-brutal-yellow/20 border border-brutal-black/10 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} onClaimClick={onClaimClick} />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border-[3px] border-brutal-black px-4 py-3 shadow-brutal-sm">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-brutal-black animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-brutal-black animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-brutal-black animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-brutal-pink text-white border-[3px] border-brutal-black font-mono text-xs">
            <span className="font-bold uppercase">Error:</span> {error}
            <button
              onClick={retryLast}
              className="block mt-2 font-bold uppercase underline underline-offset-2 hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t-[3px] border-brutal-black p-3 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about claims..."
          className="brutal-input text-sm flex-1"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="brutal-btn brutal-btn-primary text-sm px-4 py-2"
        >
          Send
        </button>
      </div>
    </div>
  );
}
