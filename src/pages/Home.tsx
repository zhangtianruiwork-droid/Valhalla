import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import VortexGallery from "@/lib/VortexGallery";
import Lenis from "lenis";
import {
  siteConfig,
  navigationConfig,
  galleryConfig,
} from "@/config";
import ImageDetailOverlay from "@/components/ImageDetailOverlay";
import MatrixRain from "@/components/MatrixRain";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vortexRef = useRef<VortexGallery | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const images = galleryConfig.images;
  const hasImages = images.length > 0;

  useEffect(() => {
    if (!canvasRef.current || !hasImages) return;

    const vortex = new VortexGallery(
      canvasRef.current,
      images.map((i) => i.src)
    );
    vortexRef.current = vortex;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      vortex.destroy();
      lenis.destroy();
    };
  }, [hasImages, images]);

  useEffect(() => {
    vortexRef.current?.setPaused(selectedIdx !== null);
  }, [selectedIdx]);

  if (!hasImages) return null;

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const vortex = vortexRef.current;
    const canvas = canvasRef.current;
    if (!vortex || !canvas) return;
    const idx = vortex.pickAtScreen(
      e.clientX,
      e.clientY,
      canvas.getBoundingClientRect()
    );
    if (idx !== null) {
      setSelectedIdx(idx);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#050505",
      }}
    >
      {/* Matrix Rain Background */}
      <MatrixRain />

      {/* WebGL Canvas — the vortex */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          cursor: "pointer",
        }}
      />

      {/* UI Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {/* Top-left Logo */}
        {siteConfig.brandName && (
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "32px",
              fontFamily: "'Courier New', monospace",
              fontSize: "16px",
              fontWeight: 700,
              color: "#00ff41",
              letterSpacing: "0.12em",
              pointerEvents: "auto",
              cursor: "default",
              textShadow: "0 0 12px rgba(0, 255, 65, 0.6)",
              animation: "matrix-pulse 3s ease-in-out infinite",
            }}
          >
            &lt;{siteConfig.brandName}/&gt;
          </div>
        )}

        {/* Top-right Info */}
        {navigationConfig.infoLinkLabel && (
          <Link
            to="/info"
            style={{
              position: "absolute",
              top: "24px",
              right: "32px",
              fontFamily: "'Courier New', monospace",
              fontSize: "13px",
              fontWeight: 400,
              color: "#00ff41",
              textDecoration: "none",
              pointerEvents: "auto",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textShadow: "0 0 8px rgba(0, 255, 65, 0.4)",
              transition: "opacity 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            [{navigationConfig.infoLinkLabel}]
          </Link>
        )}

        {/* Center hint */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: "'Courier New', monospace",
            fontSize: "11px",
            color: "rgba(0, 255, 65, 0.35)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textAlign: "center",
            pointerEvents: "none",
            animation: "matrix-pulse 4s ease-in-out infinite",
          }}
        >
          滚动漩涡 · 点击灵魂 · 开启对话
        </div>

        {/* Soul list sidebar */}
        <div
          style={{
            position: "absolute",
            left: "32px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            pointerEvents: "auto",
          }}
        >
          {images.map((soul, i) => (
            <button
              key={soul.id}
              onClick={() => setSelectedIdx(i)}
              style={{
                background: selectedIdx === i ? "rgba(0, 255, 65, 0.15)" : "transparent",
                border: "1px solid rgba(0, 255, 65, 0.25)",
                borderLeftWidth: "3px",
                borderLeftColor: selectedIdx === i ? "#00ff41" : "rgba(0, 255, 65, 0.15)",
                color: "#00ff41",
                padding: "8px 14px",
                fontFamily: "'Courier New', monospace",
                fontSize: "12px",
                cursor: "pointer",
                textAlign: "left",
                width: "160px",
                transition: "all 0.3s ease",
                letterSpacing: "0.05em",
                opacity: selectedIdx === i ? 1 : 0.7,
              }}
              onMouseEnter={(e) => {
                if (selectedIdx !== i) {
                  e.currentTarget.style.background = "rgba(0, 255, 65, 0.08)";
                  e.currentTarget.style.opacity = "1";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedIdx !== i) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.opacity = "0.7";
                }
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: "2px" }}>{soul.name}</div>
              <div style={{ fontSize: "10px", opacity: 0.6, textTransform: "uppercase" }}>
                {soul.category}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        {siteConfig.copyright && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "'Courier New', monospace",
              fontSize: "11px",
              fontWeight: 400,
              color: "#00ff41",
              opacity: 0.4,
              letterSpacing: "0.08em",
            }}
          >
            {siteConfig.copyright}
          </div>
        )}
      </div>

      <ImageDetailOverlay
        soul={selectedIdx !== null ? images[selectedIdx] : null}
        onClose={() => setSelectedIdx(null)}
      />
    </div>
  );
}
