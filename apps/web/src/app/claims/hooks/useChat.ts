'use client';

import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '@claims-assistant/shared';
import { API_URL } from '../../../lib/api';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  const postChat = useCallback(async (msgs: ChatMessage[]): Promise<ChatMessage | null> => {
    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs }),
      });
      if (!res.ok) throw new Error('Chat unavailable');
      const data = await res.json();
      return data.message;
    } catch {
      return null;
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: ChatMessage = { role: 'user', content };
    const updatedMessages = [...messagesRef.current, userMessage];
    messagesRef.current = updatedMessages;
    setMessages(updatedMessages);
    setIsLoading(true);
    setError(null);

    const reply = await postChat(updatedMessages);
    if (reply) {
      const withReply = [...updatedMessages, reply];
      messagesRef.current = withReply;
      setMessages(withReply);
    } else {
      setError('AI chat is currently unavailable. Please try again.');
    }
    setIsLoading(false);
  }, [postChat]);

  const clearChat = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
    setError(null);
  }, []);

  const retryLast = useCallback(async () => {
    const current = messagesRef.current;
    if (current.length === 0) return;

    const withoutLast = current.slice(0, -1);
    messagesRef.current = withoutLast;
    setMessages(withoutLast);
    setIsLoading(true);
    setError(null);

    const reply = await postChat(withoutLast);
    if (reply) {
      const withReply = [...withoutLast, reply];
      messagesRef.current = withReply;
      setMessages(withReply);
    } else {
      setError('AI chat is currently unavailable. Please try again.');
    }
    setIsLoading(false);
  }, [postChat]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    retryLast,
  };
}
