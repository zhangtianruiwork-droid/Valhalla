import { Link } from "react-router";
import { siteConfig, infoPageConfig } from "@/config";
import MatrixRain from "@/components/MatrixRain";

export default function Info() {
  const cfg = infoPageConfig;
  if (
    !cfg.title &&
    cfg.paragraphs.length === 0 &&
    cfg.contactEntries.length === 0
  ) {
    return null;
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        background: "#050505",
        color: "#00ff41",
        overflowX: "hidden",
      }}
    >
      <MatrixRain />

      {/* Top-left Logo */}
      {siteConfig.brandName && (
        <Link
          to="/"
          style={{
            position: "fixed",
            top: "24px",
            left: "32px",
            fontFamily: "'Courier New', monospace",
            fontSize: "16px",
            fontWeight: 700,
            color: "#00ff41",
            letterSpacing: "0.12em",
            textDecoration: "none",
            transition: "opacity 0.3s ease",
            zIndex: 10,
            textShadow: "0 0 12px rgba(0, 255, 65, 0.6)",
            animation: "matrix-pulse 3s ease-in-out infinite",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          &lt;{siteConfig.brandName}/&gt;
        </Link>
      )}

      {/* Top-right Back */}
      {cfg.backLinkLabel && (
        <Link
          to="/"
          style={{
            position: "fixed",
            top: "24px",
            right: "32px",
            fontFamily: "'Courier New', monospace",
            fontSize: "13px",
            fontWeight: 400,
            color: "#00ff41",
            textDecoration: "none",
            transition: "opacity 0.3s ease",
            zIndex: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            textShadow: "0 0 8px rgba(0, 255, 65, 0.4)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.6")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          [{cfg.backLinkLabel}]
        </Link>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)",
          gap: "64px",
          maxWidth: "1720px",
          margin: "0 auto",
          padding: "160px 48px 80px",
          boxSizing: "border-box",
          alignItems: "start",
          fontFamily: "'Courier New', monospace",
        }}
      >
        {/* LEFT — Bio */}
        <div>
          {cfg.eyebrow && (
            <p
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "11px",
                fontWeight: 400,
                color: "#00ff41",
                opacity: 0.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                margin: "0 0 28px 0",
              }}
            >
              {cfg.eyebrow}
            </p>
          )}

          {cfg.title && (
            <h1
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "clamp(28px, 3.2vw, 48px)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "0.02em",
                margin: "0 0 40px 0",
                textShadow: "0 0 16px rgba(0, 255, 65, 0.3)",
                whiteSpace: "pre-line",
              }}
            >
              {cfg.title}
            </h1>
          )}

          {cfg.paragraphs.length > 0 && (
            <div
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: "15px",
                lineHeight: 1.7,
                color: "rgba(0, 255, 65, 0.8)",
              }}
            >
              {cfg.paragraphs.map((p, i) => (
                <p key={i} style={{ margin: "0 0 20px 0", paddingLeft: i % 2 === 0 ? 0 : 16, borderLeft: i % 2 === 0 ? "none" : "2px solid rgba(0, 255, 65, 0.15)" }}>
                  {p}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT — Contact / Status */}
        {(cfg.contactLabel ||
          cfg.contactEntries.length > 0 ||
          siteConfig.copyright) && (
          <div
            style={{
              alignSelf: "center",
              background: "rgba(0, 255, 65, 0.03)",
              border: "1px solid rgba(0, 255, 65, 0.15)",
              padding: "32px",
              borderRadius: "4px",
            }}
          >
            {cfg.contactLabel && (
              <p
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: "11px",
                  fontWeight: 400,
                  color: "#00ff41",
                  opacity: 0.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  margin: "0 0 24px 0",
                  borderBottom: "1px solid rgba(0, 255, 65, 0.2)",
                  paddingBottom: "8px",
                }}
              >
                {cfg.contactLabel}
              </p>
            )}

            {cfg.contactEntries.length > 0 && (
              <dl
                style={{
                  display: "grid",
                  gridTemplateColumns: "130px 1fr",
                  rowGap: "14px",
                  columnGap: "20px",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                {cfg.contactEntries.map((entry, i) => (
                  <ContactRow key={i} entry={entry} />
                ))}
              </dl>
            )}

            {siteConfig.copyright && (
              <div
                style={{
                  marginTop: "48px",
                  paddingTop: "24px",
                  borderTop: "1px solid rgba(0, 255, 65, 0.15)",
                  fontFamily: "'Courier New', monospace",
                  fontSize: "11px",
                  color: "#00ff41",
                  opacity: 0.35,
                  letterSpacing: "0.08em",
                }}
              >
                {siteConfig.copyright}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Decorative corners */}
      <div style={{ position: "fixed", top: 20, left: 20, width: 30, height: 30, borderTop: "1px solid rgba(0, 255, 65, 0.2)", borderLeft: "1px solid rgba(0, 255, 65, 0.2)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 20, right: 20, width: 30, height: 30, borderTop: "1px solid rgba(0, 255, 65, 0.2)", borderRight: "1px solid rgba(0, 255, 65, 0.2)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: 20, left: 20, width: 30, height: 30, borderBottom: "1px solid rgba(0, 255, 65, 0.2)", borderLeft: "1px solid rgba(0, 255, 65, 0.2)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: 20, right: 20, width: 30, height: 30, borderBottom: "1px solid rgba(0, 255, 65, 0.2)", borderRight: "1px solid rgba(0, 255, 65, 0.2)", pointerEvents: "none" }} />
    </div>
  );
}

function ContactRow({
  entry,
}: {
  entry: { label: string; value: string; href?: string };
}) {
  const valueLines = entry.value.split("\n");
  const content =
    valueLines.length > 1
      ? valueLines.map((line, i) => (
          <span key={i}>
            {line}
            {i < valueLines.length - 1 && <br />}
          </span>
        ))
      : entry.value;

  return (
    <>
      <dt style={{ opacity: 0.5, color: "#00ff41" }}>{entry.label}</dt>
      <dd
        style={{
          margin: 0,
          lineHeight: valueLines.length > 1 ? 1.6 : 1.4,
          color: "rgba(0, 255, 65, 0.85)",
        }}
      >
        {entry.href ? (
          <a
            href={entry.href}
            target={entry.href.startsWith("http") ? "_blank" : undefined}
            rel={entry.href.startsWith("http") ? "noreferrer" : undefined}
            style={{
              color: "#00ff41",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            {content}
          </a>
        ) : (
          content
        )}
      </dd>
    </>
  );
}
