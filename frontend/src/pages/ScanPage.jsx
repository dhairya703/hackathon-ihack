// src/pages/ScanPage.jsx
import React, { useState, useEffect } from "react";

export default function ScanPage() {
  const [log, setLog] = useState([]);
  const [scanComplete, setScanComplete] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource(
      "https://ssgs8vwv-8000.inc1.devtunnels.ms/api/scan/stream?target=localhost&port=8093"
    );

    eventSource.onmessage = (event) => {
      if (event.data.includes("scan_completed")) {
        setScanComplete(true);
        eventSource.close();
      } else {
        setLog((prev) => [...prev, event.data]);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "monospace", background: "#1e1e1e", color: "#0f0", height: "100vh" }}>
      <h2>🔍 Scanning in Progress...</h2>
      <div style={{ whiteSpace: "pre-wrap", maxHeight: "80vh", overflowY: "scroll", border: "1px solid #333", padding: "10px" }}>
        {log.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
      {scanComplete && <h3 style={{ color: "#00f900", marginTop: "20px" }}>✅ Scan Completed</h3>}
    </div>
  );
}
