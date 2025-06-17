// app.js

// ========== BLOKIR DEV TOOLS & KLIK KANAN ==========
document.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("keydown", e => {
  if (e.ctrlKey && ["i", "j", "u", "s"].includes(e.key.toLowerCase()) || e.key === "F12") {
    e.preventDefault();
  }
});

// Sistem Akses
    function validateAccess() {
      const code = document.getElementById('accessCode').value.trim().toUpperCase();
      if (code === 'VL') {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
        calculateLayers();
      } else {
        alert('Kode akses salah!');
      }
    }
});

// ========== TAMBAH POSISI TERBUKA ==========
const openTrades = JSON.parse(localStorage.getItem("openTrades") || "[]");
document.getElementById("openTradeForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const pair = document.getElementById("pair").value;
  const lot = parseFloat(document.getElementById("lot").value);
  const position = document.getElementById("position").value;
  const entryPrice = parseFloat(document.getElementById("entryPrice").value);
  const reason = document.getElementById("reason").value;
  const entryTime = new Date().toLocaleString();

  const trade = { pair, lot, position, entryPrice, reason, entryTime };
  openTrades.push(trade);
  localStorage.setItem("openTrades", JSON.stringify(openTrades));
  renderOpenTrades();
  this.reset();
});

function renderOpenTrades() {
  const tbody = document.getElementById("openTradesBody");
  tbody.innerHTML = "";
  openTrades.forEach((t, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.pair}</td><td>${t.lot}</td><td>${t.position}</td>
      <td>${t.entryPrice}</td><td>${t.reason}</td><td>${t.entryTime}</td>
      <td><button onclick="closeTrade(${i})">Tutup</button></td>`;
    tbody.appendChild(tr);
  });
}

// ========== TUTUP POSISI ==========
const history = JSON.parse(localStorage.getItem("tradeHistory") || "[]");
function closeTrade(index) {
  const exitPrice = parseFloat(prompt("Harga tutup?").replace(",", "."));
  if (isNaN(exitPrice)) return alert("Harga tidak valid.");
  const trade = openTrades.splice(index, 1)[0];
  const pips = (trade.position === "BUY" ? exitPrice - trade.entryPrice : trade.entryPrice - exitPrice) * 10;
  const profit = (pips * trade.lot * 0.1).toFixed(2); // 0.1 USD per pip per 0.01 lot
  const closeTime = new Date().toLocaleString();
  const result = { ...trade, exitPrice, pips: pips.toFixed(1), profit, closeTime };
  history.push(result);
  localStorage.setItem("openTrades", JSON.stringify(openTrades));
  localStorage.setItem("tradeHistory", JSON.stringify(history));
  renderOpenTrades();
  renderTradeHistory();
}

// ========== RENDER HISTORY ==========
function renderTradeHistory() {
  const tbody = document.querySelector("#tradeHistory tbody");
  tbody.innerHTML = "";
  history.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.pair}</td><td>${t.lot}</td><td>${t.position}</td>
      <td>${t.entryPrice}</td><td>${t.exitPrice}</td><td>${t.pips}</td>
      <td>${t.profit}</td><td>${t.entryTime}</td><td>${t.closeTime}</td><td>${t.reason}</td>`;
    tbody.appendChild(tr);
  });
}

// ========== RENDER RINGKASAN HARIAN ==========
function updateDailySummary() {
  const dataByDate = {};
  history.forEach(t => {
    const date = new Date(t.closeTime).toLocaleDateString();
    if (!dataByDate[date]) dataByDate[date] = { start: 0, end: 0, totalTrades: 0, profits: 0 };
    dataByDate[date].totalTrades++;
    dataByDate[date].profits += parseFloat(t.profit);
  });

  const tbody = document.querySelector("#dailySummaryTable tbody");
  tbody.innerHTML = "";
  Object.entries(dataByDate).forEach(([date, data]) => {
    const saldoAwal = 1000;
    const saldoAkhir = saldoAwal + data.profits;
    const growth = ((saldoAkhir - saldoAwal) / saldoAwal * 100).toFixed(2);
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${date}</td><td>${saldoAwal}</td><td>${saldoAkhir.toFixed(2)}</td><td>${growth}</td><td>${data.totalTrades}</td><td>-</td>`;
    tbody.appendChild(tr);
  });
}

// ========== UNDUH CSV ==========
function downloadCSV(data, headers, filename) {
  const rows = [headers.join(",")];
  data.forEach(obj => {
    const row = headers.map(h => `"${obj[h] ?? ''}"`).join(",");
    rows.push(row);
  });
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById("downloadHistory").onclick = () => {
  downloadCSV(history, ["pair", "lot", "position", "entryPrice", "exitPrice", "pips", "profit", "entryTime", "closeTime", "reason"], "riwayat_trading.csv");
};

document.getElementById("downloadRekap").onclick = () => {
  const data = [];
  document.querySelectorAll("#dailySummaryTable tbody tr").forEach(tr => {
    const tds = tr.querySelectorAll("td");
    data.push({
      Tanggal: tds[0].textContent,
      SaldoAwal: tds[1].textContent,
      SaldoAkhir: tds[2].textContent,
      Pertumbuhan: tds[3].textContent,
      TotalTrade: tds[4].textContent,
      Analisa: tds[5].textContent
    });
  });
  downloadCSV(data, ["Tanggal", "SaldoAwal", "SaldoAkhir", "Pertumbuhan", "TotalTrade", "Analisa"], "rekap_trading.csv");
};

// ========== MUAT DATA DARI LOCAL STORAGE ==========
function loadFromLocalStorage() {
  renderOpenTrades();
  renderTradeHistory();
  updateDailySummary();
}
