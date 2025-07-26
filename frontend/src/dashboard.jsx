
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./dashcss.css";
import TopVulnerabilities from "./components/TopVulnerabilities";
import VulnerabilityChart from "./components/VulnerabilityChart";
import TopOS from "./components/TopOS";
import TopServices from "./components/TopServices";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

const CVSS_COLORS = [
  { range: [9, 10], color: "#e74c3c", label: "Critical" },
  { range: [7, 8.9], color: "#e67e22", label: "High" },
  { range: [4, 6.9], color: "#f1c40f", label: "Medium" },
  { range: [0.1, 3.9], color: "#2ecc71", label: "Low" },
  { range: [0, 0], color: "#95a5a6", label: "Informational" },
];

const calculatePriorityScore = (exploit) => {
  const { cvss = 0, is_exploit = false, severity = "" } = exploit;
  let score = 0;
  if (is_exploit) score += 30;
  score += Math.min(cvss, 10) * 5;
  switch (severity.toLowerCase()) {
    case "critical": score += 20; break;
    case "high": score += 15; break;
    case "medium": score += 10; break;
    case "low": score += 5; break;
    case "informational": score += 1; break;
    default: break;
  }
  return score;
};

export default function Dashboard() {
  const [exploits, setExploits] = useState([]);
    const [xmlInput, setXmlInput] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);
const [showXmlInput, setShowXmlInput] = useState(false);
const [submitted, setSubmitted] = useState(false);
const [analyzing, setAnalyzing] = useState(false);
const [finalMessage, setFinalMessage] = useState("");

  // const navigate = useNavigate();
  const navigate = useNavigate();
  const handleUpload = () => {
  setShowXmlInput((prev) => !prev); // toggle visibility
};
// const handleXmlSubmit = async () => {
//   if (!xmlInput.trim()) {
//     alert("Please paste valid XML.");
//     return;
//   }

//   try {
//     const response = await fetch("http://127.0.0.1:8000/api/upload-xml-raw", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/xml",
//       },
//       body: xmlInput,
//     });

//     if (response.ok) {
//       alert("Successfully submitted (200)");
//       setXmlInput("");         // clear textarea
//       setShowXmlInput(false);  // hide input box
//       setError(null);
//     } else {
//       const data = await response.json();
//       setError(data.error || "Upload failed.");
//     }
//   } catch (err) {
//     setError("Network error. See console for details.");
//     console.error(err);
//   }
// };

