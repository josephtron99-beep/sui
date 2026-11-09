import { ImageResponse } from "next/og";
import { MARK_PATH, WORDMARK_PATH } from "@/components/ui/logo-paths";

export const alt = "Suinance · The validator program for Sui.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#ffffff",
          backgroundImage: "linear-gradient(#efefef 2px, transparent 2px), linear-gradient(90deg, #efefef 2px, transparent 2px)",
          backgroundSize: "48px 48px",
          color: "#111",
        }}
      >
        <svg width="360" height="110" viewBox="0 0 3895 1191">
          <path d={MARK_PATH} fill="#111" />
          <path d={WORDMARK_PATH} fill="#111" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 92, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>
          <span>Validators that</span>
          <span style={{ display: "flex", background: "#ffe11a", padding: "4px 16px", marginTop: 12, alignSelf: "flex-start" }}>keep Sui strong.</span>
        </div>
        <span style={{ fontSize: 28, color: "#5b5b5b" }}>Suinance Validator Program · public criteria · checked every epoch</span>
      </div>
    ),
    size,
  );
}
