let latestResult = null;

async function uploadFile() {

    const fileInput = document.getElementById("csvFile");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a CSV file.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("https://money-muling-engine-pq67.onrender.com/", {

            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Server error");
        }

        const data = await response.json();
        latestResult = data;

        renderGraph(data);
        renderTable(data);
        enableDownload();

    } catch (error) {
        alert("Backend connection failed.");
        console.error(error);
    }
}

function renderGraph(data) {

    const nodes = [];
    const edges = [];

    const suspiciousSet = new Set(
        data.suspicious_accounts.map(acc => acc.account_id)
    );

    // Create nodes
    suspiciousSet.forEach(id => {
        nodes.push({
            id: id,
            label: id,
            color: "#ef4444",
            size: 30,
            font: { color: "white" }
        });
    });

    // Add ring edges
    data.fraud_rings.forEach(ring => {
        const members = ring.member_accounts;

        for (let i = 0; i < members.length; i++) {
            edges.push({
                from: members[i],
                to: members[(i + 1) % members.length],
                arrows: "to",
                color: "#38bdf8"
            });
        }
    });

    const container = document.getElementById("network");

    const graphData = {
        nodes: new vis.DataSet(nodes),
        edges: new vis.DataSet(edges)
    };

    const options = {
        physics: {
            enabled: true,
            stabilization: false
        },
        nodes: {
            shape: "dot"
        }
    };

    new vis.Network(container, graphData, options);
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
