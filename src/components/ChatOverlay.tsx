import { useEffect, useRef, useState } from "react";
import type { SoulProfile } from "@/config";

interface ChatMessage {
  role: "user" | "soul";
  content: string;
  timestamp: number;
}

interface Props {
  soul: SoulProfile | null;
  open: boolean;
  onClose: () => void;
}

function generateSoulReply(soul: SoulProfile, userText: string): string {
  const text = userText.toLowerCase();
  const quotes = soul.quotes;
  const traits = soul.coreTraits;
  const methods = soul.methodology;

  // Keyword matching for different souls
  if (soul.id === "zhugeliang") {
    if (text.includes("谋") || text.includes("策") || text.includes("计")) {
      return "用兵之道，在于人和。若将吏相猜，士卒不服，虽有汤、武之智而不能取胜。" + methods[0];
    }
    if (text.includes("天") || text.includes("命") || text.includes("运")) {
      return quotes[2] + " 智者不逆天，亦不逆时，亦不逆人。";
    }
    if (text.includes("败") || text.includes("输") || text.includes("难")) {
      return "善将者，其刚不可折，其柔不可卷。纯柔纯弱，其势必削；纯刚纯强，其势必亡。不柔不刚，合道之长。";
    }
    if (text.includes("人") || text.includes("心") || text.includes("德")) {
      return "古之善将者，养人如养己子，有难则以身先之，有功则以身后之。" + traits[2];
    }
    return quotes[Math.floor(Math.random() * quotes.length)] + " —— 此乃吾毕生所悟，汝当深思。";
  }

  if (soul.id === "sherlock") {
    if (text.includes("推") || text.includes("理") || text.includes("想")) {
      return "当你排除了不可能，剩下的无论多么难以置信，就是真相。" + methods[1];
    }
    if (text.includes("看") || text.includes("观") || text.includes("见")) {
      return "你看见了，但你没有观察。这之间的区别非常明显。" + methods[2];
    }
    if (text.includes("脑") || text.includes("思") || text.includes("智")) {
      return "大脑如同一个空阁楼，要有选择地把家具装进去。" + methods[3];
    }
    if (text.includes("情") || text.includes("爱") || text.includes("感")) {
      return "我向来不使我的心智被任何主观情感所左右。恋爱太过于情感用事，这与我无比尊重的理性是水火不容的。";
    }
    return "数据！数据！数据！" + quotes[1] + " 没有数据就做推理，是不可饶恕的。";
  }

  if (soul.id === "caocao") {
    if (text.includes("胜") || text.includes("赢") || text.includes("战")) {
      return "夫为将之道，必顺天、因时、依人以立胜也。" + methods[2];
    }
    if (text.includes("人") || text.includes("才") || text.includes("用")) {
      return "明扬仄陋，唯才是举。吾用人不问出身，只看能否建功立业。";
    }
    if (text.includes("酒") || text.includes("诗") || text.includes("歌")) {
      return quotes[1] + " 老骥伏枥，志在千里。纵使暮年，壮心不已！";
    }
    if (text.includes("敌") || text.includes("对") || text.includes("仇")) {
      return "宁教我负天下人，休教天下人负我。乱世之中，仁慈即是软弱。";
    }
    return quotes[3] + " 天下未定，吾辈岂能安枕？";
  }

  if (soul.id === "poirot") {
    if (text.includes("心") || text.includes("想") || text.includes("动")) {
      return "理解人性，便理解了一切犯罪。每个人都有能力谋杀——只是大多数人不这么做。" + methods[0];
    }
    if (text.includes("序") || text.includes("整") || text.includes("乱")) {
      return "秩序，method，是我的一切。犯罪是对秩序的破坏，恢复秩序即找到真相。" + methods[1];
    }
    if (text.includes("细") || text.includes("小") || text.includes("微")) {
      return "真相往往隐藏在最不起眼的细节中。我的灰色细胞不会放过任何矛盾。";
    }
    return "我动用我的小小灰色细胞。" + methods[3];
  }

  return quotes[0];
}

