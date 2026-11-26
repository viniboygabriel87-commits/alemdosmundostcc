// Jogada completa automatizada (Playwright): missão inteira, 4 puzzles, melhoria, save/continuar, save corrompido.
const { chromium } = require('playwright');
const SH = '/tmp/claude-0/shots/';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const erros = [];
  p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts/.test(m.text())) erros.push(m.text()); });
  p.on('pageerror', e => erros.push('PAGEERROR: ' + e.message));
  await p.goto('http://localhost:8765/index.html');
  await p.waitForTimeout(500);
  await p.click('text=Novo jogo');
  await p.waitForTimeout(800);

  await p.evaluate(() => {
    window.T = {
      tp(x, y) { AM.World.teletransportar(x, y); },
      estado() { return { passos: Object.keys(AM.GameState.dados.missoes.escola_luz.passos), conc: AM.Quests.concluida('escola_luz'), pontos: AM.GameState.dados.pontos, pos: AM.World.posJogador(), modal: AM.Modal.aberto() }; },
      solver() {
        const corpo = document.querySelector('.puz-corpo'); if (!corpo) return 'sem puzzle';
        const verif = () => [...document.querySelectorAll('.puz-rodape .btn')].find(x => x.textContent.startsWith('Verificar'));
        if (corpo._circuito) { const c = corpo._circuito; c.cels.forEach((row, y) => row.forEach((cel, x) => { if (cel.fixo || cel.sol === null) return; let n = 0; while (c.rot(c.BASE[cel.t], cel.rot) !== c.rot(c.BASE[cel.t], cel.sol) && n++ < 4) c.girar(x, y); })); return 'circuito'; }
        if (corpo._ordenar) { const o = corpo._ordenar; o.ul.querySelectorAll('li').forEach(li => { if (li.dataset.id.startsWith('x')) o.descartar(li.dataset.id); }); o.correta.forEach(id => o.ul.append(o.ul.querySelector(`[data-id="${id}"]`))); verif().click(); return 'ordenar'; }
        if (corpo._medida) { const m = corpo._medida; const titulo = document.querySelector('.puzzle h2').textContent; const def = AM.Data.puzzles.cabos; const nivel = AM.Adaptive.nivel('matematica'); const v = def.variantes[nivel];
          const pecas = v.pecas.map(p => ({ ...p })); let sol = null; (function dfs(i, resto, acc) { if (sol) return; if (resto === 0) { sol = acc.slice(); return; } if (i >= pecas.length) return; for (let k = pecas[i].qtd; k >= 0; k--) { if (k * pecas[i].cm <= resto) { dfs(i + 1, resto - k * pecas[i].cm, acc.concat(Array(k).fill(pecas[i].cm))); } } })(0, v.alvoCm, []);
          sol.forEach(cm => m.adicionar(cm)); verif().click(); return 'medida ' + sol.join('+'); }
        if (corpo._conectar) { const c = corpo._conectar; const itens = [...document.querySelectorAll('.con-item')]; const porTexto = t => itens.find(i => i.textContent.trim() === t.trim());
          c.v.esquerda.forEach(o => { porTexto(o.texto).click(); const d = c.v.direita.find(x => x.id === c.v.pares[o.id]); porTexto(d.texto).click(); }); verif().click(); return 'conectar'; }
        return '?';
      },
    };
  });

  async function e() { await p.keyboard.press('e'); await p.waitForTimeout(60); }
  // avança qualquer diálogo/puzzle até fechar tudo; "escolhas" = índices das opções por ordem
  async function conduzir(escolhas = []) {
    let guard = 0, ie = 0, log = [];
    while (guard++ < 120) {
      const st = await p.evaluate(() => ({ dlg: !!document.querySelector('.dialogo:not([hidden])'), puz: !!document.querySelector('.puzzle'), resolvido: !!document.querySelector('.puz-explicacao:not([hidden])'), opcoes: document.querySelectorAll('.dlg-opcao').length, modal: AM.Modal.aberto(), ativoDlg: AM.Dialogue.ativo }));
      if (!st.modal) break;
      if (st.puz) {
        if (st.resolvido) { await p.screenshot({ path: SH + 'puz_ok_' + log.length + '.png' }); await p.click('.puz-explicacao .btn.primario'); log.push('continuar'); await p.waitForTimeout(150); continue; }
        await p.screenshot({ path: SH + 'puz_' + log.length + '.png' });
        const r = await p.evaluate(() => T.solver()); log.push(r); await p.waitForTimeout(1300); continue;
      }
      if (st.opcoes) { const i = escolhas[ie++] ?? 0; await p.locator('.dlg-opcao').nth(i).click(); await p.waitForTimeout(80); continue; }
      await e(); await p.waitForTimeout(40);
    }
    return log;
  }
  async function ir(x, y, shot) { await p.evaluate(([x, y]) => T.tp(x, y), [x, y]); await p.waitForTimeout(150); if (shot) await p.screenshot({ path: SH + shot }); }

  // prólogo
  await p.waitForTimeout(900);
  console.log('prólogo ->', await conduzir());
  // Helena
  await ir(38 * 16, 14.6 * 16 + 10, 'perto_helena.png'); await e(); await p.waitForTimeout(600); await p.screenshot({ path: SH + 'dialogo_helena.png' });
  console.log('helena ->', await conduzir([0, 0]));
  console.log(JSON.stringify(await p.evaluate(() => T.estado())));
  // Quadro (circuito)
  await ir(30 * 16, 9.8 * 16 + 10); await e(); console.log('quadro ->', await conduzir());
  // Gabriel
  await ir(10 * 16, 14.6 * 16 + 10); await e(); console.log('gabriel ->', await conduzir([0, 0]));
  // Lia
  await ir(22.2 * 16, 21.6 * 16 + 10); await e(); console.log('lia ->', await conduzir([0]));
  console.log(JSON.stringify(await p.evaluate(() => T.estado())));
  // Ativar no quadro
  await ir(30 * 16, 9.8 * 16 + 10); await e(); console.log('ativar ->', await conduzir([0]));
  await p.waitForTimeout(2200); await p.screenshot({ path: SH + 'cut_escola.png' });
  await p.waitForTimeout(3500); await p.screenshot({ path: SH + 'escola_acesa.png' });
  // Helena final
  await ir(38 * 16, 14.6 * 16 + 10); await e(); console.log('helena final ->', await conduzir([0]));
  await p.waitForTimeout(2500); await p.screenshot({ path: SH + 'vila_melhorando.png' });
  await p.waitForTimeout(5000); await p.screenshot({ path: SH + 'vila_final.png' });
  const fim = await p.evaluate(() => T.estado());
  console.log('FIM', JSON.stringify(fim));

  // salvar/continuar: posição exata
  await ir(25 * 16 + 3.3, 24 * 16 + 1.7);
  await p.waitForTimeout(100);
  const antes = await p.evaluate(() => { AM.SaveSystem.salvar('teste'); return AM.World.posJogador(); });
  await p.reload(); await p.waitForTimeout(600);
  await p.screenshot({ path: SH + 'menu_com_save.png' });
  await p.click('text=Continuar'); await p.waitForTimeout(500);
  const depois = await p.evaluate(() => ({ ...AM.World.posJogador(), conc: AM.Quests.concluida('escola_luz'), melhorias: AM.GameState.dados.melhorias }));
  console.log('posição antes/depois', JSON.stringify(antes), JSON.stringify(depois));
  await p.screenshot({ path: SH + 'continuado.png' });

  // save corrompido -> backup
  await p.evaluate(() => { AM.SaveSystem.salvar('a'); AM.SaveSystem.salvar('b'); localStorage.setItem('alem_dos_muros.save', '{"s":"x","b":"lixo"}'); });
  await p.reload(); await p.waitForTimeout(500);
  await p.click('text=Continuar'); await p.waitForTimeout(500);
  console.log('backup recuperado:', await p.evaluate(() => AM.Quests.concluida('escola_luz')), await p.evaluate(() => document.querySelector('.toast') && document.querySelector('.toast').textContent));
  // ambos corrompidos
  await p.evaluate(() => { AM.Router.irParaMenu(); localStorage.setItem('alem_dos_muros.save', 'lixo'); localStorage.setItem('alem_dos_muros.save.bak', '{"x":1}'); });
  await p.reload(); await p.waitForTimeout(500);
  await p.click('text=Continuar'); await p.waitForTimeout(300);
  console.log('ambos corrompidos -> toast:', await p.evaluate(() => document.querySelector('.toast') && document.querySelector('.toast').textContent), 'cena:', await p.evaluate(() => AM.Router.cena));
  console.log('ERROS:', erros.join('\n') || 'nenhum');
  await b.close();
})().catch(e => { console.error('FALHA', e); process.exit(1); });
