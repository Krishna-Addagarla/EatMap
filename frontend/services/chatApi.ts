import { ChatMessage } from '../types';

export async function sendChatMessage(system: string, messages: ChatMessage[]): Promise<any> {
  const token = localStorage.getItem('eatmapToken') || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch('/api/v1/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({ system, messages })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Trouble connecting — try again in a sec!');
  }

  return data;
}
