import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ScanProgress() {
  const query = useQuery();
  const target = query.get("target");
  const port = query.get("port");

  const [logs, setLogs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [finalMessage, setFinalMessage] = useState("");

  useEffect(() => {
    const eventSource = new EventSource(`http://localhost:8000/api/scan/stream?target=${target}&port=${port}`);

    eventSource.onmessage = async (event) => {
      const message = event.data;
      setLogs((prev) => [...prev, message]);

      if (message === "SCAN_COMPLETE") {
        eventSource.close();
        setAnalyzing(true);

        const res1 = await fetch("http://localhost:8000/vulnerability-report");
        const text1 = await res1.text();
        setLogs((prev) => [...prev, ...text1.split("\n")]);

const res2 = await fetch("http://localhost:8000/analyze/fromfile", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({})  // You can send an empty object or actual data if needed
});
        const json = await res2.json();
        setFinalMessage(json.message);
        setAnalyzing(false);
      }
    };

    return () => eventSource.close();
  }, [target, port]);

  return (
    <div className="dashboard min-h-screen">
      <header className="dashboard-header">
        <div className="header-center"><h1 className="dashboard-title">VulnPatch AI</h1></div>
        <div className="header-right"><span>🛠️ Scanning {target}:{port}</span></div>
      </header>

      <div className="p-6 bg-white m-4 rounded shadow overflow-y-auto max-h-[70vh] font-mono text-sm">
        {logs.map((log, idx) => (
          <div key={idx}>{log}</div>
        ))}
      </div>

      {analyzing && <p className="text-blue-500 font-semibold ml-4">🔍 Analyzing results...</p>}
      {finalMessage && <p className="text-green-600 font-semibold ml-4 mt-2">✅ {finalMessage}</p>}
    </div>
  );
}
