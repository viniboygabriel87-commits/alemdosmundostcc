const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 600 } });
  const erros = []; p.on('pageerror', (e) => erros.push(e.message));
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(500);
  await p.evaluate(() => AM.Router.novoJogo());
  for (let i = 0; i < 30 && await p.evaluate(() => AM.Modal.aberto()); i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
  const r = await p.evaluate(() => {
    AM.GameState.dados.melhorias.vila_iluminada = true; AM.GameState.dados.missoes.poco_agua = { estado: 'ativa', passos: {} };
    AM.World.teletransportar(3 * 16, 3 * 16 + 80);
    const ids = Object.keys(AM.Data.npcs), out = {};
    ids.forEach((id) => (out[id] = { d: 0, ult: null, p: new Set() }));
    for (let i = 0; i < 60 * 600; i++) { AM.World.atualizar(1 / 60);
      if (i % 15 === 0) ids.forEach((id) => { const q = AM.World.npcPos(id); if (!q) return; const o = out[id]; if (o.ult) o.d += Math.hypot(q.x - o.ult.x, q.y - o.ult.y); o.ult = q; o.p.add(Math.round(q.x / 16) + ',' + Math.round(q.y / 16)); }); }
    ids.forEach((id) => (out[id] = { dist: Math.round(out[id].d), tiles: out[id].p.size, fim: out[id].ult }));
    return out;
  });
  console.log(JSON.stringify(r, null, 0)); console.log('erros', erros); await b.close();
})();
