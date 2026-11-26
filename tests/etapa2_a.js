const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 600 } });
  const erros = []; p.on('pageerror', (e) => erros.push('PAGE ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) erros.push(m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { AM.Router.novoJogo && AM.Router.novoJogo(); });
  await p.waitForTimeout(500);
  // fecha prólogo
  for (let i = 0; i < 30 && await p.evaluate(() => AM.Modal.aberto()); i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
  console.log('cena', await p.evaluate(() => AM.Router.cena), 'modal', await p.evaluate(() => AM.Modal.aberto()));
  // simulação acelerada dos NPCs: chama atualizar com dt fixo, sem jogador por perto
  const r = await p.evaluate(() => {
    const out = {}; AM.World.teletransportar(25 * 16, 33.5 * 16);
    const ids = Object.keys(AM.Data.npcs);
    ids.forEach((id) => (out[id] = { moveu: 0, ult: null, pontos: new Set() }));
    for (let i = 0; i < 60 * 240; i++) { // 240 s de jogo
      AM.World.atualizar(1 / 60);
      if (i % 30 === 0) ids.forEach((id) => { const q = AM.World.npcPos(id); if (!q) return; const o = out[id]; if (o.ult) o.moveu += Math.hypot(q.x - o.ult.x, q.y - o.ult.y); o.ult = q; o.pontos.add(Math.round(q.x / 16) + ',' + Math.round(q.y / 16)); });
    }
    ids.forEach((id) => (out[id].pontos = out[id].pontos.size));
    return out;
  });
  console.log(JSON.stringify(r));
  console.log('erros', erros);
  await b.close();
})();
