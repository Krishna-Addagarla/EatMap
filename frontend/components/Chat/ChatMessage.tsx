import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';

interface ChatMessageProps {
  message?: ChatMessageType;
  isTyping?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isTyping }) => {
  if (isTyping) {
    return (
      <div className="mtyping" id="tyind">
        <div className="tdots">
          <div className="tdot"></div>
          <div className="tdot"></div>
          <div className="tdot"></div>
        </div>
      </div>
    );
  }

  if (!message) return null;

  const isUser = message.role === 'user';
  return (
    <div className={isUser ? 'muser' : 'mbot'}>
      {message.content}
    </div>
  );
};
