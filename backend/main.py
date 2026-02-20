from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import time
from utils import build_graph
from detectors.cycle import detect_cycles
from detectors.smurfing import detect_smurfing
from detectors.shell import detect_shells

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/upload/")
async def upload_csv(file: UploadFile = File(...)):
    start_time = time.time()
    df = pd.read_csv(file.file)
    df = df.dropna()
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    G = build_graph(df)
    cycles= detect_cycles(G)
    smurfing= detect_smurfing(G)
    shells= detect_shells(G)
    result = generate_output(G, cycles, smurfing, shells, start_time)
    return result

def generate_output(G, cycles, smurfing, shells, start_time):
    suspicious_accounts = {}
    fraud_rings = []
    ring_counter = 1

    # ---- 1. Handle Cycles ----
    for cycle in cycles:
        ring_id = f"RING_{ring_counter:03d}"
        ring_counter += 1
        for acc in cycle:
            if acc not in suspicious_accounts:
                suspicious_accounts[acc] = {
                    "account_id": acc,
                    "suspicion_score": 0,
                    "detected_patterns": [],
                    "ring_id": ring_id
                }

            suspicious_accounts[acc]["suspicion_score"] += 40
            suspicious_accounts[acc]["detected_patterns"].append("cycle")

        fraud_rings.append({
            "ring_id": ring_id,
            "member_accounts": cycle,
            "pattern_type": "cycle",
            "risk_score": 90.0
        })

    # ---- 2. Smurfing ----
    for pattern, acc in smurfing:
        if acc not in suspicious_accounts:
            suspicious_accounts[acc] = {
                "account_id": acc,
                "suspicion_score": 0,
                "detected_patterns": [],
                "ring_id": "RING_000"
            }

        suspicious_accounts[acc]["suspicion_score"] += 30
        suspicious_accounts[acc]["detected_patterns"].append(pattern)

    # ---- 3. Shell ----
    for acc1, acc2 in shells:
        for acc in [acc1, acc2]:
            if acc not in suspicious_accounts:
                suspicious_accounts[acc] = {
                    "account_id": acc,
                    "suspicion_score": 0,
                    "detected_patterns": [],
                    "ring_id": "RING_000"
                }

            suspicious_accounts[acc]["suspicion_score"] += 20
            suspicious_accounts[acc]["detected_patterns"].append("shell")

    # ---- Convert to list ----
    suspicious_list = list(suspicious_accounts.values())

    # Cap score at 100
    for acc in suspicious_list:
        acc["suspicion_score"] = float(min(acc["suspicion_score"], 100))

    # Sort descending
    suspicious_list.sort(key=lambda x: x["suspicion_score"], reverse=True)

    processing_time = round(time.time() - start_time, 2)

    return {
        "suspicious_accounts": suspicious_list,
        "fraud_rings": fraud_rings,
        "summary": {
            "total_accounts_analyzed": G.number_of_nodes(),
            "suspicious_accounts_flagged": len(suspicious_list),
            "fraud_rings_detected": len(fraud_rings),
            "processing_time_seconds": processing_time
        },
        "graph": {
            "nodes": list(G.nodes()),
            "edges": [
                {"from": u, "to": v}
                for u, v in G.edges()
            ]
        }
    }

    }
@app.get("/")
def root():
    return {"message": "Money Muling Detection API is running"}