// Final script.js
let trades = JSON.parse(localStorage.getItem("trades") || "[]");
let startBalance = 1250.0;

function saveTrades() {
  localStorage.setItem("trades", JSON.stringify(trades));
}

function calculatePips(entry, close, position) {
  const diff = parseFloat((close - entry).toFixed(2));
  const pips = parseFloat((diff * 10).toFixed(1)); // 0.1 pip per digit after decimal
  if (position === "BUY" && diff > 0) return pips;
  if (position === "SELL" && diff < 0) return Math.abs(pips);
  return -Math.abs(pips);
}

function calculateUsdc(pips, lot, layer) {
  const perLotValue = lot * 10; // 0.01 lot = 0.1, so 0.01 * 10 = 0.1 USD per pip
  return parseFloat((pips * perLotValue * layer).toFixed(2));
}

function updateDisplay() {
  const openTable = document.querySelector("#openTrades tbody");
  const historyTable = document.querySelector("#history tbody");
  openTable.innerHTML = "";
  historyTable.innerHTML = "";

  let totalPips = 0;
  let totalUsdc = 0;
  let win = 0;
  let loss = 0;
  let tradeNo = 1;

  trades.forEach((t, i) => {
    if (!t.closed) {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${t.pair}</td>
        <td>${t.layer}</td>
        <td>${t.lot}</td>
        <td>${t.position}</td>
        <td>${t.entry.toFixed(2)}</td>
        <td>${t.openTime}</td>
        <td>${t.reason}</td>
        <td><input type="number" step="0.01" placeholder="Close" onchange="closeTrade(${i}, this.value)" /></td>
        <td><button onclick="deleteTrade(${i})">❌</button></td>
      `;
      openTable.appendChild(row);
    } else {
      const pips = calculatePips(t.entry, t.close, t.position);
      const usdc = calculateUsdc(pips, t.lot, t.layer);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${tradeNo++}</td>
        <td>${t.pair}</td>
        <td>${t.layer}</td>
        <td>${t.lot}</td>
        <td>${t.position}</td>
        <td>${t.entry.toFixed(2)}</td>
        <td>${t.close.toFixed(2)}</td>
        <td>${t.openTime}</td>
        <td>${t.closeTime}</td>
        <td>${pips.toFixed(1)}</td>
        <td>${usdc.toFixed(2)}</td>
      `;
      historyTable.appendChild(row);

      totalPips += pips;
      totalUsdc += usdc;
      if (usdc >= 0) win++;
      else loss++;
    }
  });

  const totalTrade = win + loss;
  const winrate = ((win / (totalTrade || 1)) * 100).toFixed(1) + "%";

  document.getElementById("totalTrade").textContent = totalTrade;
  document.getElementById("winTrade").textContent = win;
  document.getElementById("lossTrade").textContent = loss;
  document.getElementById("winrate").textContent = winrate;
  document.getElementById("totalPips").textContent = totalPips.toFixed(1);
  document.getElementById("totalUsdc").textContent = totalUsdc.toFixed(2);
  document.getElementById("startBalance").textContent = (startBalance + totalUsdc).toFixed(2);

  saveTrades();
}

function closeTrade(index, closePrice) {
  trades[index].close = parseFloat(closePrice);
  trades[index].closed = true;
  trades[index].closeTime = new Date().toLocaleString();
  updateDisplay();
}

function deleteTrade(index) {
  trades.splice(index, 1);
  updateDisplay();
}

document.getElementById("tradeForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;
  const newTrade = {
    pair: form.pair.value,
    layer: parseInt(form.layer.value),
    lot: parseFloat(form.lot.value),
    position: form.position.value,
    reason: form.reason.value,
    entry: parseFloat(form.entryPrice.value),
    openTime: new Date().toLocaleString(),
    closed: false
  };
  trades.push(newTrade);
  form.reset();
  updateDisplay();
});

updateDisplay();
