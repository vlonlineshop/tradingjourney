// script.js
let trades = JSON.parse(localStorage.getItem("trades")) || [];
let startBalance = parseFloat(localStorage.getItem("startBalance")) || 1250;

const form = document.getElementById("tradeForm");
const openTradesTable = document.getElementById("openTrades").querySelector("tbody");
const historyTable = document.getElementById("history").querySelector("tbody");
const logBox = document.getElementById("logBox");
const startBalanceInput = document.getElementById("startBalance");

startBalanceInput.value = startBalance.toFixed(2);

function saveTrades() {
  localStorage.setItem("trades", JSON.stringify(trades));
  localStorage.setItem("startBalance", startBalance.toFixed(2));
}

function renderTrades() {
  openTradesTable.innerHTML = "";
  historyTable.innerHTML = "";
  let index = 1;
  let wins = 0, losses = 0;

  trades.forEach((t, i) => {
    if (!t.closePrice) {
      const row = openTradesTable.insertRow();
      row.innerHTML = `
        <td>${index}</td>
        <td>${t.pair}</td>
        <td>${t.layer}</td>
        <td>${t.lot}</td>
        <td>${t.position}</td>
        <td>${t.entryPrice.toFixed(4)}</td>
        <td>${t.openTime}</td>
        <td>${t.reason}</td>
        <td><button onclick="closeTrade(${i})">Close</button></td>
        <td><button onclick="deleteTrade(${i})">Hapus</button></td>
      `;
    } else {
      const row = historyTable.insertRow();
      const profitUSDC = (t.pips * t.lot).toFixed(2);
      const result = (t.position === "BUY" && t.pips > 0) || (t.position === "SELL" && t.pips < 0);
      if (result) wins++; else losses++;

      row.innerHTML = `
        <td>${index}</td>
        <td>${t.pair}</td>
        <td>${t.layer}</td>
        <td>${t.lot}</td>
        <td>${t.position}</td>
        <td>${t.entryPrice.toFixed(4)}</td>
        <td>${t.closePrice.toFixed(4)}</td>
        <td>${t.openTime}</td>
        <td>${t.closeTime}</td>
        <td>${t.pips}</td>
        <td>${profitUSDC} USDC</td>
      `;
    }
    index++;
  });

  const total = wins + losses;
  const winrate = total ? ((wins / total) * 100).toFixed(2) : 0;
  logBox.innerHTML = `Winrate: ${winrate}% (${wins} win / ${losses} loss)`;
}

function calcPips(entry, close) {
  const digits = entry.toString().split(".")[1]?.length || 0;
  return Math.round((close - entry) * Math.pow(10, digits));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    pair: form.pair.value,
    layer: parseInt(form.layer.value),
    lot: parseFloat(form.lot.value),
    position: form.position.value,
    reason: form.reason.value,
    entryPrice: parseFloat(form.entryPrice.value),
    openTime: new Date().toLocaleString(),
    closePrice: null,
    closeTime: null,
    pips: null
  };
  trades.push(data);
  saveTrades();
  renderTrades();
  form.reset();
  startBalance = parseFloat(startBalanceInput.value);
});

function closeTrade(index) {
  const price = prompt("Masukkan harga close:");
  if (!price) return;
  const closePrice = parseFloat(price);
  const trade = trades[index];
  const direction = trade.position === "BUY" ? 1 : -1;
  const pips = calcPips(trade.entryPrice, closePrice) * direction;
  const profit = pips * trade.lot;
  startBalance += profit;
  trade.closePrice = closePrice;
  trade.closeTime = new Date().toLocaleString();
  trade.pips = pips;
  saveTrades();
  renderTrades();
  startBalanceInput.value = startBalance.toFixed(2);
}

function deleteTrade(index) {
  if (confirm("Yakin ingin menghapus entry ini?")) {
    trades.splice(index, 1);
    saveTrades();
    renderTrades();
  }
}

renderTrades();
