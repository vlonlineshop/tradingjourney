let trades = JSON.parse(localStorage.getItem('trades')) || [];
let balance = 1250.00;

const form = document.getElementById('tradeForm');
const openTradesTable = document.querySelector('#openTrades tbody');
const historyTable = document.querySelector('#history tbody');
const logBox = document.getElementById('logBox');

function saveTrades() {
  localStorage.setItem('trades', JSON.stringify(trades));
}

function updateRekap() {
  const totalTrade = trades.filter(t => t.closePrice).length;
  const winTrade = trades.filter(t => t.profitUsdc > 0).length;
  const lossTrade = trades.filter(t => t.profitUsdc < 0).length;
  const totalPips = trades.reduce((sum, t) => sum + (t.pips || 0), 0);
  const totalUsdc = trades.reduce((sum, t) => sum + (t.profitUsdc || 0), 0);
  const winrate = totalTrade > 0 ? ((winTrade / totalTrade) * 100).toFixed(2) : 0;

  document.getElementById('totalTrade').innerText = totalTrade;
  document.getElementById('winTrade').innerText = winTrade;
  document.getElementById('lossTrade').innerText = lossTrade;
  document.getElementById('totalPips').innerText = totalPips.toFixed(2);
  document.getElementById('totalUsdc').innerText = totalUsdc.toFixed(2);
  document.getElementById('winrate').innerText = `${winrate}%`;
}

function renderOpenTrades() {
  openTradesTable.innerHTML = '';
  trades.filter(t => !t.closePrice).forEach((trade, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${trade.pair}</td>
      <td>${trade.layer}</td>
      <td>${trade.lot}</td>
      <td>${trade.position}</td>
      <td>${trade.entryPrice.toFixed(2)}</td>
      <td>${trade.time}</td>
      <td>${trade.reason}</td>
      <td><input type="number" step="0.01" placeholder="Close price" onblur="closeTrade(${index}, this.value)"></td>
      <td><button onclick="deleteTrade(${index})">🗑️</button></td>
    `;
    openTradesTable.appendChild(row);
  });
}

function renderHistory() {
  historyTable.innerHTML = '';
  trades.filter(t => t.closePrice).forEach((trade, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${trade.pair}</td>
      <td>${trade.layer}</td>
      <td>${trade.lot}</td>
      <td>${trade.position}</td>
      <td>${trade.entryPrice.toFixed(2)}</td>
      <td>${trade.closePrice.toFixed(2)}</td>
      <td>${trade.time}</td>
      <td>${trade.closeTime}</td>
      <td>${trade.pips.toFixed(2)}</td>
      <td>${trade.profitUsdc.toFixed(2)}</td>
    `;
    historyTable.appendChild(row);
  });
}

function closeTrade(index, closeValue) {
  const trade = trades[index];
  const closePrice = parseFloat(closeValue);
  if (!closePrice) return;

  let pips = 0;
  const multiplier = 100;
  const pipValue = 1; // 1 pip = 1 point (cent)

  if (trade.position === 'BUY') {
    pips = (closePrice - trade.entryPrice) * multiplier;
  } else {
    pips = (trade.entryPrice - closePrice) * multiplier;
  }

  const totalUsdc = pips * trade.lot * trade.layer;
  trade.closePrice = closePrice;
  trade.pips = pips;
  trade.profitUsdc = totalUsdc;
  trade.closeTime = new Date().toLocaleString();
  balance += totalUsdc;

  logBox.innerHTML = `Trade closed: ${pips.toFixed(2)} pips | ${totalUsdc.toFixed(2)} USDC`;

  saveTrades();
  renderOpenTrades();
  renderHistory();
  updateRekap();
}

function deleteTrade(index) {
  trades.splice(index, 1);
  saveTrades();
  renderOpenTrades();
  renderHistory();
  updateRekap();
}

form.addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const trade = {
    pair: formData.get('pair'),
    layer: parseInt(formData.get('layer')),
    lot: parseFloat(formData.get('lot')),
    position: formData.get('position'),
    reason: formData.get('reason'),
    entryPrice: parseFloat(formData.get('entryPrice')),
    time: new Date().toLocaleString(),
  };
  trades.push(trade);
  form.reset();
  saveTrades();
  renderOpenTrades();
});

// Initial load
renderOpenTrades();
renderHistory();
updateRekap();
