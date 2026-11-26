const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [nome, emu] of [['retrato', devices['Pixel 7']], ['paisagem', { ...devices['Pixel 7 landscape'] }]]) {
    const c = await b.newContext(emu); const p = await c.newPage(); const erros = []; p.on('pageerror', (e) => erros.push(e.message));
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(500);
    await p.evaluate(() => AM.Router.novoJogo()); await p.waitForTimeout(1200);
    for (let i = 0; i < 30 && await p.evaluate(() => AM.Modal.aberto()); i++) { await p.evaluate(() => AM.Bus.emit('acao', 'interagir')); await p.waitForTimeout(120); }
    await p.evaluate(() => { for (let i = 0; i < 60 * 40; i++) AM.World.atualizar(1 / 60); AM.World.teletransportar(36 * 16, 17.5 * 16); for (let i = 0; i < 30; i++) AM.World.atualizar(1 / 60); AM.Inventory.dar('botas', 1, { silencioso: true }); AM.Inventory.dar('livro_atlas', 1, { silencioso: true }); });
    await p.waitForTimeout(3500);
    await p.screenshot({ path: `/tmp/claude-0/shots/s2_m_${nome}_jogo.png` });
    console.log(nome, 'toque visivel', await p.evaluate(() => !document.getElementById('toque').hidden), 'overflowX', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
    await p.evaluate(() => AM.UI.abrirMapa()); await p.waitForTimeout(300); await p.screenshot({ path: `/tmp/claude-0/shots/s2_m_${nome}_mapa.png` });
    console.log(erros); await c.close();
  }
  await b.close();
})();
