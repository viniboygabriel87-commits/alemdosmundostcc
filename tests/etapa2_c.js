const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 620 } });
  const erros = []; p.on('pageerror', (e) => erros.push('PAGE ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load/.test(m.text())) erros.push(m.text()); });
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(500);
  await p.evaluate(() => AM.Router.novoJogo());
  for (let i = 0; i < 30 && await p.evaluate(() => AM.Modal.aberto()); i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(150); }
  const R = async (f, a) => p.evaluate(f, a);
  // 1) conclui a missão principal pela API
  await R(() => { ['falar_helena','inspecionar_quadro','falar_gabriel','calcular_cabos','bilhete_comunidade','ativar_energia','concluir_helena'].forEach((s) => AM.Quests.completarPasso('escola_luz', s)); });
  await R(() => { for (let i = 0; i < 60 * 40 && (AM.World.cutAtivo() || i < 5); i++) AM.World.atualizar(1 / 60); });
  console.log('1 concluida', await R(() => AM.Quests.concluida('escola_luz')), 'apoio', await R(() => AM.Inventory.qtd('apoio_comunidade')), 'melhorias', await R(() => Object.keys(AM.GameState.dados.melhorias)));
  // 2) livros: teletransporta até cada item e interage
  const pega = async (id) => { const pos = await R((id) => { const c = AM.Data.mapa.coletaveis.find((x) => x.id === id); AM.World.teletransportar(c.x * 16, c.y * 16 + 8); return [c.x, c.y]; }, id);
    await p.waitForTimeout(120); await R(() => AM.World.atualizar(0.05)); const alvo = await R(() => AM.World.alvo() && AM.World.alvo().id); await R(() => AM.World.interagir()); return alvo; };
  await R(() => AM.Quests.iniciar('livros_do_canto'));
  for (const id of ['c_livro_contos','c_livro_atlas','c_livro_ciencias']) console.log('pegar', id, await pega(id));
  console.log('2 passo guardar', await R(() => AM.Quests.passoEstado('livros_do_canto', 'guardar_livros')), 'livros', await R(() => ['livro_contos','livro_atlas','livro_ciencias'].map((i) => AM.Inventory.qtd(i))));
  // 3) guardar no cantinho via diálogo
  await R(() => { AM.World.teletransportar(34.2 * 16, 15.2 * 16 + 14); });
  await p.waitForTimeout(100); await R(() => AM.World.atualizar(0.05));
  console.log('alvo canto', await R(() => AM.World.alvo() && AM.World.alvo().id));
  await R(() => AM.World.interagir()); await p.waitForTimeout(300);
  for (let i = 0; i < 20 && await R(() => AM.Modal.aberto()); i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(120); }
  console.log('3 livros concluida', await R(() => AM.Quests.concluida('livros_do_canto')), 'estante', await R(() => !!AM.GameState.dados.melhorias.estante_cheia), 'matematica livro', await R(() => AM.Inventory.qtd('livro_matematica')), 'dominio port', await R(() => AM.Knowledge.pontos('portugues')));
  // 4) poço
  await R(() => { AM.Quests.iniciar('poco_agua'); AM.Inventory.dar('chave_inglesa'); });
  for (const id of ['c_madeira','c_parafusos','c_corda']) console.log('pegar', id, await pega(id));
  console.log('4a passo calcular', await R(() => AM.Quests.passoEstado('poco_agua', 'calcular_corda')));
  await R(() => AM.Quests.completarPasso('poco_agua', 'calcular_corda'));
  await R(() => { AM.World.teletransportar(1,1); });
  // posiciona jogador ao lado do Gabriel e interage
  await R(() => { for (let i=0;i<60*120;i++) AM.World.atualizar(1/60); const g = AM.World.npcPos('gabriel'); AM.World.teletransportar(g.x, g.y + 14); AM.World.atualizar(0.05); });
  console.log('alvo', await R(() => AM.World.alvo() && AM.World.alvo().id));
  await R(() => AM.World.interagir());
  for (let i = 0; i < 12 && await R(() => AM.Modal.aberto()); i++) { await p.keyboard.press('Enter'); await p.waitForTimeout(150); if (i === 1) { /* escolhe 'Consertar agora' */ await p.keyboard.press('Enter'); } }
  await p.waitForTimeout(300);
  console.log('4b poco concluida', await R(() => AM.Quests.concluida('poco_agua')), 'botas', await R(() => AM.Inventory.qtd('botas')), 'melhoria', await R(() => !!AM.GameState.dados.melhorias.poco_funcionando), 'materiais', await R(() => ['madeira','parafusos','corda','apoio_comunidade'].map((i) => AM.Inventory.qtd(i))));
  // 5) equipar botas
  await R(() => AM.Inventory.equipar('botas', true)); console.log('5 mult vel', await R(() => AM.Inventory.mult('vel')));
  // 6) puzzle auto + conhecimento
  await R(() => { AM.World.atualizar(0.05); });
  console.log('6 escolhas', await R(() => { const o = {}; AM.Config.AREAS.forEach((a) => (o[a] = [1,2,3,4,5,6].map(() => AM.Adaptive.escolherDesafio(a)).join('/'))); return o; }));
  // 7) save v2 → recarregar
  console.log('7 salvar', await R(() => AM.SaveSystem.salvar('teste')));
  await p.reload(); await p.waitForTimeout(600);
  console.log('7 continuar', await R(() => { AM.Router.continuar(); return AM.GameState.dados.inventario.itens; }));
  console.log('erros', erros); await b.close();
})();
