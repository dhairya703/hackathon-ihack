#  Vulnerability Patch Management using LLMs

A full-stack, AI-powered vulnerability patch management system that scans networks using **Nmap**, analyzes vulnerabilities using **CVE databases**, and generates human-readable patch recommendations using **Large Language Models (LLMs)** like **Gemini**.  
Built with a **FastAPI** backend and a **React + Vite** frontend.

---

## 🚀 Features

-  **Nmap Scan Integration**: Automatically runs network and service scans.
-  **Real-time CVE Analysis**: Parses and analyzes CVE/exploit data using the **Vulners API**.
-  **LLM Integration**: Uses **Gemini** to generate clear patch recommendations.
-  **Visual Dashboards**: View CVSS severity distribution, priority levels, and exploit types.
-  **Severity Filtering**: Filter vulnerabilities and exploits by severity or type.
-  **Track Fixed Issues**: View resolved vulnerabilities separately.
-  **PDF Report Export**: Download full vulnerability reports as PDFs.
-  **REST API Access**: Expose all core functionalities via RESTful APIs.

---

##  RAG Architecture (Retrieval-Augmented Generation)

This system follows a **RAG (Retrieval-Augmented Generation)** model:

1. **Retrieve**: Extract vulnerability data (CPEs, versions) from Nmap → Query Vulners API for CVE & exploit details.  
2. **Generate**: Send the retrieved context to Gemini to generate tailored patch recommendations.  
3. **Deliver**: Display results in an interactive frontend with visual insights and reporting.

#CVE API used for collecting information of CVE Vulnerabilities and Passing it to LLM:
https://services.nvd.nist.gov/rest/json/cves/2.0?cveId={cve_id}

.env:
NVD_API_KEY=""
GEMINI_API_KEY=""
GEMINI_URL = ""
DEBUG=True

---

## ⚙️ How to Run

###  Backend (FastAPI)

```bash
# Clone the repository
git clone https://github.com/dhairya703/hackathon-ihack
cd hackathon-ihack

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload

The backend will be running at http://localhost:8000 

###  Frontend
```bash
# Navigate to the frontend directory
cd frontend

# Install npm packages
npm install
npm install jspdf

# Start the development server
npm run dev
The frontend will be running at http://localhost:5173 

| Method   | Endpoint                      | Description                           |
| -------- | ----------------------------- | ------------------------------------- |
| GET      | `/`                           | Health check                          |
| GET      | `/vulnerability-report`       | Generate and download PDF report      |
| POST     | `/analyze`                    | Analyze vulnerabilities               |
| POST     | `/analyze/fromfile`           | Analyze from existing parsed file     |
| GET      | `/analyze/map`                | Get mapping data (LLM input context)  |
| GET      | `/analyze/result1`            | Get intermediate result JSON 1        |
| GET      | `/analyze/result2`            | Get intermediate result JSON 2        |
| GET      | `/analyze/vulnerabilitesjson` | Get all JSON-based vulnerability data |
| GET      | `/analyze/vulnerabilitesxml`  | Get all XML-based vulnerability data  |
| POST     | `/xml-raw`                    | Upload raw Nmap XML for processing    |
| GET/POST | `/grouping/...`               | Filter vulnerabilities by severity    |
| GET      | `/scan/stream`                | Get scan progress time and percentage |




#Vulner API to collect information:
https://vulners.com/api/v3/search/id/?id=

