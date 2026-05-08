import type { Character, Message } from './types';

const PREFIX = 'yingling_';

export interface Config {
  apiKey: string;       // DeepSeek API key (chat + soul distillation)
  modelCreation: string;
  modelChat: string;
  openaiApiKey: string; // OpenAI key (optional web-search augmentation)
  searchModel: string;
  imageApiKey: string;  // OpenAI-compatible key for sprite generation
  imageApiBase: string; // API base URL (OpenAI-compatible)
  imageModel: string;   // Image model name
}

export const CharacterStore = {
  getAll(): Character[] {
    try {
      return JSON.parse(localStorage.getItem(PREFIX + 'characters') || '[]');
    } catch {
      return [];
    }
  },

  get(id: string): Character | null {
    return this.getAll().find(c => c.id === id) ?? null;
  },

  save(character: Character): void {
    const all = this.getAll();
    const idx = all.findIndex(c => c.id === character.id);
    if (idx >= 0) all[idx] = character;
    else all.push(character);
    localStorage.setItem(PREFIX + 'characters', JSON.stringify(all));
  },

  delete(id: string): void {
    const all = this.getAll().filter(c => c.id !== id);
    localStorage.setItem(PREFIX + 'characters', JSON.stringify(all));
    localStorage.removeItem(PREFIX + 'conv_' + id);
  },

  getConversation(id: string): Message[] {
    try {
      return JSON.parse(localStorage.getItem(PREFIX + 'conv_' + id) || '[]');
    } catch {
      return [];
    }
  },

  saveConversation(id: string, messages: Message[]): void {
    localStorage.setItem(PREFIX + 'conv_' + id, JSON.stringify(messages.slice(-60)));
  },

  clearConversation(id: string): void {
    localStorage.removeItem(PREFIX + 'conv_' + id);
  },
};

export const AppConfig = {
  get(): Config {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFIX + 'config') || '{}');
      return {
        apiKey:        saved.apiKey        || '',
        modelCreation: saved.modelCreation || 'deepseek-v4-pro',
        modelChat:     saved.modelChat     || 'deepseek-v4-flash',
        openaiApiKey:  saved.openaiApiKey  || '',
        searchModel:   saved.searchModel   || 'gpt-4o',
        imageApiKey:   saved.imageApiKey   || '',
        imageApiBase:  saved.imageApiBase  || 'https://api.openai.com/v1',
        imageModel:    saved.imageModel    || 'gpt-image-1',
      };
    } catch {
      return {
        apiKey: '', modelCreation: 'deepseek-v4-pro', modelChat: 'deepseek-v4-flash',
        openaiApiKey: '', searchModel: 'gpt-4o',
        imageApiKey: '', imageApiBase: 'https://api.openai.com/v1', imageModel: 'gpt-image-1',
      };
    }
  },

  save(updates: Partial<Config>): void {
    const current = this.get();
    localStorage.setItem(PREFIX + 'config', JSON.stringify({ ...current, ...updates }));
  },
};
