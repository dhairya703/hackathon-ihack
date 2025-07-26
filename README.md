# 🔐 Vulnerability Patch Management using LLMs

A full-stack, AI-powered vulnerability patch management system that scans networks using Nmap, analyzes vulnerabilities using CVE databases, and generates human-readable patch recommendations using Large Language Models (LLMs) like **Gemini**. Built with **FastAPI** backend and a **React + Vite** frontend.

---

## 🚀 Features

- 🔍 **Nmap Scan Integration**: Automatically runs network & service scans.
- 📊 **Real-time CVE Analysis**: Parses and analyzes CVE/exploit data using Vulners API.
- 🤖 **LLM Integration**: Uses Gemini to generate clear patch recommendations.
- 📉 **Visual Dashboards**: CVSS severity distribution, priority levels, exploit types.
- 🧩 **Severity Filtering**: Filter vulnerabilities/exploits by severity or type.
- ✅ **Track Fixed Issues**: View resolved vulnerabilities separately.
- 🧾 **PDF Report Export**: Download full vulnerability reports as PDFs.
- 🌐 **REST API Access**: Expose all core functionalities as APIs.

---

## 🧠 RAG Architecture (Retrieval-Augmented Generation)

This system follows a **RAG** model:

- **Retrieve**: Extracts vulnerability data (CPEs, versions) from Nmap → Queries Vulners API for CVE & exploit details.
- **Generate**: Sends the retrieved context to Gemini to generate tailored patch recommendations.
- **Deliver**: Displays results in an interactive frontend with visual insights and reporting.

---

## 🗂️ Project Structure

### 🔧 Backend (`/backend`)

backend/
├── main.py # FastAPI app entry point
├── config.py # Configs and API keys
├── api/
│ ├── scan.py # Nmap scan logic
│ ├── grouping_api.py # API for severity & exploit grouping
├── services/
│ ├── xml_parser.py # Nmap XML → JSON
│ ├── gemini_service.py # Call Gemini with prompts
│ ├── nvd_service.py # Fetch CVE info
│ ├── vulnerability_service.py # PDF generation logic
│ ├── os_vulnerability.py # Vulnerability analysis logic
├── models/
│ ├── schema.py # Pydantic schemas
├── utils/
│ ├── helpers.py # Utility functions
├── data/
│ ├── vuln_scan2.xml # Raw Nmap scan output
│ ├── vuln_scan2.json # Parsed scan data
│ ├── result.json # LLM-generated output
│ ├── parsed_output.json # Intermediate parsed data
└── requirements.txt

---

### 🌐 Frontend (`/frontend`)

frontend/
├── public/
│ └── index.html
├── src/
│ ├── assets/ # Images, logos, static files
│ ├── components/ # Reusable UI components
│ │ ├── SeverityPage.jsx
│ │ ├── TopVulnerabilities.jsx
│ │ ├── TopOS.jsx
│ │ ├── TopServices.jsx
│ │ └── CompletedExploits.jsx
│ ├── context/
│ │ └── ExploitContext.jsx
│ ├── pages/
│ │ └── Dashboard.jsx
│ ├── styles/
│ │ ├── dashboard.css
│ │ ├── SeverityPage.css
│ │ └── index.css
│ ├── App.jsx
│ ├── main.jsx
│ └── router.jsx
├── .gitignore
├── package.json
├── vite.config.js


---

## ⚙️ How to Run

### Backend (FastAPI)

```bash
git clone https://github.com/yourusername/vulnscanner.git
cd vulnscanner/backend
python -m venv venv
# For Windows
venv\Scripts\activate
# For Linux/macOS
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

cd frontend
npm install
npm install jspdf
npm run dev

| Method   | Endpoint                      | Description                        |
| -------- | ----------------------------- | ---------------------------------- |
| GET      | `/`                           | Health check                       |
| GET      | `/vulnerability-report`       | Generate and download report       |
| POST     | `/analyze`                    | Analyze vulnerabilities            |
| POST     | `/analyze/fromfile`           | Analyze from existing parsed file  |
| GET      | `/analyze/map`                | Get mapping data for LLM           |
| GET      | `/analyze/result1`            | Get intermediate result JSON 1     |
| GET      | `/analyze/result2`            | Get intermediate result JSON 2     |
| GET      | `/analyze/vulnerabilitesjson` | Get all JSON-based vuln data       |
| GET      | `/analyze/vulnerabilitesxml`  | Get all XML-based vuln data        |
| GET/POST | `/grouping/...`               | Filter vulnerabilities by severity |
| POST     | `/xml-raw`                    | Upload raw XML for processing      |
| GET      | `/scan/stream`                | Real-time scan progress            |


📸 Screenshots

