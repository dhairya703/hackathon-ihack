import React, { useState, useMemo } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./FilteredVulnTable.css";

interface Vulnerability {
  type: string;
  id: string;
  is_exploit: boolean;
  exploit_type: string;
  cvss: number;
  severity: string;
  description: string;
  remediation: string;
}

interface Props {
  data: Vulnerability[];
}

export default function FilteredVulnTable({ data }: Props) {
  const [exploitType, setExploitType] = useState("");
  const [onlyExploitable, setOnlyExploitable] = useState(false);
  const [hasRemediation, setHasRemediation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    return data
      .filter((item) =>
        exploitType ? item.exploit_type === exploitType : true
      )
      .filter((item) => (onlyExploitable ? item.is_exploit === true : true))
      .filter((item) =>
        hasRemediation ? item.remediation && item.remediation.trim() !== "" : true
      )
      .filter((item) =>
        searchTerm
          ? item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
          : true
      )
      .sort((a, b) =>
        a.exploit_type === "cve" && b.exploit_type !== "cve"
          ? -1
          : a.exploit_type !== "cve" && b.exploit_type === "cve"
          ? 1
          : 0
      );
  }, [data, exploitType, onlyExploitable, hasRemediation, searchTerm]);

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.text("Filtered Vulnerability Report", 14, 15);
    (doc as any).autoTable({
      head: [["ID", "Type", "Exploit Type", "Severity", "CVSS", "Remediation"]],
      body: filteredData.map((item) => [
        item.id,
        item.type,
        item.exploit_type,
        item.severity,
        item.cvss,
        item.remediation || "N/A",
      ]),
      startY: 20,
    });
    doc.save("vulnerability_report.pdf");
  };

  const exploitTypeOptions = Array.from(new Set(data.map((d) => d.exploit_type)));

  return (
    <div className="vuln-table-container">
      <div className="filters">
        <select
          value={exploitType}
          onChange={(e) => setExploitType(e.target.value)}
        >
          <option value="">All Exploit Types</option>
          {exploitTypeOptions.map((et) => (
            <option key={et} value={et}>
              {et}
            </option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            checked={onlyExploitable}
            onChange={(e) => setOnlyExploitable(e.target.checked)}
          />
          Only Exploitable
        </label>

        <label>
          <input
            type="checkbox"
            checked={hasRemediation}
            onChange={(e) => setHasRemediation(e.target.checked)}
          />
          Has Remediation
        </label>

        <input
          type="text"
          placeholder="Search ID or Description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={handleDownload}>Download PDF</button>
      </div>

      <table className="vuln-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Exploit Type</th>
            <th>Severity</th>
            <th>CVSS</th>
            <th>Description</th>
            <th>Remediation</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((vuln) => (
            <tr key={vuln.id}>
              <td>{vuln.id}</td>
              <td>{vuln.type}</td>
              <td>{vuln.exploit_type}</td>
              <td>{vuln.severity}</td>
              <td>{vuln.cvss}</td>
              <td>{vuln.description}</td>
              <td>{vuln.remediation || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
