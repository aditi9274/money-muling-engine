let latestResult = null;

async function uploadFile() {

    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
        "https://money-muling-engine-pq67.onrender.com/upload",
        {
            method: "POST",
            body: formData
        }
    );

    const data = await response.json();

    latestResult = data;

    renderGraph(data);
    renderTable(data);
    enableDownload();
}

function renderGraph(data) {

    const nodes = [];
    const edges = [];

    const suspiciousSet = new Set(
        data.suspicious_accounts.map(acc => acc.account_id)
    );

    data.graph.nodes.forEach(id => {
        nodes.push({
            id: id,
            label: id,
            color: suspiciousSet.has(id) ? "#ef4444" : "#38bdf8",
            size: suspiciousSet.has(id) ? 28 : 14,
            font: { color: "white" }
        });
    });

    data.graph.edges.forEach(edge => {
        edges.push({
            from: edge.from,
            to: edge.to,
            arrows: "to",
            color: "#94a3b8"
        });
    });

    new vis.Network(
        document.getElementById("network"),
        {
            nodes: new vis.DataSet(nodes),
            edges: new vis.DataSet(edges)
        },
        { physics: { enabled: true } }
    );
}

function renderTable(data) {

    const tableBody = document.querySelector("#ringTable tbody");
    tableBody.innerHTML = "";

    data.fraud_rings.forEach(ring => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${ring.ring_id}</td>
            <td>${ring.pattern_type}</td>
            <td>${ring.member_accounts.join(", ")}</td>
            <td>${ring.risk_score}</td>
        `;

        tableBody.appendChild(row);
    });
}

function enableDownload() {

    const btn = document.getElementById("downloadBtn");
    btn.style.display = "inline-block";

    btn.onclick = function () {

        const blob = new Blob(
            [JSON.stringify(latestResult, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "fraud_detection_report.json";
        a.click();
    };
}
