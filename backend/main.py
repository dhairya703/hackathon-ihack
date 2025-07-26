from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import scan
from fastapi.responses import StreamingResponse
from services.vulnerability_service import generate_vulnerability_report
from services.os_vulnerability import analyze_vulnerabilities, analyze_from_file,get_map_json,get_res_json,get_res2_json,get_vulnerabilitesxml_json,get_vulnerabilitesjson_json
from api.grouping_api import router as grouping_router

# analyzer, cve_report, vulnerability_report

app = FastAPI(
    title="Vulnerability Scanner API",
    description="A FastAPI-based interface to analyze Nmap scan outputs, CVEs, and generate reports",
    version="1.0.0"
)

# CORS configuration (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"]
    allow_credentials=False,  # ✅ Set this to False if using "*"
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def run():
    return {'server running'}
# Include routers from api modules
app.include_router(scan.router, prefix="/api")
@app.get("/vulnerability-report", response_class=StreamingResponse)
def get_vulnerability_report():
    return StreamingResponse(generate_vulnerability_report(), media_type="text/plain")
app.post("/analyze")(analyze_vulnerabilities)
app.post("/analyze/fromfile")(analyze_from_file)
app.get("/analyze/map")(get_map_json)
app.get("/analyze/result1")(get_res_json)
app.get("/analyze/result2")(get_res2_json)

app.get("/analyze/vulnerabilitesjson")(get_vulnerabilitesjson_json)
app.get("/analyze/vulnerabilitesxml")(get_vulnerabilitesxml_json)

app.include_router(grouping_router, prefix="/grouping")
app.include_router(grouping_router)

# app.include_router(analyzer.router, prefix="/api")
# app.include_router(cve_report.router, prefix="/api")
# app.include_router(vulnerability_report.router, prefix="/api")