const handleXmlSubmit = async () => {
  if (!xmlInput.trim()) {
    alert("Please paste valid XML.");
    return;
  }

  setAnalyzing(true);
  setError(null);
  setFinalMessage("Uploading and analyzing...");

  try {
    // 1. Upload raw XML
    const uploadResponse = await fetch("http://127.0.0.1:8000/api/upload-xml-raw", {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
      },
      body: xmlInput,
    });

    if (!uploadResponse.ok) {
      const errData = await uploadResponse.json();
      setError(errData.error || "Upload failed.");
      setAnalyzing(false);
      return;
    }

    setFinalMessage("📤 XML uploaded successfully. Generating report...");

    // 2. Fetch vulnerability report (streaming)
    const reportResponse = await fetch("http://127.0.0.1:8000/vulnerability-report");
    const reader = reportResponse.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      setFinalMessage(chunk); // show progressive update
    }

    // 3. Run /analyze/fromfile
    setFinalMessage("📊 Report ready. Running analysis...");
    const analysisRes = await fetch("http://127.0.0.1:8000/analyze/fromfile", {
      method: "POST",
    });

    const analysisJson = await analysisRes.json();
    setFinalMessage(analysisJson.message || "✅ Analysis complete.");

    // 4. Finish
    setXmlInput("");
    setShowXmlInput(false);
    setAnalyzing(false);
          window.location.reload();

  } catch (err) {
    setError("❌ Network error or invalid response.");
    console.error(err);
    setAnalyzing(false);
  }
};

 const handleStartScan = useCallback(() => {
  let target = prompt("Enter target (default: localhost):");
  let port = prompt("Enter port (optional):");

  // Use default if target is empty
  if (!target) target = "localhost";

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append("target", target);
  if (port) {
    queryParams.append("port", port);
  }

  navigate(`/scan-progress?${queryParams.toString()}`);
}, [navigate]);

  useEffect(() => {
    fetch("http://localhost:8000/analyze/result1")
      .then((res) => res.json())
      .then((json) => {
        const enriched = json.map((item, i) => ({
          ...item,
          id: i,
          priorityScore: calculatePriorityScore(item),
          completed: false,
        }));
        setExploits(enriched);
      })
      .catch(console.error);
  }, []);

  const getSeverityLabel = (cvss) => {
    for (const entry of CVSS_COLORS) {
      const [min, max] = entry.range;
      if (cvss >= min && cvss <= max) return entry.label;
    }
    return "Informational";
  };

  // Severity distribution calculation
  const severityBuckets = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
    Informational: 0,
  };

  exploits.forEach((item) => {
    if (!item.completed) {
      const label = getSeverityLabel(parseFloat(item.cvss) || 0);
      severityBuckets[label]++;
    }
  });

  const severityData = CVSS_COLORS.map((entry) => ({
    name: entry.label,
    count: severityBuckets[entry.label],
    color: entry.color,
  }));

  // Priority score distribution
  const priorityCounts = {};
  exploits.forEach((item) => {
    const score = Math.floor(item.priorityScore);
    if (!priorityCounts[score]) priorityCounts[score] = 0;
    priorityCounts[score]++;
  });

  const priorityData = Object.entries(priorityCounts)
    .map(([score, count]) => ({ score: parseInt(score), count }))
    .sort((a, b) => a.score - b.score);

  const handleSeverityClick = (level) => {
    navigate(`/severity/${level.toLowerCase()}`);
  };

  return (
   
         <div className="dashboard min-h-screen">

<header className="dashboard-header">
  <div className="header-left">
 <button className="start-scan-btn" onClick={() => setShowXmlInput(true)}>
  Upload Xml
</button>

  </div>

  <div className="header-center">
    <h1 className="dashboard-title">VulnPatch AI</h1>
  </div>

  <div className="header-right">
    <button className="start-scan-btn" onClick={handleStartScan}>
     Start Scan
    </button> 
  </div>
</header>
{showXmlInput && (
  <div style={{ padding: "10px 20px" }}>
    <textarea
      rows={10}
      placeholder="Paste your XML content here..."
      value={xmlInput}
      onChange={(e) => setXmlInput(e.target.value)}
      style={{ width: "100%", padding: "10px", fontFamily: "monospace" }}
    />
    <button
      onClick={handleXmlSubmit}
      className="start-scan-btn"
      style={{ marginTop: "10px" }}
    >
      Submit XML
    </button>
    {error && <div style={{ color: "red" }}>{error}</div>}
  </div>
)}
{analyzing && (
  <div style={{ marginTop: "10px", color: "#444" }}>
    <pre>{finalMessage}</pre>
  </div>
)}

      <div className="severity-cards">
        {severityData.map((item, index) => (
          <div
            key={index}
            className="severity-card"
            onClick={() => handleSeverityClick(item.name)}
            style={{
              color: item.color,
              border: "none",
              background: "#fff",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div className="severity-cards_text">
              <span className="card-value">{item.count}</span>
              <span className="card-title text-sm">{item.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
            <div className="container">

       <div className="container1">
          <VulnerabilityChart />

    
        
          <div className="chart-box">
  <h2 className="chart-title">Severity Distribution (Based on CVSS)</h2>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={severityData}
        dataKey="count"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
      >
        {severityData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          fontSize: "14px",
        }}
      />
      <Legend
        iconType="circle"
        layout="horizontal"
        align="center"
        verticalAlign="bottom"
      />
    </PieChart>
  </ResponsiveContainer>
</div>


          {/* Line Chart - Priority Score */}
          <div className="chart-box bg-white p-6 rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Priority Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={priorityData}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
          <XAxis
            dataKey="score"
            tick={{ fill: "#4b5563", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#4b5563", fontSize: 12 }}
            axisLine={{ stroke: "#d1d5db" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            labelStyle={{ color: "#6b7280" }}
            cursor={{ fill: "#f9fafb" }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ color: "#374151" }} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 5, fill: "#3b82f6" }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
        </div>
        <div className="container1">
          <div className="chart-box"><TopVulnerabilities /></div>
          <div className="chart-box"><TopOS /></div>
          <div className="chart-box"><TopServices /></div>
        </div>

       
      </div>
    </div>
  );
}
