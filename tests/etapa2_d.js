const { chromium } = require('playwright');
const S = '/tmp/claude-0/shots/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 640 } });
  const erros = []; p.on('pageerror', (e) => erros.push('PAGE ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) erros.push(m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(500);
  // save antigo v1 (migração): salva envelope v1 manualmente
  const mig = await p.evaluate(() => {
    const d = AM.GameState.novo ? null : null; AM.GameState.novo();
    const dados = JSON.parse(JSON.stringify(AM.GameState.dados)); delete dados.inventario; delete dados.conhecimento; delete dados.registro; delete dados.coletados; delete dados.descobertos;
    dados.missoes.escola_luz = { estado: 'concluida', passos: {} }; dados.puzzles = { cabos: { vezes: 2, melhorNivel: 2, pontosDados: true } };
    return dados;
  });
  const res = await p.evaluate((d) => { const m = AM.SaveSystem._migrar ? AM.SaveSystem._migrar(d, 1) : null; return m; }, mig);
  console.log('migrar exposto?', !!res);
  await p.evaluate(() => AM.Router.novoJogo()); await p.waitForTimeout(1100);
  for (let i = 0; i < 30 && await p.evaluate(() => AM.Modal.aberto()); i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
  await p.evaluate(() => { for (let i = 0; i < 60 * 90; i++) AM.World.atualizar(1 / 60); AM.World.teletransportar(24.5 * 16, 25 * 16); for (let i = 0; i < 40; i++) AM.World.atualizar(1 / 60); });
  await p.waitForTimeout(300); await p.screenshot({ path: S + 's2_vila.png' });
  // dados para telas
  await p.evaluate(() => { AM.Inventory.dar('livro_contos', 1, { silencioso: true }); AM.Inventory.dar('botas', 1, { silencioso: true }); AM.Inventory.dar('madeira', 2, { silencioso: true }); AM.Inventory.dar('apoio_comunidade', 2, { silencioso: true }); AM.Inventory.dar('chave_inglesa', 1, { silencioso: true });
    AM.GameState.dados.descobertos = { praca: true, escola: true, oficina: true }; AM.Knowledge.ganhar('matematica', 35); AM.Knowledge.desbloquear('puzzle:circuito'); AM.GameState.dados.adaptativo.portugues.fracos = { sequencia: 2 }; AM.Quests.iniciar('poco_agua'); AM.GameState.setFlag('pista_biblioteca', true); });
  await p.waitForTimeout(5000);
  for (const [nome, fn] of [['mochila', 'abrirMochila'], ['mapa', 'abrirMapa'], ['conhecimentos', 'abrirConhecimentos'], ['progresso', 'abrirProgresso'], ['diario', 'abrirDiario']]) {
    await p.evaluate((f) => AM.UI[f](), fn); await p.waitForTimeout(250); await p.screenshot({ path: S + 's2_' + nome + '.png' });
    if (nome === 'mapa') { await p.click('text=Mundo'); await p.waitForTimeout(200); await p.screenshot({ path: S + 's2_mundo.png' }); }
    if (nome === 'mochila') { await p.click('text=Ler'); await p.waitForTimeout(200); await p.screenshot({ path: S + 's2_mochila_ler.png' }); }
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  }
  // novos puzzles em todos os níveis
  for (const id of ['feira', 'historia', 'algoritmo', 'reciclagem']) for (const n of [1, 2, 3]) {
    const area = await p.evaluate((id) => AM.Data.puzzles[id].area, id);
    await p.evaluate(([a, n]) => AM.Adaptive.definirManual(a, n), [area, n]);
    await p.evaluate((id) => { window.__pz = AM.Puzzles.abrir(id, { treino: true }); }, id); await p.waitForTimeout(250);
    if (n === 3 || id === 'feira' && n === 2) await p.screenshot({ path: S + `s2_pz_${id}_${n}.png` });
    // resolve via hook
    const ok = await p.evaluate(() => { const c = document.querySelector('.painel.puzzle'); return !!c; });
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    for (let i = 0; i < 3 && await p.evaluate(() => AM.Modal.aberto()); i++) { await p.keyboard.press('Escape'); await p.waitForTimeout(120); }
    console.log(id, n, 'abriu', ok);
  }
  console.log('erros', erros); await b.close();
})();
