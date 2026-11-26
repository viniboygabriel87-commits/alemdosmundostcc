const { chromium, devices } = require('playwright');
const SH = '/tmp/claude-0/shots/';
(async () => {
  const b = await chromium.launch();
  const erros = [];
  // 1) recuperação de backup com toast
  {
    const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); p.setDefaultTimeout(6000);
    p.on('pageerror', e => erros.push(e.message));
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(400);
    await p.click('text=Novo jogo'); await p.waitForTimeout(300);
    await p.evaluate(() => { AM.SaveSystem.salvar('a'); AM.SaveSystem.salvar('b'); });
    await p.reload(); await p.waitForTimeout(400); // fechar a aba também salva automaticamente
    await p.evaluate(() => localStorage.setItem('alem_dos_muros.save', '{"s":"x","b":"lixo"}'));
    await p.reload(); await p.waitForTimeout(400);
    await p.click('text=Continuar'); await p.waitForTimeout(600);
    console.log('toast backup:', await p.evaluate(() => [...document.querySelectorAll('.toast')].map(t => t.textContent)));
    // configurações + remapeamento
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    await p.click('.painel >> text=Configurações'); await p.waitForTimeout(300);
    await p.screenshot({ path: SH + 'config.png' });
    const antes = await p.evaluate(() => AM.Input.teclasDe('interagir'));
    await p.locator('.tecla').nth(4).click(); await p.keyboard.press('KeyF'); await p.waitForTimeout(200);
    console.log('remap interagir:', antes, '->', await p.evaluate(() => AM.Input.teclasDe('interagir')));
    // texto grande + reduzir anim
    await p.click('text=Muito grande'); await p.waitForTimeout(200);
    console.log('font-size html:', await p.evaluate(() => getComputedStyle(document.documentElement).fontSize));
    await p.screenshot({ path: SH + 'config_grande.png' });
    await p.evaluate(() => AM.Settings.set('texto', 1)); await p.evaluate(() => AM.Settings.set('reduzirAnim', true));
    console.log('sem-anim:', await p.evaluate(() => document.documentElement.classList.contains('sem-anim')));
    await p.keyboard.press('Escape'); await p.waitForTimeout(100);
    // progresso
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    await p.click('.painel >> text=Progresso e treino'); await p.waitForTimeout(300);
    await p.screenshot({ path: SH + 'progresso.png' });
    await p.click('text=Avançado >> nth=0'); await p.waitForTimeout(100);
    console.log('nível manual matemática:', await p.evaluate(() => AM.Adaptive.nivel('matematica')));
  }
  // 2) celular retrato com toque
  {
    const ctx = await b.newContext({ ...devices['Pixel 7'] });
    const p = await ctx.newPage(); p.setDefaultTimeout(6000);
    p.on('pageerror', e => erros.push(e.message));
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(500);
    await p.screenshot({ path: SH + 'm_menu.png' });
    await p.tap('text=Novo jogo'); await p.waitForTimeout(1500);
    await p.screenshot({ path: SH + 'm_prologo.png' });
    // avançar o prólogo por toque
    for (let i = 0; i < 10; i++) { await p.tap('.dialogo').catch(() => {}); await p.waitForTimeout(250); }
    await p.waitForTimeout(500);
    await p.screenshot({ path: SH + 'm_jogo.png' });
    await p.evaluate(() => { AM.World.teletransportar(30 * 16, 9.8 * 16 + 10); });
    await p.waitForTimeout(300);
    await p.tap('#tb-a'); await p.waitForTimeout(300);
    for (let i = 0; i < 6; i++) { await p.tap('.dialogo').catch(() => {}); await p.waitForTimeout(200); }
    // Helena primeiro (passo): força estado e abre o circuito direto
    await p.evaluate(() => { AM.Quests.completarPasso('escola_luz', 'falar_helena', { silencioso: true }); });
    await p.evaluate(() => AM.Puzzles.abrir('circuito', {})); await p.waitForTimeout(400);
    await p.screenshot({ path: SH + 'm_circuito.png' });
    await p.evaluate(() => { document.querySelector('.puzzle .btn:last-child').click(); });
    await p.evaluate(() => AM.Puzzles.abrir('energia', { treino: true })); await p.waitForTimeout(300);
    await p.screenshot({ path: SH + 'm_conectar.png' });
    await p.evaluate(() => document.querySelector('.puzzle .btn:last-child').click());
    await p.evaluate(() => AM.Puzzles.abrir('cabos', { treino: true })); await p.waitForTimeout(300);
    await p.screenshot({ path: SH + 'm_medida.png' });
    console.log('toque visível:', await p.evaluate(() => !document.getElementById('toque').hidden));
  }
  // 3) celular paisagem
  {
    const ctx = await b.newContext({ ...devices['Pixel 7 landscape'] });
    const p = await ctx.newPage(); p.setDefaultTimeout(6000);
    p.on('pageerror', e => erros.push(e.message));
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(400);
    await p.tap('text=Novo jogo'); await p.waitForTimeout(1200);
    for (let i = 0; i < 8; i++) { await p.tap('.dialogo').catch(() => {}); await p.waitForTimeout(200); }
    await p.waitForTimeout(300);
    await p.screenshot({ path: SH + 'm_paisagem.png' });
  }
  // 4) arrastar: ordenar e medida com mouse
  {
    const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage(); p.setDefaultTimeout(6000);
    p.on('pageerror', e => erros.push(e.message));
    await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(400);
    await p.click('text=Novo jogo'); await p.waitForTimeout(300);
    await p.evaluate(() => { AM.Router.cena; AM.Puzzles.abrir('bilhete', { treino: true }); }); await p.waitForTimeout(300);
    const antes = await p.evaluate(() => [...document.querySelectorAll('.carta-texto')].map(x => x.textContent.slice(0, 12)));
    const g = p.locator('.carta-grip').nth(3), alvo = p.locator('.carta').nth(0);
    const bg = await g.boundingBox(), bt = await alvo.boundingBox();
    await p.mouse.move(bg.x + 8, bg.y + 8); await p.mouse.down(); await p.mouse.move(bg.x + 8, bt.y + 2, { steps: 8 }); await p.mouse.up();
    const depois = await p.evaluate(() => [...document.querySelectorAll('.carta-texto')].map(x => x.textContent.slice(0, 12)));
    console.log('drag ordenar:', JSON.stringify(antes), '->', JSON.stringify(depois));
    await p.evaluate(() => document.querySelector('.puzzle .btn:last-child').click());
    await p.evaluate(() => AM.Puzzles.abrir('cabos', { treino: true })); await p.waitForTimeout(300);
    const chip = p.locator('.peca').first(), bar = p.locator('.med-barra');
    const bc = await chip.boundingBox(), bb = await bar.boundingBox();
    await p.mouse.move(bc.x + 10, bc.y + 10); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 8 }); await p.mouse.up();
    console.log('drag medida total:', await p.textContent('.med-total'));
    await p.locator('.seg').first().click();
    console.log('remover:', await p.textContent('.med-total'));
    // erro: verificar vazio / curto
    await p.click('text=Verificar'); console.log('feedback:', await p.textContent('.puz-feedback'));
    await p.screenshot({ path: SH + 'medida.png' });
  }
  console.log('ERROS:', erros.join('|') || 'nenhum');
  await b.close();
})().catch(e => { console.error('FALHA', e); process.exit(1); });
