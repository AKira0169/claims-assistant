'use client';

import { ChatMessage as ChatMessageType } from '@claims-assistant/shared';

const CLAIM_NUMBER_SPLIT = /(CLM-\d{4}-\d{3,5})/g;
const CLAIM_NUMBER_TEST = /^CLM-\d{4}-\d{3,5}$/;

interface ChatMessageProps {
  message: ChatMessageType;
  onClaimClick?: (claimNumber: string) => void;
}

export function ChatMessage({ message, onClaimClick }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const renderContent = () => {
    if (isUser) return message.content;

    const parts = message.content.split(CLAIM_NUMBER_SPLIT);
    return parts.map((part, i) => {
      if (CLAIM_NUMBER_TEST.test(part)) {
        return (
          <button
            key={i}
            onClick={() => onClaimClick?.(part)}
            className="font-bold text-brutal-blue underline underline-offset-2 hover:text-brutal-pink transition-colors"
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-3 font-mono text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-brutal-blue text-white border-[3px] border-brutal-black'
            : 'bg-white border-[3px] border-brutal-black shadow-brutal-sm'
        }`}
      >
        {!isUser && (
          <div className="text-[10px] font-bold uppercase tracking-wider text-brutal-black/40 mb-1">
            AI Assistant
          </div>
        )}
        <div>{renderContent()}</div>
      </div>
    </div>
  );
}
