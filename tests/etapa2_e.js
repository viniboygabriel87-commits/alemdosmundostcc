const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 640 } });
  const erros = []; p.on('pageerror', (e) => erros.push('PAGE ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) erros.push(m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(500);
  // 1) migração: grava um save v1 (sem os campos novos) e continua
  const mig = await p.evaluate(() => {
    AM.GameState.novo(); const d = JSON.parse(JSON.stringify(AM.GameState.dados));
    ['inventario', 'conhecimento', 'registro', 'coletados', 'descobertos'].forEach((k) => delete d[k]);
    d.missoes.escola_luz = { estado: 'concluida', passos: { falar_helena: true } }; d.puzzles = { cabos: { vezes: 2, melhorNivel: 2, pontosDados: true } }; d.pontos = 77;
    const corpo = JSON.stringify({ v: 1, t: Date.now(), d });
    const fnv = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16); };
    localStorage.setItem(AM.Config.CHAVE_SAVE, JSON.stringify({ s: fnv(corpo), b: corpo }));
    return true;
  });
  const r = await p.evaluate(() => { const x = AM.SaveSystem.carregar(true); return { ok: x.ok, erro: x.erro, inv: x.dados && x.dados.inventario, con: x.dados && x.dados.conhecimento, pts: x.dados && x.dados.pontos }; });
  console.log('migracao v1→v2', JSON.stringify(r));
  await p.evaluate(() => AM.Router.continuar()); await p.waitForTimeout(1200);
  // 2) resolve cada novo desafio em cada nível pelo solver
  await p.evaluate(() => {
    window.solve = () => { const corpo = document.querySelector('.puz-corpo'); const verif = () => [...document.querySelectorAll('.puz-rodape .btn')].find((x) => x.textContent.startsWith('Verificar'));
      if (corpo._ordenar) { const o = corpo._ordenar; o.ul.querySelectorAll('li').forEach((li) => { if (li.dataset.id.startsWith('x')) o.descartar(li.dataset.id); }); o.correta.forEach((id) => o.ul.append(o.ul.querySelector(`[data-id="${id}"]`))); verif().click(); return 'ordenar'; }
      if (corpo._conectar) { const c = corpo._conectar; const itens = [...document.querySelectorAll('.con-item')]; const por = (t) => itens.find((i) => i.textContent.trim() === t.trim()); c.v.esquerda.forEach((o) => { por(o.texto).click(); por(c.v.direita.find((x) => x.id === c.v.pares[o.id]).texto).click(); }); verif().click(); return 'conectar'; } return '?'; };
  });
  const antes = await p.evaluate(() => ({ pts: AM.GameState.dados.pontos, k: JSON.parse(JSON.stringify(AM.GameState.dados.conhecimento)) }));
  for (const id of ['feira', 'historia', 'algoritmo', 'reciclagem']) for (const n of [1, 2, 3]) {
    const area = await p.evaluate((id) => AM.Data.puzzles[id].area, id);
    await p.evaluate(([a, n]) => AM.Adaptive.definirManual(a, n), [area, n]);
    await p.evaluate((id) => { window.__pz = AM.Puzzles.abrir(id, { treino: true }); }, id); await p.waitForTimeout(250);
    const tipo = await p.evaluate(() => window.solve()); await p.waitForTimeout(250);
    const exp = await p.evaluate(() => !!document.querySelector('.puz-explicacao:not([hidden])'));
    await p.evaluate(() => { const b = [...document.querySelectorAll('.puzzle .btn')].find((x) => /Continuar|Fechar|Concluir/.test(x.textContent)); if (b) b.click(); }); await p.waitForTimeout(200);
    for (let i = 0; i < 3 && await p.evaluate(() => AM.Modal.aberto()); i++) { await p.keyboard.press('Escape'); await p.waitForTimeout(120); }
    console.log(id, n, tipo, 'explicacao', exp);
  }
  const dep = await p.evaluate(() => ({ pts: AM.GameState.dados.pontos, k: AM.GameState.dados.conhecimento, reg: Object.keys(AM.GameState.dados.registro), ult: AM.Config.AREAS.map((a) => AM.GameState.dados.adaptativo[a].ultimo) }));
  console.log('antes', JSON.stringify(antes), '\ndepois', JSON.stringify(dep));
  console.log('erros', erros); await b.close();
})();
