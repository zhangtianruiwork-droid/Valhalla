import { useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentWindow, currentMonitor, LogicalSize, LogicalPosition } from '@tauri-apps/api/window';
import { PetSprite } from './components/pet/PetSprite';
import { PixelPetSprite } from './components/pet/PixelPetSprite';
import { PetContextMenu } from './components/pet/PetContextMenu';
import { PetChatPanel } from './components/pet/PetChatPanel';
import { type PetState, randomIdleState, ACTION_DURATION, getSpritesForCharacter } from './lib/petActions';
import type { Character } from './lib/types';

interface Props {
  character: Character;
  onExit: () => void;
}

const SPRITE_W = 180;
const SPRITE_H = 280;
const CHAT_H  = 520;
const MENU_W  = 178;
const MENU_H  = 110;

export function PetApp({ character, onExit }: Props) {
  const [chatOpen, setChatOpen]   = useState(false);
  const [petState, setPetState]   = useState<PetState>('idle');
  const [menuPos, setMenuPos]     = useState<{ x: number; y: number } | null>(null);
  const [winW, setWinW]           = useState(window.innerWidth);
  const hasStaticSprites          = !!getSpritesForCharacter(character.id);
  const hasPixelSprites           = !!character.hasPixelSprites;
  const appWindow                 = getCurrentWindow();

  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chatOpenRef    = useRef(false);
  chatOpenRef.current  = chatOpen;

  // ── 过渡到桌宠模式 ──────────────────────────
  useEffect(() => {
    const init = async () => {
      const monitor = await currentMonitor();
      const sf = monitor?.scaleFactor ?? 1;
      const sw = (monitor?.size.width  ?? 1920) / sf;
      const sh = (monitor?.size.height ?? 1080) / sf;
      await appWindow.setAlwaysOnTop(true);
      await appWindow.setResizable(false);
      await appWindow.setSize(new LogicalSize(SPRITE_W, SPRITE_H));
      await appWindow.setPosition(new LogicalPosition(
        Math.round(sw - SPRITE_W - 60),
        Math.round(sh - SPRITE_H - 120),
      ));
    };
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 监听窗口宽度（对话时可拖拽调整） ────────
  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── 动作计时器 ──────────────────────────────
  const triggerAction = useCallback((action: PetState) => {
    clearTimeout(actionTimerRef.current);
    setPetState(action);
    const dur = ACTION_DURATION[action];
    if (dur && dur > 0) {
      actionTimerRef.current = setTimeout(() => {
        setPetState(chatOpenRef.current ? 'talking' : 'idle');
      }, dur);
    }
  }, []);

  // ── 待机随机切换 ────────────────────────────
  useEffect(() => {
    if (chatOpen) return;
    const schedule = () => {
      actionTimerRef.current = setTimeout(() => {
        Math.random() < 0.2 ? triggerAction('violin') : setPetState(randomIdleState());
        schedule();
      }, 12000 + Math.random() * 18000);
    };
    schedule();
    return () => clearTimeout(actionTimerRef.current);
  }, [chatOpen, triggerAction]);

  // ── 打开对话 ────────────────────────────────
  const openChat = useCallback(async () => {
    setMenuPos(null);
    setChatOpen(true);
    triggerAction('waving'); // greet on open
    actionTimerRef.current = setTimeout(() => setPetState('thinking'), 2200);
    const initChatW = Math.min(Math.max(420, winW - SPRITE_W), 600);
    await appWindow.setResizable(true);
    await appWindow.setMinSize(new LogicalSize(SPRITE_W + 300, 400));
    await appWindow.setSize(new LogicalSize(SPRITE_W + initChatW, CHAT_H));
  }, [appWindow, winW, triggerAction]);

  // ── 关闭对话 ────────────────────────────────
  const closeChat = useCallback(async () => {
    setChatOpen(false);
    clearTimeout(actionTimerRef.current);
    setPetState('idle');
    await appWindow.setResizable(false);
    await appWindow.setMinSize(null);
    await appWindow.setSize(new LogicalSize(SPRITE_W, SPRITE_H));
  }, [appWindow]);

  // ── 返回选角界面 ────────────────────────────
  const handleExit = useCallback(async () => {
    setMenuPos(null);
    if (chatOpen) await closeChat();
    await appWindow.setAlwaysOnTop(false);
    await appWindow.setResizable(true);
    await appWindow.setMinSize(new LogicalSize(600, 480));
    await appWindow.setSize(new LogicalSize(860, 620));
    await appWindow.center();
    onExit();
  }, [appWindow, chatOpen, closeChat, onExit]);

  // ── 拖拽 → 跑步 ─────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      triggerAction('running');
      // Auto-revert to idle after drag (Tauri takes over mouse, so use timer)
      actionTimerRef.current = setTimeout(() => {
        setPetState(chatOpenRef.current ? 'talking' : 'idle');
      }, 3000);
      appWindow.startDragging();
    }
  }, [appWindow, triggerAction]);

  // ── 双击 → 跳跃 ────────────────────────────
  const handleDoubleClick = useCallback(() => {
    triggerAction('jumping');
  }, [triggerAction]);

  // ── 悬停 → idle2 ────────────────────────────
  const handleMouseEnter = useCallback(() => {
    setPetState(prev => (prev === 'idle' || prev === 'idle3') ? 'idle2' : prev);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setPetState(prev => prev === 'idle2' ? 'idle' : prev);
  }, []);

  // ── 右键菜单 → idle3 ────────────────────────
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPetState('idle3');
    const ww = window.innerWidth, wh = window.innerHeight;
    setMenuPos({
      x: Math.min(e.clientX, ww - MENU_W - 4),
      y: Math.min(e.clientY, wh - MENU_H - 4),
    });
  }, []);

  // ── 流式输出变化 ─────────────────────────────
  const handleStreamingChange = useCallback((streaming: boolean) => {
    if (streaming) {
      clearTimeout(actionTimerRef.current);
      setPetState('thinking');
    } else {
      // After reply: show talking briefly then return to idle
      setPetState('talking');
      actionTimerRef.current = setTimeout(() => {
        setPetState(chatOpenRef.current ? 'idle2' : 'idle');
      }, 4000);
    }
  }, []);

  const handleActionDetected = useCallback((action: PetState) => {
    triggerAction(action);
  }, [triggerAction]);

  const chatW = Math.max(300, winW - SPRITE_W);

  return (
    <div
      style={{ width: '100vw', height: '100vh', background: 'transparent', display: 'flex', overflow: 'hidden' }}
      onClick={() => setMenuPos(null)}
    >
      {/* 精灵区 */}
      <div
        style={{ width: SPRITE_W, height: '100%', flexShrink: 0 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      >
        {hasPixelSprites
          ? <PixelPetSprite
              character={character}
              state={petState}
              onMouseDown={handleMouseDown}
              onContextMenu={handleContextMenu}
            />
          : hasStaticSprites
            ? <PetSprite
                character={character}
                state={petState}
                onMouseDown={handleMouseDown}
                onContextMenu={handleContextMenu}
              />
            : <EmojiFallback
                character={character}
                onMouseDown={handleMouseDown}
                onContextMenu={handleContextMenu}
              />
        }
      </div>

      {/* 对话面板（宽度跟随窗口） */}
      {chatOpen && (
        <PetChatPanel
          character={character}
          width={chatW}
          onClose={closeChat}
          onStreamingChange={handleStreamingChange}
          onActionDetected={handleActionDetected}
        />
      )}

      {/* 右键菜单 */}
      {menuPos && (
        <PetContextMenu
          x={menuPos.x}
          y={menuPos.y}
          character={character}
          onOpenChat={openChat}
          onSwitchCharacter={handleExit}
          onClose={() => setMenuPos(null)}
          onQuit={() => appWindow.close()}
        />
      )}
    </div>
  );
}

// ── 无精灵角色的 emoji 后备 ───────────────────
function EmojiFallback({
  character, onMouseDown, onContextMenu,
}: {
  character: Character;
  onMouseDown: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        paddingBottom: 8,
        cursor: 'grab',
        animation: 'petFloat 3.5s ease-in-out infinite',
      }}
    >
      <div style={{
        fontSize: 80,
        filter: 'drop-shadow(0 8px 20px rgba(212,175,55,0.4))',
        userSelect: 'none',
        lineHeight: 1,
      }}>
        {character.avatar}
      </div>
    </div>
  );
}
