import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// App icon (favicon). Renders the real BranBoos rocket badge PNG so it matches
// the brand exactly — no SVG approximation.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  const iconPath = join(process.cwd(), "public", "brand", "branboos-icon.png");
  const iconData = readFileSync(iconPath);
  const iconBase64 = `data:image/png;base64,${iconData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconBase64}
          alt="BranBoos"
          width={64}
          height={64}
          style={{ objectFit: "contain" }}
        />
      </div>
    ),
    { ...size },
  );
}
