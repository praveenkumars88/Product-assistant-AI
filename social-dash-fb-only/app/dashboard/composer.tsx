"use client";

import { useState } from "react";

type Page = { id: string; name: string };

export default function Composer({ pages }: { pages: Page[] }) {
  const [pageId, setPageId] = useState(pages[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId,
          message,
          imageUrl: imageUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setStatus(`Published. Post ID: ${data.postId}`);
      setMessage("");
      setImageUrl("");
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (pages.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <select value={pageId} onChange={(e) => setPageId(e.target.value)}>
        {pages.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <textarea
        placeholder="What do you want to post?"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        style={{ padding: 8, fontFamily: "inherit" }}
      />

      <input
        type="text"
        placeholder="Image URL (optional, must be publicly reachable)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        style={{ padding: 8 }}
      />

      <button
        onClick={handlePublish}
        disabled={loading || (!message && !imageUrl)}
        style={{
          padding: "10px 16px",
          background: "#1877F2",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        {loading ? "Publishing..." : "Publish now"}
      </button>

      {status && (
        <p style={{ fontSize: 14, color: status.startsWith("Error") ? "#b00020" : "#1a7f37" }}>
          {status}
        </p>
      )}
    </div>
  );
}
