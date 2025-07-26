
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./severitycss.css";
import "flowbite";

export default function SeverityPage() {
  const { level } = useParams();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [completedExploits, setCompletedExploits] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState("cvss");
  const [search, setSearch] = useState("");

  const storageKey = `completed_${level.toLowerCase()}`;

  const getSeverityWeight = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical": return 40;
      case "high": return 30;
      case "medium": return 20;
      case "low": return 10;
      default: return 0;
    }
  };

  const calculatePriorityScore = (item) => {
    const cvss = parseFloat(item.cvss) || 0;
    const exploitBonus = item.is_exploit === "true" ? 50 : 0;
    const severityWeight = getSeverityWeight(item.severity);
    return cvss * 10 + exploitBonus + severityWeight;
  };

  const determinePriorityLabel = (score) => {
    if (score >= 130) return "Critical";
    if (score >= 100) return "High";
    if (score >= 70) return "Medium";
    return "Low";
  };

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) setCompletedExploits(JSON.parse(stored));
  }, [level]);

  useEffect(() => {
    fetch("/result.json")
      .then((res) => res.json())
      .then(async (json) => {
        const filteredBySeverity = json.filter(
          (item) => item.severity.toLowerCase() === level.toLowerCase()
        );
        const enrichedWithDescriptions = await Promise.all(
          filteredBySeverity.map(async (item) => {
            let description = item.description || "-";
            if (item.id) {
              try {
                const res = await fetch(`https://vulners.com/api/v3/search/id/?id=${item.id}`);
                const data = await res.json();
                if (data.result === "OK") {
                  description = data.data.documents[item.id]?.description || description;
                }
              } catch (err) {
                console.error(`Error fetching description for ${item.id}`, err);
              }
            }

            const score = calculatePriorityScore(item);
            return {
              ...item,
              description,
              priorityScore: score,
              priority: determinePriorityLabel(score),
            };
          })
        );

        const sorted = [
          ...enrichedWithDescriptions.filter((item) => item.exploit_type === "cve"),
          ...enrichedWithDescriptions.filter((item) => item.exploit_type !== "cve"),
        ];

        setData(sorted);
      })
      .catch(console.error);
  }, [level]);

  useEffect(() => {
    let visibleData = showCompleted
      ? completedExploits
      : data.filter((item) => !completedExploits.find((c) => c.id === item.id));

    if (search.trim()) {
      const q = search.toLowerCase();
      visibleData = visibleData.filter((item) =>
        item.id?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.remediation?.toLowerCase().includes(q)
      );
    }

    const sortFn = {
      priority: (a, b) => b.priorityScore - a.priorityScore,
      cvss: (a, b) => parseFloat(b.cvss || 0) - parseFloat(a.cvss || 0),
      id: (a, b) => (a.id || "").localeCompare(b.id || ""),
      exploit_type: (a, b) => (a.exploit_type || "").localeCompare(b.exploit_type || ""),
    };

    visibleData.sort(sortFn[sortBy]);
    setFiltered(visibleData);
  }, [data, completedExploits, search, sortBy, showCompleted]);

  const handleMarkComplete = (exploit) => {
    const updated = [...completedExploits, exploit];
    setCompletedExploits(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleMarkActive = (exploitId) => {
    const updated = completedExploits.filter((e) => e.id !== exploitId);
    setCompletedExploits(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${level.toUpperCase()} Severity Exploits Report`, 14, 20);

    const tableColumn = ["ID", "Type", "CVSS", "Priority", "Description", "Remediation"];
    const shownData = showCompleted ? completedExploits : filtered;

    const tableRows = shownData.map((exploit) => [
      exploit.id || "-",
      exploit.exploit_type || "-",
      exploit.cvss || "-",
      exploit.priority || "-",
      exploit.description?.slice(0, 50) || "-",
      exploit.remediation?.slice(0, 50) || "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 8, cellWidth: "wrap" },
      headStyles: { fillColor: [52, 152, 219] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 15 },
        3: { cellWidth: 20 },
        4: { cellWidth: 60 },
        5: { cellWidth: 60 },
      },
    });

    doc.save(`${level}_${showCompleted ? "completed" : "active"}_report.pdf`);
  };

  return (
    <div className="critical-exploits">
      <div className="top-bar">
        <h1 className="dashboard-title">{level.toUpperCase()} VULNERABILITY</h1>
        <div>
          <button onClick={() => setShowCompleted(!showCompleted)} className="toggle-btn">
            {showCompleted ? "View Active Vulnerability" : "View Fixed Vulnerability"}
          </button>
          <button onClick={downloadPDF} className="start-scan-btn">Download PDF</button>
        </div>
      </div>

      {!showCompleted && (
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search by ID, Description, Remediation"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="cvss">Sort by CVSS</option>
            <option value="id">Sort by ID</option>
            <option value="exploit_type">Sort by Type</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      )}

      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th className="px-6 py-3">{showCompleted ? "🔁" : "✔"}</th>
            <th className="px-6 py-3">ID</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">CVSS</th>
            <th className="px-6 py-3">Priority</th>
            <th className="px-6 py-3">Description</th>
            <th className="px-6 py-3">Remediation</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((exploit, index) => (
            <tr
              key={index}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                {showCompleted ? (
                  <button
                    onClick={() => handleMarkActive(exploit.id)}
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    ↩
                  </button>
                ) : (
                  <input
                    type="checkbox"
                    onChange={() => handleMarkComplete(exploit)}
                    className="accent-blue-500"
                  />
                )}
              </td>
              <td className="px-6 py-4 text-gray-900 dark:text-white flex items-center gap-2">
                {exploit.id}
                <a
                  href={`https://vulners.com/api/v3/search/id/?id=${exploit.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline text-xs px-1 py-0.5 rounded hover:text-blue-700"
                  title="View on Vulners"
                >
                  🔍
                </a>
              </td>
              <td className="px-6 py-4">{exploit.exploit_type}</td>
              <td className="px-6 py-4">{exploit.cvss}</td>
              <td className="px-6 py-4">{exploit.priority}</td>
              <td className="px-6 py-4">{exploit.description}</td>
              <td className="px-6 py-4">{exploit.remediation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
