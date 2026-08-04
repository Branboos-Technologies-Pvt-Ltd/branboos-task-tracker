import { ImageResponse } from "next/og";

// App icon (favicon) — the BranBoos rocket badge. Next.js serves this at /icon.
// Using ImageResponse means we render the same SVG design at any resolution
// the browser or OS asks for.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #EF4444 0%, #F97316 25%, #FACC15 50%, #22D3EE 75%, #3B82F6 100%)",
          borderRadius: 14,
          color: "white",
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: -2,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        B
      </div>
    ),
    { ...size },
  );
}
