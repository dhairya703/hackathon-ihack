# api/grouping.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from services.grouping_service import group_vulnerabilities

router = APIRouter()

@router.get("/group")
def group_vulns():
    try:
        result = group_vulnerabilities()
        return JSONResponse(content={
            "message": "Grouping complete. Saved to grouped_vulnerabilities.json.",
            "grouped_data": result
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
