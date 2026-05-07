import { useMemo, useState } from 'react';
import { Activity, Cpu, MessageCircle, Plus, Settings, Sparkles } from 'lucide-react';
import { CharacterStore } from '../lib/store';
import { PREBUILT_CHARACTERS } from '../data/prebuilt';
import { CharacterDetailOverlay } from '../components/CharacterDetailOverlay';
import type { Character } from '../lib/types';

interface HallPageProps {
  onOpenChat: (characterId: string) => void;
  onOpenSummon: () => void;
  onOpenSettings: () => void;
}

const statusItems = [
  { label: 'CORE', value: 'ONLINE' },
  { label: 'SYNC', value: '99.7%' },
  { label: 'LATENCY', value: '12MS' },
];

function loadInitialCharacters() {
  PREBUILT_CHARACTERS.forEach(c => {
    CharacterStore.save(c);
  });
  const priority = new Map(PREBUILT_CHARACTERS.map((character, index) => [character.id, index]));
  return CharacterStore.getAll().sort((a, b) => {
    const ai = priority.get(a.id) ?? 999;
    const bi = priority.get(b.id) ?? 999;
    if (ai !== bi) return ai - bi;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export function HallPage({ onOpenChat, onOpenSummon, onOpenSettings }: HallPageProps) {
  const [characters] = useState<Character[]>(loadInitialCharacters);
  const [hoveredId, setHoveredId] = useState<string | null>(() => characters[0]?.id ?? null);
  const [selected, setSelected] = useState<Character | null>(null);

  const hoveredChar = characters.find(c => c.id === hoveredId) ?? characters[0] ?? null;
  const profileStats = useMemo(() => {
    const profile = hoveredChar?.soulProfile;
    return [
      { label: '特征', value: profile?.coreTraits.length ?? hoveredChar?.tags.length ?? 0 },
      { label: '协议', value: profile?.dialogueProtocols.signature.length ?? 0 },
      { label: '模型', value: profile?.mentalModels.length ?? 0 },
    ];
  }, [hoveredChar]);

  return (
    <main className="hall-page sci-shell">
      <div className="sci-grid" />
      <div className="hall-scan-line" />

      <header className="sci-topbar">
        <button className="brand-lockup" onClick={() => setHoveredId(characters[0]?.id ?? null)}>
          <span className="brand-mark">SF</span>
          <span>
            <span className="brand-title">英灵殿</span>
            <span className="brand-subtitle">SoulForge Command</span>
          </span>
        </button>

        <div className="sci-status-row">
          {statusItems.map(item => (
            <div className="sci-status" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>

        <div className="sci-actions">
          <button className="sci-icon-btn" onClick={onOpenSummon} title="召唤英灵">
            <Plus className="w-4 h-4" />
            <span>召唤</span>
          </button>
          <button className="sci-icon-btn" onClick={onOpenSettings} title="系统设置">
            <Settings className="w-4 h-4" />
            <span>设置</span>
          </button>
        </div>
      </header>

      <section className="hall-layout">
        <aside className="soul-index-panel">
          <div className="panel-heading">
            <span>灵魂索引</span>
            <strong>{characters.length.toString().padStart(2, '0')}</strong>
          </div>

          <div className="soul-index-list">
            {characters.map((char, index) => {
              const active = hoveredChar?.id === char.id;
              return (
                <button
                  key={char.id}
                  className={`soul-index-item ${active ? 'active' : ''}`}
                  onClick={() => setSelected(char)}
                  onMouseEnter={() => setHoveredId(char.id)}
                >
                  <span className="index-code">{String(index + 1).padStart(2, '0')}</span>
                  <span className="index-main">
                    <strong>{char.name}</strong>
                    <small>{char.tags[0]} / {char.isPrebuilt ? '典藏档案' : '蒸馏档案'}</small>
                  </span>
                  <span className="index-avatar">{char.avatar}</span>
                </button>
              );
            })}
          </div>

          <button className="summon-strip" onClick={onOpenSummon}>
            <Sparkles className="w-4 h-4" />
            <span>新建灵魂蒸馏任务</span>
          </button>
        </aside>

        <section className="hero-console" aria-live="polite">
          {hoveredChar ? (
            <>
              <div className="hero-art-panel">
                <img src="/images/soulforge-command-hero.png" alt="" />
                <div className="art-shade" />
                <div className="holo-stage">
                  <div className="holo-ring ring-a" />
                  <div className="holo-ring ring-b" />
                  <div className="holo-avatar">{hoveredChar.avatar}</div>
                  <div className="holo-platform" />
                </div>
              </div>

              <div className="hero-copy">
                <div className="section-marker">ACTIVE SOUL PROFILE</div>
                <h1>{hoveredChar.name}</h1>
                <p className="hero-title">{hoveredChar.title}</p>
                <p className="hero-era">{hoveredChar.era}</p>
                <p className="hero-description">{hoveredChar.description}</p>

                <div className="tag-row">
                  {hoveredChar.tags.slice(0, 4).map(tag => (
                    <span className="sci-tag" key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="enterprise-kpis">
                  <div><span>PROFILE</span><strong>{hoveredChar.isPrebuilt ? 'CURATED' : 'CUSTOM'}</strong></div>
                  <div><span>MODE</span><strong>ROLE-LOCK</strong></div>
                  <div><span>STATUS</span><strong>READY</strong></div>
                </div>

                <div className="hero-actions">
                  <button className="btn-primary-sci" onClick={() => setSelected(hoveredChar)}>
                    <Cpu className="w-4 h-4" />
                    档案详情
                  </button>
                  <button className="btn-secondary-sci" onClick={() => onOpenChat(hoveredChar.id)}>
                    <MessageCircle className="w-4 h-4" />
                    开始对话
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-console">
              <Sparkles className="w-8 h-8" />
              <p>等待灵魂档案接入</p>
            </div>
          )}
        </section>

        <aside className="intel-panel">
          <div className="panel-heading">
            <span>档案遥测</span>
            <Activity className="w-4 h-4" />
          </div>

          <div className="stat-grid">
            {profileStats.map(stat => (
              <div className="stat-card" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>

          <div className="intel-block">
            <span className="intel-label">当前协议</span>
            <p>{hoveredChar?.soulProfile?.dialogueProtocols.signature[0] ?? '点击左侧档案查看交互协议'}</p>
          </div>

          <div className="intel-block">
            <span className="intel-label">调用建议</span>
            <p>{hoveredChar ? '先打开档案确认人格边界，再进入对话以获得稳定角色体验。' : '暂无已选英灵。'}</p>
          </div>
        </aside>
      </section>

      <footer className="sci-footer">
        <span>© 2026 SoulForge</span>
        <span>英灵殿商业级角色蒸馏平台</span>
        <span>{characters.length} 位英灵已安住</span>
      </footer>

      <CharacterDetailOverlay
        character={selected}
        onClose={() => setSelected(null)}
        onOpenChat={() => {
          if (selected) {
            onOpenChat(selected.id);
            setSelected(null);
          }
        }}
      />
    </main>
  );
}
