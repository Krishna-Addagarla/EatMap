import { ChatMessage } from '../types';

export async function sendChatMessage(system: string, messages: ChatMessage[]): Promise<any> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ system, messages })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Trouble connecting — try again in a sec!');
  }

  return data;
}
