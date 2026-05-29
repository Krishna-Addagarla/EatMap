import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { ChatMessage } from './ChatMessage';

interface ChatPanelProps {
  isOpen: boolean;
  messages: ChatMessageType[];
  isTyping: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  messages,
  isTyping,
  onClose,
  onSendMessage
}) => {
  const [inputText, setInputText] = useState('');
  const msgsContainerRef = useRef<HTMLDivElement>(null);

  // Automatically scroll down on new messages
  useEffect(() => {
    if (msgsContainerRef.current) {
      msgsContainerRef.current.scrollTop = msgsContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    onSendMessage(text);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickChips = [
    { label: '☕ Chai spots', query: 'Where can I get the best Irani Chai?' },
    { label: '🍛 Best biryani', query: 'List top biryani places in Hyderabad' },
    { label: '💑 Date night', query: 'List romantic date night restaurants' }
  ];

  return (
    <div className={`chat-panel ${isOpen ? 'vis' : 'hid'}`}>
      <div className="ch-head">
        <div className="ch-av">🤖</div>
        <div>
          <div className="ch-name">EatMap AI</div>
          <div className="ch-sub">
            <span className="pulse"></span>Claude Powered · Online
          </div>
        </div>
        <button className="ch-x" onClick={onClose}>✕</button>
      </div>

      <div className="ch-msgs" ref={msgsContainerRef}>
        <div className="mbot">
          Welcome to EatMap! Ask me anything about Hyderabad food. 🍛
        </div>
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        {isTyping && <ChatMessage isTyping={true} />}
      </div>

      <div className="qchips">
        {quickChips.map((chip) => (
          <button
            key={chip.label}
            className="qc"
            onClick={() => onSendMessage(chip.query)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="ch-inp-row">
        <input
          className="ch-inp"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Claude about food spots..."
        />
        <button className="ch-send" onClick={handleSend}>➔</button>
      </div>
    </div>
  );
};
