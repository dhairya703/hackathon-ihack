from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import subprocess
import xml.etree.ElementTree as ET
import json
import os
from fastapi import APIRouter, Body
from fastapi.responses import JSONResponse
import xml.etree.ElementTree as ET
import json
import os
router = APIRouter()

# File paths
xml_file = "data/vuln_scan2.xml"
json_file = "data/vuln_scan2.json"

def xml_to_json_debug(xml_path, json_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()

    data = []

    print("🔍 DEBUG: Root tag =", root.tag)
    
    for i, table in enumerate(root.findall(".//table")):
        entry = {}
        for elem in table.findall("elem"):
            key = elem.attrib.get("key")
            value = elem.text.strip() if elem.text else None
            entry[key] = value
        if entry:
            data.append(entry)
        else:
            print(f" Empty table at index {i}")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

    print(f" JSON saved to: {json_path}")
    print(f" {len(data)} entries extracted.")

@router.get("/scan")
def run_nmap_scan(
    target: str = Query(default="localhost", description="Target IP/hostname"),
    port: str = Query(default="", description="Optional port number or range, e.g., 80 or 22-443")
):
    # Build Nmap command
    cmd = ["nmap", "-sV", "--script", "vuln"]
    if port:
        cmd += ["-p", port]
    cmd += ["-oX", xml_file, target]

    try:
        print(cmd)
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        return JSONResponse(content={"error": f"Nmap scan failed: {e}"}, status_code=500)

    try:
        data = xml_to_json_debug(xml_file, json_file)
        return JSONResponse(content={"entries": data})
    except Exception as e:
        return JSONResponse(content={"error": f"XML parsing failed: {e}"}, status_code=500)
# In scan.py
from fastapi.responses import StreamingResponse
import subprocess

@router.get("/scan/stream")
def stream_scan(target: str, port: str = None):
    def run_nmap():
        command = ["nmap", "-sV", "--script", "vuln", "--stats-every", "2s"]
        if port:
            command += ["-p", port]
        command += ["-oX", xml_file, target]

        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

        for line in iter(process.stdout.readline, ""):
            if "Percentage" in line or "Stats" in line:
                yield f"data: {line.strip()}\n\n"

        process.stdout.close()
        process.wait()
          # After scan completes, convert to JSON and stream result
        try:
            data = xml_to_json_debug(xml_file, json_file)
            
            yield f"data: SCAN_COMPLETE\n\n"
            yield f"data: Converted to Json\n\n"
        except Exception as e:
            yield f"data: ERROR: XML parsing failed: {e}\n\n"

    return StreamingResponse(run_nmap(), media_type="text/event-stream")


@router.get("/results")
def get_scan_results():
    if not os.path.exists(json_file):
        return JSONResponse(content={"error": "Scan results not found"}, status_code=404)
    with open(json_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    return JSONResponse(content={"results": data})



# File paths (same as your scan output)
UPLOAD_XML_PATH = "data/vuln_scan2.xml"
UPLOAD_JSON_PATH = "data/vuln_scan2.json"

@router.post("/upload-xml-raw")
async def upload_xml_raw(xml_data: str = Body(..., media_type="application/xml")):
    try:
        # Save raw XML input to file
        os.makedirs(os.path.dirname(UPLOAD_XML_PATH), exist_ok=True)
        with open(UPLOAD_XML_PATH, "w", encoding="utf-8") as f:
            f.write(xml_data)

        # Parse XML
        root = ET.fromstring(xml_data)
        data = []

        for table in root.findall(".//table"):
            entry = {}
            for elem in table.findall("elem"):
                key = elem.attrib.get("key")
                value = elem.text.strip() if elem.text else None
                entry[key] = value
            if entry:
                data.append(entry)

        # Save JSON to file
        with open(UPLOAD_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

        return JSONResponse(content={
            "message": "XML uploaded and converted successfully.",
            "json_saved_to": UPLOAD_JSON_PATH,
            "entries": data
        })

    except Exception as e:
        return JSONResponse(content={"error": f"Failed to process XML: {e}"}, status_code=500)
