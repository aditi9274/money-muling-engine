💰 Money Muling Detection Engine

Graph-Based Financial Crime Detection System

🔍 Overview

This project is a web-based Financial Forensics Engine designed to detect money muling networks using graph theory.

Money muling involves transferring illicit funds across multiple accounts to obscure the source of money. Traditional SQL queries fail to identify multi-hop, layered, and cyclic financial flows.

This system uses directed graph modeling and pattern detection algorithms to expose fraud rings and suspicious accounts.

🌐 Live Demo

(Add your deployed URL here once hosted)

🛠 Tech Stack

Backend

FastAPI

NetworkX

Pandas

Uvicorn

Frontend

HTML5

Bootstrap 5

Vis.js (Graph visualization)

Vanilla JavaScript

🏗 System Architecture
CSV Upload
     ↓
FastAPI Backend
     ↓
Graph Construction (NetworkX)
     ↓
Detection Algorithms
     ↓
Suspicion Scoring Engine
     ↓
JSON Output + Graph Visualization

Architecture Flow

User uploads transaction CSV.

Backend builds directed graph:

Nodes → Accounts

Edges → Transactions (sender → receiver)

Detection modules analyze graph patterns.

Suspicion score calculated.

Results returned as structured JSON.

Frontend renders:

Interactive graph

Fraud ring table

Downloadable report

🧠 Detection Algorithms
1️⃣ Circular Fund Routing (Cycle Detection)

Detects cycles of length 3–5.

Algorithm:

Use networkx.simple_cycles()

Filter cycles within allowed length

All accounts in cycle assigned same Ring ID

Time Complexity:

Worst case: O((V + E)(C + 1))

Practical performance optimized for ≤10k transactions

2️⃣ Smurfing Detection (Fan-in / Fan-out)

Detects:

≥10 senders to one account (Fan-in)

≥10 receivers from one account (Fan-out)

Suspicious when transactions occur within 72-hour window

Complexity:

O(V + E)

3️⃣ Layered Shell Networks

Detects chains of ≥3 hops where intermediate nodes:

Have low degree (2–3 total transactions)

Act as pass-through accounts

Complexity:

O(V + E)

📊 Suspicion Score Methodology

Each account receives a score between 0–100.

Pattern Type	Score Contribution
Cycle	+40
Smurfing	+30
Shell	+20

Rules:

Scores capped at 100

Accounts sorted descending

Legitimate high-volume accounts can be adjusted to reduce false positives

📦 JSON Output Format

The backend returns the exact required structure:

{
  "suspicious_accounts": [
    {
      "account_id": "ACC_001",
      "suspicion_score": 87.5,
      "detected_patterns": ["cycle", "high_velocity"],
      "ring_id": "RING_001"
    }
  ],
  "fraud_rings": [
    {
      "ring_id": "RING_001",
      "member_accounts": ["ACC_001", "ACC_002"],
      "pattern_type": "cycle",
      "risk_score": 95.3
    }
  ],
  "summary": {
    "total_accounts_analyzed": 500,
    "suspicious_accounts_flagged": 15,
    "fraud_rings_detected": 4,
    "processing_time_seconds": 2.3
  }
}

⚙ Installation & Setup
Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


Backend runs on:

http://127.0.0.1:8000

Frontend
cd frontend
python -m http.server 5500


Open:

http://127.0.0.1:5500

📁 Input Specification

CSV must contain:

Column Name	Type
transaction_id	String
sender_id	String
receiver_id	String
amount	Float
timestamp	YYYY-MM-DD HH:MM:SS
📈 Performance Targets

Handles up to 10,000 transactions

Processing time < 30 seconds

Designed for high precision and balanced recall

⚠ False Positive Handling

To avoid flagging legitimate accounts:

High-volume merchant accounts can be filtered

Suspicion scoring considers transaction structure, not only volume

Multi-pattern confirmation increases reliability

🔐 Known Limitations

Temporal analysis simplified for hackathon constraints

Real-world AML systems require:

Historical behavior modeling

Machine learning anomaly detection

Regulatory threshold integration

Currently rule-based detection

👥 Team

(Add your team members here)

🎥 **Demo Video**
