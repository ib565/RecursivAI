import React, { useEffect, useState } from "react";

export default function PreviewNewsEmail() {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/newsletter-html");
        if (!res.ok) throw new Error("Failed to load preview");
        const markup = await res.text();
        setHtml(markup);
      } catch (e) {
        setError("Failed to load preview");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (error) return <div style={{ color: 'red', padding: 24 }}>{error}</div>;

  return (
    <div style={{ padding: 0 }}>
      <iframe
        title="News Email Preview"
        style={{ width: "100%", height: "100vh", border: "none" }}
        srcDoc={html}
      />
    </div>
  );
}


