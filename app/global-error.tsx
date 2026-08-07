"use client";

import { useEffect } from "react";

// Last-resort boundary for errors thrown by the root layout itself. It replaces
// the entire document, so it renders its own <html>/<body> and uses inline styles
// only (Tailwind and providers are not guaranteed to be mounted here).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#fff",
          color: "#0a0a0a",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: "24rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: "0 0 0.5rem" }}>
            Terjadi kesalahan
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#666", margin: "0 0 1.25rem" }}>
            Maaf, terjadi kendala tak terduga. Silakan muat ulang halaman.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              cursor: "pointer",
              borderRadius: "0.5rem",
              border: "none",
              background: "#0a0a0a",
              color: "#fff",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Coba lagi
          </button>
        </div>
      </body>
    </html>
  );
}
