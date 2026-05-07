import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Trash2, Square } from 'lucide-react';
import { callDeepSeek } from '../lib/api';
import { CharacterStore, AppConfig } from '../lib/store';
import type { Character, Message } from '../lib/types';

interface ChatPageProps {
  characterId: string;
  onBack: () => void;
}

export function ChatPage({ characterId, onBack }: ChatPageProps) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const char = CharacterStore.get(characterId);
    if (!char) { onBack(); return; }
    setCharacter(char);
    const saved = CharacterStore.getConversation(characterId);
    if (saved.length === 0) {
      setMessages([
        {
          id: 'init',
          role: 'assistant',
          content: getGreeting(char),
          timestamp: new Date().toISOString(),
        },
      ]);
    } else {
      setMessages(saved);
    }
  }, [characterId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessages = useCallback((msgs: Message[]) => {
    CharacterStore.saveConversation(characterId, msgs.filter(m => m.id !== 'init'));
  }, [characterId]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || streaming || !character) return;

    const userContent = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setError('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
    };
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    const nextMessages = [...messages, userMsg, assistantMsg];
    setMessages(nextMessages);
    setStreaming(true);

    const history = nextMessages
      .filter(m => m.id !== 'init' && m.id !== assistantId)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    const apiMessages = [
      { role: 'system' as const, content: character.systemPrompt },
      ...history,
    ];

    const { modelChat } = AppConfig.get();
    abortRef.current = new AbortController();

    try {
      let accumulated = '';
      await callDeepSeek(
        apiMessages,
        modelChat,
        chunk => {
          accumulated += chunk;
          const snapshot = accumulated;
          setMessages(prev =>
            prev.map(m => m.id === assistantId ? { ...m, content: snapshot } : m)
          );
        },
        abortRef.current.signal
      );

      const finalMessages = nextMessages.map(m =>
        m.id === assistantId ? { ...m, content: accumulated } : m
      );
      saveMessages(finalMessages);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('abort')) {
        setError(`请求失败：${msg}`);
        setMessages(prev => prev.filter(m => m.id !== assistantId));
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, character, messages, saveMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAbort = () => {
    abortRef.current?.abort();
  };

  const handleClear = () => {
    if (!character) return;
    if (!confirm('确认清除与该英灵的全部对话记录？')) return;
    CharacterStore.clearConversation(characterId);
    setMessages([{ id: 'init', role: 'assistant', content: getGreeting(character), timestamp: new Date().toISOString() }]);
    setError('');
  };

  if (!character) return null;

  return (
    <div className="chat-page flex flex-col h-screen pt-16">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="chat-sidebar hidden md:flex flex-col w-64 p-6 border-r border-gold/10 shrink-0">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{character.avatar}</div>
            <h2 className="text-gold font-serif text-xl leading-tight">{character.name}</h2>
            <p className="text-text-secondary text-xs mt-1">{character.title}</p>
            <p className="text-text-dim text-xs font-mono mt-1">{character.era}</p>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center mb-6">
            {character.tags.map(tag => (
              <span key={tag} className="char-tag text-xs px-2 py-0.5">{tag}</span>
            ))}
          </div>

          <p className="text-text-dim text-xs leading-relaxed text-center flex-1">
            {character.description}
          </p>

          <div className="mt-auto pt-6 space-y-2">
            <button onClick={handleClear} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
              <Trash2 className="w-3.5 h-3.5" /> 清除记录
            </button>
            <button onClick={onBack} className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
              <ArrowLeft className="w-3.5 h-3.5" /> 返回英灵殿
            </button>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Mobile header */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gold/10">
            <button onClick={onBack} className="text-text-secondary hover:text-gold transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xl">{character.avatar}</span>
            <div>
              <p className="text-gold font-serif text-base">{character.name}</p>
              <p className="text-text-dim text-xs">{character.era}</p>
            </div>
            <button onClick={handleClear} className="ml-auto text-text-dim hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                message={msg}
                character={character}
                isStreaming={streaming && msg === messages[messages.length - 1] && msg.role === 'assistant'}
              />
            ))}
            {streaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex gap-3">
                <div className="w-9 h-9 shrink-0 flex items-center justify-center text-xl">
                  {character.avatar}
                </div>
                <div className="msg-bubble msg-assistant">
                  <span className="animate-pulse text-text-dim text-sm">正在凝神思虑……</span>
                </div>
              </div>
            )}
            {error && (
              <div className="border border-red-500/40 bg-red-900/10 px-3 py-2 text-red-400 text-sm mx-2">
                ✗ {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-area border-t border-gold/10 p-3 md:p-4">
            <div className="flex gap-2 md:gap-3 items-end max-w-4xl mx-auto">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder={`向 ${character.name} 发问……`}
                className="chat-textarea flex-1 resize-none focus:outline-none"
                rows={2}
                style={{ minHeight: '44px', maxHeight: '160px' }}
                disabled={streaming}
              />
              {streaming ? (
                <button
                  onClick={handleAbort}
                  className="btn-ghost shrink-0 w-11 h-11 flex items-center justify-center border border-red-500/40 hover:border-red-500 text-red-400"
                  title="停止"
                >
                  <Square className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="btn-gold shrink-0 w-11 h-11 flex items-center justify-center disabled:opacity-30"
                  title="发送 (Enter)"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-text-dim text-xs font-mono text-center mt-2 hidden md:block">
              Enter 发送 · Shift+Enter 换行 · 模型: {AppConfig.get().modelChat}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  character,
  isStreaming,
}: {
  message: Message;
  character: Character;
  isStreaming: boolean;
}) {
  const isAssistant = message.role === 'assistant';

  if (isAssistant) {
    return (
      <div className="flex gap-3">
        <div className="w-9 h-9 shrink-0 flex items-center justify-center text-xl mt-0.5">
          {character.avatar}
        </div>
        <div className="flex-1 max-w-[85%]">
          <p className="text-gold/60 text-xs font-mono mb-1">{character.name}</p>
          <div className="msg-bubble msg-assistant">
            <span className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</span>
            {isStreaming && message.content && (
              <span className="inline-block w-1.5 h-4 bg-gold/70 ml-1 animate-pulse align-text-bottom" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 flex-row-reverse">
      <div className="w-9 h-9 shrink-0 flex items-center justify-center text-lg bg-gold/10 rounded-full border border-gold/20">
        人
      </div>
      <div className="flex-1 max-w-[85%] text-right">
        <p className="text-text-dim text-xs font-mono mb-1">来访者</p>
        <div className="msg-bubble msg-user ml-auto">
          <span className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</span>
        </div>
      </div>
    </div>
  );
}

function getGreeting(char: Character): string {
  if (char.id === 'jiaoyuan') {
    return '同志，你好。\n\n我以毛泽东的思维框架与你对话。所有分析基于《毛选》五卷，是方法论的提炼，供你参考，不是政治立场表达。\n\n你来找我，我先要问你几个问题。没有调查就没有发言权——连实际情况都不了解，给你的建议就是瞎指挥。\n\n说说你的情况。你今天来，是什么问题困住了你？';
  }
  if (char.id === 'zhuge_liang') {
    return '先生，来者何人？\n\n亮以一缕灵魂之态，候于此处。观先生之神色，似有所思，亦有所困。\n\n不妨道来——亮洗耳恭听。';
  }
  return `${char.name}之灵魂，已在英灵殿中安住。\n\n来者，有何相问？`;
}
