import { ImageResponse } from "next/og";

export const alt = "Fast Dog Coding — Principal-Level Architecture";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#111111",
          color: "#F5F5F5",
          fontFamily: "ui-monospace, monospace",
        }}
      >
        {/* Content panel */}
        <div
          style={{
            display: "flex",
            flex: 1,
            margin: 48,
            border: "1px solid #2D2D2D",
            borderRadius: 8,
            backgroundColor: "#1A1A1A",
            padding: "56px 64px",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Mark + site name */}
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: 40, fontWeight: 700 }}>
              <span>F</span>
              <span style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span>D</span>
                <span
                  style={{
                    width: 28,
                    height: 5,
                    backgroundColor: "#BE9541",
                    borderRadius: 2,
                    marginTop: 4,
                  }}
                />
              </span>
              <span>C</span>
            </div>
            <span style={{ fontSize: 28, color: "#A3A3A3" }}>Fast Dog Coding</span>
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
            <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Principal-Level Architecture.
            </div>
            <div style={{ fontSize: 36, fontWeight: 600, color: "#A3A3A3", lineHeight: 1.2 }}>
              Enterprise-Grade Execution.
            </div>
          </div>

          {/* Footer URL */}
          <div style={{ fontSize: 22, color: "#A3A3A3" }}>fastdogcoding.com</div>
        </div>

        {/* Architecture diagram accent — right rail */}
        <div
          style={{
            display: "flex",
            width: 280,
            margin: "48px 48px 48px 0",
            border: "1px solid #2D2D2D",
            borderRadius: 8,
            backgroundColor: "#111111",
            padding: 32,
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, border: "2px solid #BE9541", borderRadius: 2 }} />
            <div style={{ flex: 1, height: 2, backgroundColor: "#BE9541" }} />
            <div style={{ width: 12, height: 12, backgroundColor: "#2D2D2D" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 24 }}>
            <div style={{ width: 2, height: 40, backgroundColor: "#2D2D2D" }} />
            <div style={{ flex: 1, height: 2, backgroundColor: "#2D2D2D" }} />
            <div style={{ width: 12, height: 12, border: "2px solid #A3A3A3", borderRadius: 2 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingLeft: 24 }}>
            <div style={{ width: 2, height: 40, backgroundColor: "#2D2D2D" }} />
            <div style={{ flex: 1, height: 2, backgroundColor: "#2D2D2D" }} />
            <div style={{ width: 12, height: 12, backgroundColor: "#2D2D2D" }} />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
