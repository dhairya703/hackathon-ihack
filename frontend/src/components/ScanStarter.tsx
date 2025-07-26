import { useEffect } from "react";

export default function ScanStarter() {
  useEffect(() => {
    const startScan = async () => {
      // Step 1: Prompt user for target and port
      const target = prompt("Enter target (e.g., localhost):");
      const port = prompt("Enter port (e.g., 8093):");

      if (!target || !port) {
        alert("Target and port are required.");
        return;
      }

      // Step 2: Construct API URL
      const url = `https://ssgs8vwv-8000.inc1.devtunnels.ms/api/scan/stream?target=${target}&port=${port}`;

      // Step 3: Start scan and listen for 'scan_complete'
      try {
        const response = await fetch(url);

        if (!response.body) {
          throw new Error("Stream not supported by the browser.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let fullData = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullData += chunk;

          if (fullData.includes("scan_complete")) {
            console.log("hello");
            break;
          }
        }
      } catch (error) {
        console.error("Error during scan:", error);
      }
    };

    // Auto-run scan on component mount
    startScan();
  }, []);

  return (
    <div>
      <h2>Scanning network...</h2>
      <p>Please wait for scan to complete.</p>
    </div>
  );
}
