// // App.jsx
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "./dashboard";
// import SeverityPage from "./components/SeverityPage";
// import CompletedExploits from "./components/CompletedExploits";
// import { ExploitProvider } from "./context/ExploitContext";

// function App() {
//   return (
//     <ExploitProvider>
//       <Router>
//         <div className="kuchbhi">
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/severity/:level" element={<SeverityPage />} />
//             <Route path="/completed" element={<CompletedExploits />} />
//           </Routes>
//         </div>
//       </Router>
//     </ExploitProvider>
//   );
// }

// export default App;
// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./dashboard";
import SeverityPage from "./components/SeverityPage";
import CompletedExploits from "./components/CompletedExploits";
import { ExploitProvider } from "./context/ExploitContext";
import ScanProgress from "./ScanProgress";

// import ScanPage from "./pages/ScanPage";
import Scan from "./Scan";
function App() {
  return (
    
    <ExploitProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/severity/:level" element={<SeverityPage />} />
          <Route path="/completed" element={<CompletedExploits />} />
          <Route path="/scan" element={<Scan />} />
                  <Route path="/scan-progress" element={<ScanProgress />} />


        </Routes>
      </Router>
    </ExploitProvider>
  );
}

export default App;