export default function ChatOverlay({ soul, open, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput("");
      return;
    }
    // Initial greeting
    if (soul && messages.length === 0) {
      const greeting = soul.id === "zhugeliang"
        ? "来者何人？吾观汝气色，似有心事。不妨道来，让孔明为你剖析一二。"
        : soul.id === "sherlock"
        ? "请坐。在我观察你的三十秒内，我已经注意到你的鞋子磨损方式、袖口墨渍和紧张时摸鼻子的习惯。说吧，是什么谜题让你来访？"
        : soul.id === "caocao"
        ? "哈！又一位访客。说吧，你是来献策，还是来求援？吾时间宝贵，直言无妨。"
        : "请进，请进。一切都必须井井有条。现在，告诉我——是什么困扰着你的小小灰色细胞？";
      setMessages([{ role: "soul", content: greeting, timestamp: Date.now() }]);
    }
  }, [open, soul]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const handleSend = () => {
    if (!input.trim() || !soul || typing) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const reply = generateSoulReply(soul, userMsg.content);
      setMessages((prev) => [...prev, { role: "soul", content: reply, timestamp: Date.now() }]);
      setTyping(false);
    }, 1200 + Math.random() * 800);
  };

  if (!open || !soul) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 2, 2, 0.97)",
        backdropFilter: "blur(10px)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transition: "opacity 0.3s ease",
      }}
    >
      {/* Chat Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: "1px solid rgba(0, 255, 65, 0.2)",
          background: "rgba(0, 255, 65, 0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <img
            src={soul.src}
            alt={soul.name}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(0, 255, 65, 0.4)",
              boxShadow: "0 0 12px rgba(0, 255, 65, 0.2)",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "14px",
                fontWeight: 700,
                color: "#00ff41",
                letterSpacing: "0.05em",
                textShadow: "0 0 8px rgba(0,255,65,0.4)",
              }}
            >
              {soul.name}
            </div>
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                color: "rgba(0, 255, 65, 0.5)",
                letterSpacing: "0.05em",
              }}
            >
              {soul.title} · {typing ? "思考中..." : "在线"}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid rgba(0, 255, 65, 0.3)",
            color: "#00ff41",
            padding: "6px 14px",
            fontFamily: "'Courier New', monospace",
            fontSize: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0, 255, 65, 0.1)";
            e.currentTarget.style.borderColor = "rgba(0, 255, 65, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(0, 255, 65, 0.3)";
          }}
        >
          [ 结束对话 ]
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflow: "auto",
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: msg.role === "user" ? "flex-end" : "flex-start",
              gap: "4px",
            }}
          >
            <div
              style={{
                maxWidth: "70%",
                padding: "12px 16px",
                borderRadius: "4px",
                fontFamily: "'Courier New', monospace",
                fontSize: "14px",
                lineHeight: 1.6,
                color: msg.role === "user" ? "#050505" : "#00ff41",
                background: msg.role === "user" ? "rgba(0, 255, 65, 0.85)" : "rgba(0, 255, 65, 0.06)",
                border: msg.role === "user" ? "none" : "1px solid rgba(0, 255, 65, 0.2)",
                boxShadow: msg.role === "user" ? "0 0 12px rgba(0, 255, 65, 0.2)" : "0 0 8px rgba(0, 255, 65, 0.05)",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </div>
            <span
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "10px",
                color: "rgba(0, 255, 65, 0.3)",
                letterSpacing: "0.05em",
              }}
            >
              {new Date(msg.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}

        {typing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 16px",
              color: "rgba(0, 255, 65, 0.6)",
              fontFamily: "'Courier New', monospace",
              fontSize: "13px",
            }}
          >
            <span style={{ animation: "matrix-pulse 1s ease-in-out infinite" }}>▌</span>
            <span>灵魂正在组织语言...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "16px 32px",
          borderTop: "1px solid rgba(0, 255, 65, 0.15)",
          background: "rgba(0, 255, 65, 0.02)",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={`向 ${soul.name} 发问...`}
          className="matrix-input"
          style={{
            flex: 1,
            borderRadius: "2px",
          }}
        />
        <button
          onClick={handleSend}
          className="matrix-btn"
          style={{
            fontWeight: 700,
            whiteSpace: "nowrap",
            opacity: input.trim() ? 1 : 0.5,
          }}
        >
          发送 ▶
        </button>
      </div>
    </div>
  );
}
