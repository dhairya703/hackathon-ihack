// import { useEffect, useState } from "react";
// import "./TopVulnerabilities.css";

// interface Vulnerability {
//   id: string;
//   cvss: number;
//   is_exploit?: boolean | string;
//   type?: string;
// }

// export default function TopVulnerabilities() {
//   const [topVulns, setTopVulns] = useState<{ id: string; count: number }[]>([]);

//   useEffect(() => {
//     fetch("http://ssgs8vwv-8000.inc1.devtunnels.ms/analyze/vulnerabilitesjson")
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to load JSON");
//         return res.json();
//       })
//       .then((data: Vulnerability[]) => {
//         console.log("Loaded vulnerabilities:", data);

//         const countMap: Record<string, number> = {};

//         data.forEach((vuln) => {
//           if (!vuln?.id || vuln.cvss == null) return;

//           const isExploit = vuln.is_exploit === true || vuln.is_exploit === "true";
//           const cvss = parseFloat(String(vuln.cvss));

//           const qualifies = cvss === 9.8 || (cvss >= 9.8 && isExploit);
//           if (!qualifies) return;

//           const weight = vuln.type === "githubexploit" ? 0.5 : 1;

//           countMap[vuln.id] = (countMap[vuln.id] || 0) + weight;
//         });

//         const sorted = Object.entries(countMap)
//           .map(([id, count]) => ({ id, count }))
//           .sort((a, b) => b.count - a.count)
//           .slice(0, 5);

//         console.log("Top Vulnerabilities (weighted):", sorted);
//         setTopVulns(sorted);
//       })
//       .catch((err) => {
//         console.error("Error fetching or processing vulnerabilities:", err);
//       });
//   }, []);

//   return (
//     <table className="custom-table">
//       <thead>
//         <tr>
//           <th>Top Vulnerabilities</th>
//           <th>Score</th>
//         </tr>
//       </thead>
//       <tbody>
//         {topVulns.length > 0 ? (
//           topVulns.map((vuln, index) => (
//             <tr key={index}>
//               <td>{vuln.id}</td>
//               <td>{vuln.count.toFixed(1)}</td>
//             </tr>
//           ))
//         ) : (
//           <tr>
//             <td colSpan={2}>No vulnerabilities matched the criteria</td>
//           </tr>
//         )}
//       </tbody>
//     </table>
//   );
// }
import { useEffect, useState } from "react";
import "flowbite"; // ensure Flowbite CSS is loaded

interface Vulnerability {
  id: string;
  cvss: number;
  is_exploit?: boolean | string;
  type?: string;
}

export default function TopVulnerabilities() {
  const [topVulns, setTopVulns] = useState<{ id: string; count: number }[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/analyze/vulnerabilitesjson")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load JSON");
        return res.json();
      })
      .then((data: Vulnerability[]) => {
        const countMap: Record<string, number> = {};

        data.forEach((vuln) => {
          if (!vuln?.id || vuln.cvss == null) return;
          const isExploit = vuln.is_exploit === true || vuln.is_exploit === "true";
          const cvss = parseFloat(String(vuln.cvss));
          const qualifies = cvss === 9.8 || (cvss >= 9.8 && isExploit);
          if (!qualifies) return;

          const weight = vuln.type === "githubexploit" ? 0.5 : 1;
          countMap[vuln.id] = (countMap[vuln.id] || 0) + weight;
        });

        const sorted = Object.entries(countMap)
          .map(([id, count]) => ({ id, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopVulns(sorted);
      })
      .catch((err) => console.error("Error fetching vulnerabilities:", err));
  }, []);

  return (
    <div className="overflow-x-auto rounded-lg shadow-md mt-4">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Top Vulnerability
            </th>
            <th scope="col" className="px-6 py-3">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {topVulns.length > 0 ? (
            topVulns.map((vuln, index) => (
              <tr
                key={index}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {vuln.id}
                </td>
                <td className="px-6 py-4">{vuln.count.toFixed(1)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="px-6 py-4 text-center">
                No vulnerabilities matched the criteria
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
