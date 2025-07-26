// import { useEffect, useState } from "react";
// import "./TopOS.css";

// interface OSData {
//   name: string;
//   count: number;
// }

// export default function TopOS() {
//   const [topOS, setTopOS] = useState<OSData[]>([]);

//   useEffect(() => {
//     fetch("https://ssgs8vwv-8000.inc1.devtunnels.ms/analyze/map")
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to load report.json");
//         return res.json();
//       })
//       .then((json) => {
//         const osMap: Record<string, number> = {};
//         (json.os || []).forEach((os: string) => {
//           osMap[os] = (osMap[os] || 0) + 1;
//         });

//         const topOSList = Object.entries(osMap)
//           .map(([name, count]) => ({ name, count }))
//           .sort((a, b) => b.count - a.count)
//           .slice(0, 5);

//         setTopOS(topOSList);
//       })
//       .catch((err) => {
//         console.error("Error loading OS data:", err);
//       });
//   }, []);

//   return (

//       <table className="custom-table">
//         <thead>
//           <tr>
//             <th>Top 5 OS</th>
//             <th>Count</th>
//           </tr>
//         </thead>
//         <tbody>
//           {topOS.length > 0 ? (
//             topOS.map((os, idx) => (
//               <tr key={idx}>
//                 <td>{os.name}</td>
//                 <td>{os.count}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={2}>No OS data available</td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//   );
// }
import { useEffect, useState } from "react";
import "flowbite"; // Ensure Flowbite is included

interface OSData {
  name: string;
  count: number;
}

export default function TopOS() {
  const [topOS, setTopOS] = useState<OSData[]>([]);

  useEffect(() => {
    fetch("https://localhost:8000/analyze/map")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load report.json");
        return res.json();
      })
      .then((json) => {
        const osMap: Record<string, number> = {};
        (json.os || []).forEach((os: string) => {
          osMap[os] = (osMap[os] || 0) + 1;
        });

        const topOSList = Object.entries(osMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopOS(topOSList);
      })
      .catch((err) => {
        console.error("Error loading OS data:", err);
      });
  }, []);

  return (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Top 5 OS
            </th>
            <th scope="col" className="px-6 py-3">
              Count
            </th>
          </tr>
        </thead>
        <tbody>
          {topOS.length > 0 ? (
            topOS.map((os, idx) => (
              <tr
                key={idx}
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {os.name}
                </td>
                <td className="px-6 py-4">{os.count}</td>
              </tr>
            ))
          ) : (
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td colSpan={2} className="px-6 py-4 text-center">
                No OS data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
