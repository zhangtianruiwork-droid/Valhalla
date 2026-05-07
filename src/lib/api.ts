import { AppConfig } from './store';

const API_BASE = 'https://api.deepseek.com/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function callDeepSeek(
  messages: ChatMessage[],
  model: string,
  onChunk?: (text: string) => void,
  signal?: AbortSignal
): Promise<string> {
  const { apiKey } = AppConfig.get();
  const stream = !!onChunk;

  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
      temperature: 0.85,
      max_tokens: 6000,
    }),
    signal,
  });

  if (!response.ok) {
    let errMsg = `API Error ${response.status}`;
    try {
      const err = await response.json();
      errMsg = err?.error?.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  if (!stream) {
    const data = await response.json();
    return data.choices[0]?.message?.content ?? '';
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) {
          fullText += text;
          onChunk!(text);
        }
      } catch {}
    }
  }

  return fullText;
}
