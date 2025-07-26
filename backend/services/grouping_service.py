# services/grouping_service.py
import json

def classify_priority(vuln):
    try:
        cvss = float(vuln.get("cvss", 0))
        is_exploit = vuln.get("is_exploit", "false").lower() == "true"
        if is_exploit:
            if cvss >= 9.0:
                return "Critical"
            elif cvss >= 7.0:
                return "High"
            elif cvss >= 4.0:
                return "Medium"
            else:
                return "Low"
        else:
            return "Low"
    except:
        return "Unknown"

def group_vulnerabilities(file_path="data/vuln_scan2.json"):
    with open(file_path, "r") as f:
        vulnerabilities = json.load(f)

    by_type = {}
    by_severity = {
        "Critical": [], "High": [], "Medium": [], "Low": [], "Unknown": []
    }
    by_priority = {
        "Critical": [], "High": [], "Medium": [], "Low": [], "Unknown": []
    }

    for vuln in vulnerabilities:
        vtype = vuln.get("type", "unknown")
        by_type.setdefault(vtype, []).append(vuln)

        try:
            cvss = float(vuln.get("cvss", 0))
            if cvss >= 9.0:
                by_severity["Critical"].append(vuln)
            elif cvss >= 7.0:
                by_severity["High"].append(vuln)
            elif cvss >= 4.0:
                by_severity["Medium"].append(vuln)
            elif cvss > 0:
                by_severity["Low"].append(vuln)
            else:
                by_severity["Unknown"].append(vuln)
        except:
            by_severity["Unknown"].append(vuln)

        priority = classify_priority(vuln)
        by_priority[priority].append(vuln)

    grouped = {
        "by_type": by_type,
        "by_severity": by_severity,
        "by_priority": by_priority
    }

    with open("data/grouped_vulnerabilities.json", "w") as f:
        json.dump(grouped, f, indent=4)

    return grouped
