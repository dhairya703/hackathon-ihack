import { useEffect } from "react";

export default function Scan() {
  useEffect(() => {
    const startScan = async () => {
      const target = prompt("Enter target (e.g., localhost):");
      const port = prompt("Enter port (e.g., 8093):");

      if (!target || !port) {
        alert("Both target and port are required.");
        return;
      }

      const url = `https://localhost:8000/api/scan/stream?target=${target}&port=${port}`;

      try {
        const response = await fetch(url);

        if (!response.body) {
          throw new Error("Streaming not supported.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;

          if (fullText.includes("scan_complete")) {
            console.log("hello");
            break;
          }
        }
      } catch (error) {
        console.error("Scan failed:", error);
      }
    };

    startScan();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Scanning in progress...</h2>
      <p>Check console for results.</p>
    </div>
  );
}
