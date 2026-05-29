import { useState } from 'react';
import { ChatMessage, Pin } from '../types';
import { sendChatMessage } from '../services/chatApi';

export function useChat(pins: Pin[]) {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => setChatOpen(!chatOpen);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Build pin context for database
      const db = pins.map((p) => `${p.name} (${p.cat}, ${p.area}, ★${p.rating}, score ${p.score})`).join('\n');
      const systemPrompt = `You are EatMap AI — Hyderabad's expert food discovery assistant. Witty, opinionated, knowledgeable about irani chai, dum biryani, haleem, tiffin, street food, rooftop bars. Speak like a knowledgeable local friend.\n\nDatabase:\n${db}\n\nRules: Recommend specific places with ratings. Keep answers 2-4 sentences. Use food emoji. Never say "As an AI".`;

      // Call API (taking only last 8 messages)
      const recentMessages = updatedMessages.slice(-8);
      const data = await sendChatMessage(systemPrompt, recentMessages);
      
      const botText = data.content?.find((b: any) => b.type === 'text')?.text || "Try asking differently!";
      setMessages((prev) => [...prev, { role: 'assistant', content: botText }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err.message || "Trouble connecting — try again in a sec!" }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    chatOpen,
    messages,
    isTyping,
    setChatOpen,
    toggleChat,
    sendMessage
  };
}
