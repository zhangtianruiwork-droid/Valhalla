import { useEffect, useState } from "react";
import type { SoulProfile } from "@/config";
import { overlayConfig } from "@/config";
import ChatOverlay from "./ChatOverlay";

interface Props {
  soul: SoulProfile | null;
  onClose: () => void;
}

function SectionBlock({ title, items, color = "#00ff41" }: { title: string; items: string[]; color?: string }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: color,
          opacity: 0.7,
          marginBottom: "8px",
          borderBottom: `1px solid ${color}30`,
          paddingBottom: "4px",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "13px",
              lineHeight: 1.5,
              color: "rgba(0, 255, 65, 0.85)",
              paddingLeft: "12px",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                top: "6px",
                width: "4px",
                height: "4px",
                background: color,
                borderRadius: "50%",
                opacity: 0.6,
              }}
            />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ImageDetailOverlay({ soul, onClose }: Props) {
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!soul) {
      setChatOpen(false);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [soul, onClose]);

  const open = !!soul;

  const eyebrow =
    soul && soul.category
      ? overlayConfig.frameDetailLabel
        ? `${soul.category} — ${overlayConfig.frameDetailLabel}`
        : soul.category
      : "";

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(2, 2, 2, 0.96)",
          backdropFilter: "blur(8px)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 64px",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.35s ease",
        }}
      >
        {soul && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.2fr) minmax(360px, 1fr)",
              gap: "48px",
              maxWidth: "1480px",
              width: "100%",
              maxHeight: "100%",
              alignItems: "start",
              transform: open ? "scale(1)" : "scale(0.98)",
              transition: "transform 0.35s ease",
            }}
          >
            {/* Image + Basic Info */}
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                maxHeight: "calc(100vh - 96px)",
              }}
            >
              <div
                style={{
                  position: "relative",
                  border: "1px solid rgba(0, 255, 65, 0.25)",
                  boxShadow: "0 0 30px rgba(0, 255, 65, 0.1), inset 0 0 30px rgba(0, 255, 65, 0.03)",
                  padding: "8px",
                }}
              >
                <img
                  src={soul.src}
                  alt={soul.name}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: "calc(100vh - 280px)",
                    objectFit: "contain",
                  }}
                />
                {/* Corner decorations */}
                <div style={{ position: "absolute", top: -1, left: -1, width: 12, height: 12, borderTop: "2px solid #00ff41", borderLeft: "2px solid #00ff41" }} />
                <div style={{ position: "absolute", top: -1, right: -1, width: 12, height: 12, borderTop: "2px solid #00ff41", borderRight: "2px solid #00ff41" }} />
                <div style={{ position: "absolute", bottom: -1, left: -1, width: 12, height: 12, borderBottom: "2px solid #00ff41", borderLeft: "2px solid #00ff41" }} />
                <div style={{ position: "absolute", bottom: -1, right: -1, width: 12, height: 12, borderBottom: "2px solid #00ff41", borderRight: "2px solid #00ff41" }} />
              </div>

              {/* Basic meta under image */}
              <div
                style={{
                  marginTop: "16px",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "12px",
                  color: "rgba(0, 255, 65, 0.6)",
                  textAlign: "center",
                  letterSpacing: "0.05em",
                }}
              >
                <div style={{ fontSize: "14px", color: "#00ff41", marginBottom: "4px", textShadow: "0 0 8px rgba(0,255,65,0.4)" }}>
                  {soul.name} · {soul.title}
                </div>
                <div>{soul.era}</div>
              </div>
            </div>

            {/* Soul Profile Panel */}
            <div
              style={{
                color: "#00ff41",
                fontFamily: "'Courier New', monospace",
                display: "flex",
                flexDirection: "column",
                gap: "0px",
                maxHeight: "calc(100vh - 96px)",
                overflow: "auto",
                paddingRight: "12px",
              }}
            >
              {/* Header */}
              {eyebrow && (
                <p
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    opacity: 0.55,
                    margin: "0 0 12px 0",
                  }}
                >
                  {eyebrow}
                </p>
              )}

              {soul.title && (
                <h2
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: "clamp(22px, 2.2vw, 32px)",
                    fontWeight: 700,
                    lineHeight: 1.15,
                    letterSpacing: "0.04em",
                    margin: "0 0 16px 0",
                    textShadow: "0 0 12px rgba(0,255,65,0.3)",
                  }}
                >
                  {soul.title}
                </h2>
              )}

              {soul.description && (
                <p
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.65,
                    color: "rgba(0, 255, 65, 0.75)",
                    margin: "0 0 20px 0",
                    paddingBottom: "16px",
                    borderBottom: "1px solid rgba(0, 255, 65, 0.15)",
                  }}
                >
                  {soul.description}
                </p>
              )}

              {/* Sections */}
              <SectionBlock title="◆ 核心特性" items={soul.coreTraits} />
              <SectionBlock title="◆ 方法论内核" items={soul.methodology} />
              <SectionBlock title="◆ 阶段对话协议" items={soul.dialogueProtocol} />
              <SectionBlock title="◆ 核心心智模型" items={soul.mentalModel} />

              {/* Quotes */}
              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#00ff41",
                    opacity: 0.7,
                    marginBottom: "8px",
                    borderBottom: "1px solid rgba(0, 255, 65, 0.2)",
                    paddingBottom: "4px",
                  }}
                >
                  ◆ 灵魂印记 · 经典语录
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {soul.quotes.map((quote, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "13px",
                        lineHeight: 1.6,
                        color: "rgba(0, 255, 65, 0.8)",
                        fontStyle: "italic",
                        padding: "8px 12px",
                        background: "rgba(0, 255, 65, 0.04)",
                        borderLeft: "2px solid rgba(0, 255, 65, 0.3)",
                      }}
                    >
                      "{quote}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px", paddingTop: "16px", borderTop: "1px solid rgba(0, 255, 65, 0.2)" }}>
                <button
                  onClick={() => setChatOpen(true)}
                  className="matrix-btn"
                  style={{
                    background: "rgba(0, 255, 65, 0.1)",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                  }}
                >
                  ▶ 开始对话
                </button>
                {overlayConfig.closeLabel && (
                  <button onClick={onClose} className="matrix-btn">
                    {overlayConfig.closeLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Close X */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "fixed",
            top: "24px",
            right: "32px",
            background: "transparent",
            border: "none",
            color: "#00ff41",
            fontSize: "28px",
            lineHeight: 1,
            cursor: "pointer",
            padding: "8px 12px",
            opacity: 0.7,
            transition: "opacity 0.2s ease",
            fontFamily: "'Courier New', monospace",
            textShadow: "0 0 8px rgba(0,255,65,0.4)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          [×]
        </button>
      </div>

      {/* Chat Overlay */}
      <ChatOverlay soul={soul} open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
