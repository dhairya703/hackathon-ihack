// import { useEffect, useState } from "react";
// import "./TopOS.css";

// interface ServiceData {
//   name: string;
//   count: number;
// }

// export default function TopServices() {
//   const [topServices, setTopServices] = useState<ServiceData[]>([]);

//   useEffect(() => {
//     fetch("http://ssgs8vwv-8000.inc1.devtunnels.ms/analyze/map")
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to load report.json");
//         return res.json();
//       })
//       .then((json) => {
//         const serviceMap: Record<string, number> = {};
//         (json.services || []).forEach((service: any) => {
//           const key = service.product || "unknown";
//           serviceMap[key] = (serviceMap[key] || 0) + 1;
//         });

//         const topServiceList = Object.entries(serviceMap)
//           .map(([name, count]) => ({ name, count }))
//           .sort((a, b) => b.count - a.count)
//           .slice(0, 5);

//         setTopServices(topServiceList);
//       })
//       .catch((err) => {
//         console.error("Error loading Service data:", err);
//       });
//   }, []);

//   return (
   
      
//       <table className="custom-table">
//         <thead>
//           <tr>
//             <th>Top 5 Services</th>
//             <th>Count</th>
//           </tr>
//         </thead>
//         <tbody>
//           {topServices.length > 0 ? (
//             topServices.map((service, idx) => (
//               <tr key={idx}>
//                 <td>{service.name}</td>
//                 <td>{service.count}</td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan={2}>No service data available</td>
//             </tr>
//           )}
//         </tbody>
//       </table>
 
//   );
// }
import { useEffect, useState } from "react";

interface ServiceData {
  name: string;
  count: number;
}

export default function TopServices() {
  const [topServices, setTopServices] = useState<ServiceData[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/analyze/map")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load report.json");
        return res.json();
      })
      .then((json) => {
        const serviceMap: Record<string, number> = {};
        (json.services || []).forEach((service: any) => {
          const key = service.product || "unknown";
          serviceMap[key] = (serviceMap[key] || 0) + 1;
        });

        const topServiceList = Object.entries(serviceMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopServices(topServiceList);
      })
      .catch((err) => {
        console.error("Error loading Service data:", err);
      });
  }, []);

  return (
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Service</th>
            <th scope="col" className="px-6 py-3">Count</th>
          </tr>
        </thead>
        <tbody>
          {topServices.length > 0 ? (
            topServices.map((service, idx) => (
              <tr key={idx} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {service.name}
                </td>
                <td className="px-6 py-4">{service.count}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="px-6 py-4">No service data available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
