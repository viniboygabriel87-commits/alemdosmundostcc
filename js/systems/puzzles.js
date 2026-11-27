/* ALÉM DOS MUROS — PuzzleManager: janela de desafio (dicas, feedback, explicação) + 4 mecânicas interativas:
   circuito (girar peças), ordenar (arrastar cartas), medida (montar o cabo), conectar (ligar pares). */
(function () {
  'use strict';
  const AM = window.AM, U = AM.util, el = U.el, C = AM.Config;

  const P = (AM.Puzzles = {
    tipos: {},
    registrar(tipo, fabrica) { this.tipos[tipo] = fabrica; },
    atual: null,

    /** Abre um desafio. Retorna Promise<{resolvido}>. opts.treino: prática (não avança missão). */
    abrir(id, opts = {}) {
      // "auto:area" escolhe no banco da área, pelo sistema adaptativo
      if (typeof id === 'string' && id.startsWith('auto:')) id = AM.Adaptive.escolherDesafio(id.slice(5));
      const def = AM.Data.puzzles[id];
      if (!def) return Promise.resolve({ resolvido: false });
      const treino = !!opts.treino;
      const { nivel, variante } = AM.Adaptive.escolher(def.area, def);
      const reforco = AM.Adaptive.precisaReforco(def.area);

      return new Promise((resolve) => {
        let erros = 0, dicas = 0, tentativas = 0, resolvido = false, verificarFn = null;
        const inicio = performance.now();

        const fb = el('p', { class: 'puz-feedback', role: 'status' });
        const dicaBox = el('p', { class: 'puz-dica', hidden: true });
        const corpo = el('div', { class: 'puz-corpo' });
        const expl = el('section', { class: 'puz-explicacao', hidden: true });
        const btnDica = el('button', { class: 'btn', type: 'button', onclick: () => pedirDica() });
        const btnVer = el('button', { class: 'btn primario', type: 'button', onclick: () => verificarFn && verificarFn() }, 'Verificar');
        const btnSair = el('button', { class: 'btn', type: 'button', onclick: () => sair() }, 'Sair');
        const rodape = el('footer', { class: 'puz-rodape' }, btnDica, btnVer, btnSair);
        const painel = el('div', { class: 'painel puzzle', role: 'dialog', 'aria-modal': 'true', 'aria-label': def.titulo },
          el('header', { class: 'puz-cab' },
            el('h2', { texto: def.titulo }),
            el('span', { class: 'selo area-' + def.area, texto: C.AREA_NOME[def.area] }),
            el('span', { class: 'selo', texto: 'Nível: ' + C.NIVEL_NOME[nivel] }),
            treino ? el('span', { class: 'selo treino', texto: 'Treino' }) : null),
          el('p', { class: 'enunciado', texto: variante.enunciado }),
          corpo, dicaBox, fb, expl, rodape);
        const overlay = el('div', { class: 'overlay' }, painel);
        AM.UI.camada().append(overlay);

        const api = {
          nivel, variante, def, _acao: null,
          mensagem(txt, tipo) { fb.textContent = txt; fb.className = 'puz-feedback ' + (tipo || ''); },
          erro(txt) { erros++; tentativas++; AM.Audio.sfx('erro'); this.mensagem(txt, 'erro'); },
          adicionarErros(n) { erros += n; },
          semVerificar() { btnVer.hidden = true; },
          definirVerificar(fn) { verificarFn = fn; },
          resolver() {
            if (resolvido) return;
            resolvido = true; tentativas++;
            const tempoMs = performance.now() - inicio;
            const res = AM.Adaptive.registrar(def.area, { puzzleId: id, nivel, erros, dicas, tentativas, tempoMs, tag: variante.tag || def.tag, tempoEsperadoMs: (def.tempoEsperado[nivel] || 60) * 1000, dominio: erros === 0 && dicas === 0 });
            const reg = AM.GameState.dados.puzzles[id] = AM.GameState.dados.puzzles[id] || { vezes: 0, melhorNivel: 0, pontosDados: false };
            reg.vezes++; reg.melhorNivel = Math.max(reg.melhorNivel, nivel);
            let ganho = 0;
            const repeticao = reg.pontosDados;
            if (!reg.pontosDados) { reg.pontosDados = true; ganho = 10 * nivel; AM.GameState.dados.pontos += ganho; }
            // progressão de domínio da área: o primeiro acerto vale mais; repetir (treino) ainda ensina, com ganho menor
            AM.Knowledge.ganhar(def.area, repeticao ? AM.Data.dominio.pontosRepeticao * nivel : ganho);
            AM.Knowledge.desbloquear('puzzle:' + id);
            AM.GameState.marcar();
            AM.Audio.sfx('ok');
            corpo.classList.add('resolvido');
            rodape.hidden = true; fb.textContent = ''; dicaBox.hidden = true;
            const resumo = [`${tentativas} ${tentativas === 1 ? 'tentativa' : 'tentativas'}`, `${dicas} ${dicas === 1 ? 'dica usada' : 'dicas usadas'}`];
            const kids = [
              el('h3', { texto: erros === 0 && dicas === 0 ? 'Muito bem! Você resolveu sozinho.' : 'Resolvido! Errar e tentar de novo faz parte de aprender.' }),
              el('p', { class: 'puz-resumo', texto: resumo.join(' · ') + (ganho ? ` · +${ganho} pontos de conhecimento` : '') }),
              ...variante.explicacao.map((t) => el('p', { texto: t })),
            ];
            if ((erros >= 3 || dicas >= 2) && variante.reforco) kids.push(el('p', { class: 'puz-reforco', texto: variante.reforco }));
            if (res.mudou === 'subiu') kids.push(el('p', { class: 'puz-adapt', texto: `Você está dominando ${C.AREA_NOME[def.area]}! Os próximos desafios dessa área serão um pouco mais difíceis. Você pode ajustar o nível no menu, em Progresso.` }));
            if (res.mudou === 'desceu') kids.push(el('p', { class: 'puz-adapt', texto: `Vamos reforçar ${C.AREA_NOME[def.area]} com desafios mais guiados. Tudo bem: cada desafio é uma chance de aprender.` }));
            const cont = el('button', { class: 'btn primario', type: 'button', onclick: () => fechar(true) }, 'Continuar');
            expl.replaceChildren(...kids, el('div', { class: 'puz-acoes' }, cont));
            expl.hidden = false;
            cont.focus();
            try { expl.scrollIntoView({ block: 'nearest' }); } catch (e) { /* ignora */ }
            AM.SaveSystem.salvar('puzzle');
          },
        };

        function atualizarDica() { const rest = variante.dicas.length - dicas; btnDica.textContent = rest > 0 ? `Dica (${rest})` : 'Sem mais dicas'; btnDica.disabled = rest <= 0; }
        function pedirDica() {
          if (dicas >= variante.dicas.length) return;
          dicaBox.textContent = `Dica ${dicas + 1} de ${variante.dicas.length}: ${variante.dicas[dicas]}`;
          dicaBox.hidden = false; dicas++; AM.Audio.sfx('dica'); atualizarDica();
        }
        function sair() { if (!resolvido) fechar(false); }
        const modal = { id: 'puzzle', acao(a) { if (a === 'pausa') sair(); else if (api._acao) api._acao(a); } };
        function fechar(ok) {
          overlay.remove(); AM.Modal.pop(modal); P.atual = null;
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          AM.Audio.sfx('fechar');
          resolve({ resolvido: ok, id });
        }

        P.atual = modal; AM.Modal.push(modal); AM.Audio.sfx('abrir');
        atualizarDica();
        P.tipos[def.tipo](corpo, variante, api);
        if (reforco && !treino) { dicaBox.textContent = 'Apoio: ' + variante.dicas[0]; dicaBox.hidden = false; }
        painel.setAttribute('tabindex', '-1'); painel.focus();
      });
    },
  });

  /* ═════════ 1) CIRCUITO ═════════ */
  P.registrar('circuito', (corpo, v, api) => {
    const N = 1, E = 2, S = 4, W = 8, DIRS = [[N, 0, -1, S], [E, 1, 0, W], [S, 0, 1, N], [W, -1, 0, E]];
    const BASE = { S: N, B: N, I: N | S, L: N | E, T: N | E | W, X: 15, '.': 0 };
    const rot = (m, k) => { for (let i = 0; i < k; i++) m = ((m << 1) & 15) | (m >> 3); return m; };
    const linhas = v.grade.map((r) => r.split(' ')), R = linhas.length, Cn = linhas[0].length;
    const cels = linhas.map((r) => r.map((tok) => {
      const t = tok[0], ch = tok[1];
      return { t, sol: ch === '*' || ch === undefined ? null : +ch, rot: 0, fixo: t === 'S' || t === 'B' || t === '.' };
    }));
    const mask = (c) => rot(BASE[c.t], c.rot);
    function acesas() {
      const lit = new Set(), q = [];
      cels.forEach((row, y) => row.forEach((c, x) => { if (c.t === 'S') { lit.add(y * Cn + x); q.push([x, y]); } }));
      while (q.length) {
        const [x, y] = q.shift(), m = mask(cels[y][x]);
        for (const [bit, dx, dy, opp] of DIRS) {
          if (!(m & bit)) continue;
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= Cn || ny >= R) continue;
          if (lit.has(ny * Cn + nx)) continue;
          if (mask(cels[ny][nx]) & opp) { lit.add(ny * Cn + nx); q.push([nx, ny]); }
        }
      }
      return lit;
    }
    const bulbos = []; cels.forEach((row, y) => row.forEach((c, x) => { if (c.t === 'B') bulbos.push(y * Cn + x); }));
    const resolvido = () => { const l = acesas(); return bulbos.every((b) => l.has(b)); };
    const rnd = U.rng((Date.now() >>> 3) & 0xffff);
    for (let tent = 0; tent < 50; tent++) {
      cels.forEach((row) => row.forEach((c) => {
        if (c.fixo) c.rot = c.sol || 0;
        else if (c.sol !== null) c.rot = (c.sol + 1 + Math.floor(rnd() * 3)) % 4;
        else c.rot = Math.floor(rnd() * 4);
      }));
      if (!resolvido()) break;
    }
    let minMov = 0;
    cels.forEach((row) => row.forEach((c) => {
      if (c.fixo || c.sol === null) return;
      for (let k = 0; k < 4; k++) if (rot(BASE[c.t], c.rot + k) === rot(BASE[c.t], c.sol)) { minMov += k; break; }
    }));
    let movimentos = 0, cursor = { x: 0, y: 0 }, venceu = false;

    const cel = Math.max(44, Math.min(84, Math.floor(Math.min(window.innerWidth - 56, 560) / Cn)));
    const cv = el('canvas', { class: 'circ-canvas', width: Cn * cel, height: R * cel, tabindex: '0', 'aria-label': 'Quadro de energia: use as setas e Enter para girar as peças' });
    cv.style.width = Cn * cel + 'px'; cv.style.height = R * cel + 'px';
    corpo.append(el('div', { class: 'circ-wrap' }, cv));
    api.semVerificar();
    const g = cv.getContext('2d');

    function desenhar() {
      const lit = acesas();
      g.clearRect(0, 0, cv.width, cv.height);
      cels.forEach((row, y) => row.forEach((c, x) => {
        const px = x * cel, py = y * cel, cx = px + cel / 2, cy = py + cel / 2, on = lit.has(y * Cn + x);
        g.fillStyle = c.t === '.' ? '#141a24' : '#1e2736'; g.fillRect(px + 1, py + 1, cel - 2, cel - 2);
        g.strokeStyle = '#2d3a50'; g.strokeRect(px + 1.5, py + 1.5, cel - 3, cel - 3);
        if (c.t === '.') return;
        const m = mask(c), w = Math.round(cel * 0.16);
        g.fillStyle = on ? '#ffd45e' : '#6c7a8d';
        for (const [bit, dx, dy] of DIRS) if (m & bit) g.fillRect(dx === 0 ? cx - w / 2 : dx > 0 ? cx : px, dy === 0 ? cy - w / 2 : dy > 0 ? cy : py, dx === 0 ? w : cel / 2, dy === 0 ? w : cel / 2);
        g.beginPath(); g.arc(cx, cy, w * 0.75, 0, 7); g.fill();
        if (on) { g.fillStyle = 'rgba(255,212,94,0.18)'; for (const [bit, dx, dy] of DIRS) if (m & bit) g.fillRect(dx === 0 ? cx - w : dx > 0 ? cx : px, dy === 0 ? cy - w : dy > 0 ? cy : py, dx === 0 ? w * 2 : cel / 2, dy === 0 ? w * 2 : cel / 2); }
        if (c.t === 'S') {
          g.fillStyle = '#4cc3b0'; g.fillRect(cx - cel * 0.2, cy - cel * 0.2, cel * 0.4, cel * 0.4);
          g.fillStyle = '#12161d'; g.font = `bold ${Math.round(cel * 0.3)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('+', cx, cy + 1);
        } else if (c.t === 'B') {
          const r = cel * 0.22;
          if (on) { const gr = g.createRadialGradient(cx, cy, 0, cx, cy, cel * 0.6); gr.addColorStop(0, 'rgba(255,240,160,0.9)'); gr.addColorStop(1, 'rgba(255,200,80,0)'); g.fillStyle = gr; g.fillRect(px, py, cel, cel); }
          g.fillStyle = on ? '#fff1a8' : '#3b4452'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
          g.strokeStyle = on ? '#b8860b' : '#6c7a8d'; g.lineWidth = 2; g.stroke();
        }
        if (!c.fixo && c.sol !== null) { /* peça do caminho: sem dica visual, para não entregar a resposta */ }
      }));
      g.lineWidth = 3; g.strokeStyle = '#f5b942';
      if (document.activeElement === cv) g.strokeRect(cursor.x * cel + 3, cursor.y * cel + 3, cel - 6, cel - 6);
    }
    function girar(x, y) {
      const c = cels[y] && cels[y][x];
      if (!c || c.fixo || venceu) return;
      c.rot = (c.rot + 1) % 4; movimentos++; AM.Audio.sfx('girar'); desenhar();
      if (resolvido()) {
        venceu = true; desenhar();
        api.mensagem('A corrente fechou o circuito!', 'ok');
        api.adicionarErros(Math.max(0, Math.floor((movimentos - 2 * minMov) / 4)));
        setTimeout(() => api.resolver(), 900);
      }
    }
    cv.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect(), x = Math.floor(((e.clientX - r.left) / r.width) * Cn), y = Math.floor(((e.clientY - r.top) / r.height) * R);
      cursor = { x, y }; girar(x, y); cv.focus();
    });
    cv.addEventListener('focus', desenhar); cv.addEventListener('blur', desenhar);
    api._acao = (a) => {
      if (a === 'cima') cursor.y = Math.max(0, cursor.y - 1);
      else if (a === 'baixo') cursor.y = Math.min(R - 1, cursor.y + 1);
      else if (a === 'esquerda') cursor.x = Math.max(0, cursor.x - 1);
      else if (a === 'direita') cursor.x = Math.min(Cn - 1, cursor.x + 1);
      else if (a === 'interagir') girar(cursor.x, cursor.y);
      desenhar();
    };
    desenhar();
    cv.focus();
    // utilitário de teste/diagnóstico (não usado no jogo)
    api._teste = { cels, resolvido, girar, R, Cn, rot, BASE, minMov };
    corpo._circuito = api._teste;
  });

  /* ═════════ 2) ORDENAR (cartas) ═════════ */
  P.registrar('ordenar', (corpo, v, api) => {
    const reais = v.cartas.map((t, i) => ({ id: 'c' + i, texto: t, intruso: false }));
    const intrusos = (v.intrusos || []).map((t, i) => ({ id: 'x' + i, texto: t, intruso: true }));
    const todas = reais.concat(intrusos), correta = reais.map((c) => c.id);
    let ordem = U.embaralhar(todas);
    for (let i = 0; i < 30 && ordem.filter((c) => !c.intruso).map((c) => c.id).join() === correta.join(); i++) ordem = U.embaralhar(todas);
    const descartadas = new Set();
    const ul = el('ul', { class: 'ord-lista', 'aria-label': 'Cartas do bilhete' });
    const desc = el('div', { class: 'ord-descartes', hidden: true });
    const temIntruso = intrusos.length > 0;
    corpo.append(ul);
    if (temIntruso) corpo.append(desc);
    const porId = Object.fromEntries(todas.map((c) => [c.id, c]));
    const ordemDom = () => [...ul.children].map((li) => li.dataset.id);

    function mover(li, dir) {
      if (dir < 0 && li.previousElementSibling) ul.insertBefore(li, li.previousElementSibling);
      else if (dir > 0 && li.nextElementSibling) ul.insertBefore(li.nextElementSibling, li);
      AM.Audio.sfx('clique'); li.querySelector('.carta-texto').focus();
    }
    function criarCarta(c) {
      const li = el('li', { class: 'carta', 'data-id': c.id });
      const grip = el('span', { class: 'carta-grip', 'aria-hidden': 'true', texto: '⠿' });
      const txt = el('span', { class: 'carta-texto', tabindex: '0', texto: c.texto });
      const sobe = el('button', { class: 'mini', type: 'button', 'aria-label': 'Subir carta', onclick: () => mover(li, -1) }, '▲');
      const desce = el('button', { class: 'mini', type: 'button', 'aria-label': 'Descer carta', onclick: () => mover(li, 1) }, '▼');
      const btns = [sobe, desce];
      if (temIntruso) btns.push(el('button', { class: 'mini descartar', type: 'button', onclick: () => descartar(c.id) }, 'Descartar'));
      li.append(grip, txt, el('span', { class: 'carta-btns' }, ...btns));
      grip.addEventListener('pointerdown', (e) => {
        e.preventDefault(); grip.setPointerCapture(e.pointerId); li.classList.add('arrastando');
        const mv = (ev) => {
          const outros = [...ul.children].filter((x) => x !== li);
          let ref = null;
          for (const o of outros) { const r = o.getBoundingClientRect(); if (ev.clientY < r.top + r.height / 2) { ref = o; break; } }
          ul.insertBefore(li, ref);
        };
        const up = () => { li.classList.remove('arrastando'); grip.removeEventListener('pointermove', mv); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', up); AM.Audio.sfx('clique'); };
        grip.addEventListener('pointermove', mv); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', up);
      });
      txt.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); mover(li, -1); } else if (e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); mover(li, 1); } });
      return li;
    }
    function renderDescartes() {
      desc.hidden = descartadas.size === 0;
      desc.replaceChildren(el('strong', { texto: 'Descartadas:' }), ...[...descartadas].map((id) => el('span', { class: 'desc-item' }, porId[id].texto, el('button', { class: 'mini', type: 'button', onclick: () => restaurar(id) }, 'Restaurar'))));
    }
    function descartar(id) { const li = ul.querySelector(`[data-id="${id}"]`); if (li) li.remove(); descartadas.add(id); AM.Audio.sfx('pegar'); renderDescartes(); }
    function restaurar(id) { descartadas.delete(id); ul.append(criarCarta(porId[id])); renderDescartes(); }
    ordem.forEach((c) => ul.append(criarCarta(c)));

    api.definirVerificar(() => {
      const idsDescartados = [...descartadas].sort().join(), idsIntrusos = intrusos.map((c) => c.id).sort().join();
      if (temIntruso && idsDescartados !== idsIntrusos) {
        if ([...descartadas].some((id) => !porId[id].intruso)) api.erro('Uma das cartas descartadas faz parte do bilhete. Restaure-a.');
        else api.erro('Alguma frase foge do assunto do bilhete. Tente descartá-la.');
        return;
      }
      const atual = ordemDom();
      const certas = atual.filter((id, i) => id === correta[i]).length;
      if (certas === correta.length) { api.mensagem('O bilhete está completo!', 'ok'); api.resolver(); }
      else api.erro(`${certas} de ${correta.length} cartas estão no lugar certo. Leia o bilhete do começo ao fim e ajuste.`);
    });
    corpo._ordenar = { correta, ul, descartar, ordemDom };
  });

  /* ═════════ 3) MEDIDA (montar o cabo) ═════════ */
  P.registrar('medida', (corpo, v, api) => {
    const pecas = v.pecas.map((p) => ({ cm: p.cm, qtd: p.qtd, usados: 0 }));
    const cabo = [];
    const escala = Math.max(v.alvoCm * 1.25, 100);
    const fmt = (cm) => U.fmtMetros(cm) + ' m';
    const info = el('p', { class: 'med-info', texto: v.mostrarAlvo ? `Meta: ${fmt(v.alvoCm)}` : 'Descubra o comprimento certo e monte o cabo.' });
    const barra = el('div', { class: 'med-barra', role: 'group', 'aria-label': 'Cabo montado' });
    const regua = el('div', { class: 'med-regua', 'aria-hidden': 'true' });
    for (let m = 0; m * 100 <= escala; m++) regua.append(el('span', { estilo: { left: (m * 100 / escala) * 100 + '%' }, texto: m + ' m' }));
    const marca = v.mostrarAlvo ? el('div', { class: 'med-alvo', estilo: { left: (v.alvoCm / escala) * 100 + '%' }, 'aria-hidden': 'true' }) : null;
    const trilho = el('div', { class: 'med-trilho' }, barra);
    if (marca) trilho.append(marca);
    const total = el('p', { class: 'med-total', 'aria-live': 'polite' });
    const bandeja = el('div', { class: 'med-bandeja' });
    corpo.append(info, el('div', { class: 'med-area' }, trilho, regua), total, bandeja);
    const soma = () => cabo.reduce((a, c) => a + c, 0);

    function render() {
      barra.replaceChildren(...cabo.map((cm, i) => el('button', {
        class: 'seg', type: 'button', 'aria-label': `Remover pedaço de ${fmt(cm)}`, estilo: { flexBasis: (cm / escala) * 100 + '%' }, onclick: () => remover(i),
      }, el('span', { texto: U.fmtMetros(cm) }))));
      const s = soma();
      total.textContent = `Total: ${fmt(s)}`;
      total.classList.toggle('passou', s > v.alvoCm);
      bandeja.replaceChildren(...pecas.map((p) => {
        const rest = p.qtd - p.usados;
        const b = el('button', { class: 'peca', type: 'button', disabled: rest <= 0, 'aria-label': `Pedaço de ${fmt(p.cm)}, restam ${rest}` },
          el('strong', { texto: fmt(p.cm) }), el('small', { texto: '×' + rest }));
        b.addEventListener('click', (e) => { if (e.detail === 0) adicionar(p); }); // teclado
        b.addEventListener('pointerdown', (e) => arrastar(e, p, b));
        return b;
      }));
    }
    function adicionar(p) { if (p.usados >= p.qtd) return; p.usados++; cabo.push(p.cm); AM.Audio.sfx('pegar'); api.mensagem('', ''); render(); }
    function remover(i) { const cm = cabo.splice(i, 1)[0]; pecas.find((p) => p.cm === cm && p.usados > 0).usados--; AM.Audio.sfx('clique'); render(); }
    function arrastar(e, p, b) {
      if (b.disabled) return;
      const x0 = e.clientX, y0 = e.clientY; let ghost = null, mexeu = false;
      b.setPointerCapture(e.pointerId);
      const mv = (ev) => {
        if (!mexeu && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) { mexeu = true; ghost = b.cloneNode(true); ghost.classList.add('fantasma'); document.body.append(ghost); }
        if (ghost) { ghost.style.left = ev.clientX - 30 + 'px'; ghost.style.top = ev.clientY - 20 + 'px'; const r = barra.getBoundingClientRect(); barra.classList.toggle('alvo-solta', ev.clientX > r.left - 10 && ev.clientX < r.right + 10 && ev.clientY > r.top - 24 && ev.clientY < r.bottom + 24); }
      };
      const up = (ev) => {
        b.removeEventListener('pointermove', mv); b.removeEventListener('pointerup', up); b.removeEventListener('pointercancel', up);
        barra.classList.remove('alvo-solta');
        if (ghost) { ghost.remove(); const r = barra.getBoundingClientRect(); if (ev.type === 'pointerup' && ev.clientX > r.left - 10 && ev.clientX < r.right + 10 && ev.clientY > r.top - 24 && ev.clientY < r.bottom + 24) adicionar(p); }
        else if (ev.type === 'pointerup') adicionar(p);
      };
      b.addEventListener('pointermove', mv); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
    }
    api.definirVerificar(() => {
      const s = soma();
      if (s === v.alvoCm) { api.mensagem('Medida exata!', 'ok'); api.resolver(); return; }
      if (v.dicaDirecao) api.erro(s < v.alvoCm ? `Ainda está curto: faltam ${fmt(v.alvoCm - s)}.` : `Passou do tamanho em ${fmt(s - v.alvoCm)}.`);
      else api.erro(s === 0 ? 'Monte o cabo com os pedaços abaixo.' : s < v.alvoCm ? 'Ainda está curto. Confira a conta.' : 'Passou do comprimento certo. Confira a conta.');
    });
    render();
    corpo._medida = { adicionar: (cm) => adicionar(pecas.find((p) => p.cm === cm && p.usados < p.qtd)), soma };
  });

  /* ═════════ 4) CONECTAR (pares) ═════════ */
  P.registrar('conectar', (corpo, v, api) => {
    const cores = ['#f5b942', '#4cc3b0', '#ef8383', '#8fb4ff', '#c79bff', '#9be37f'];
    const ligs = {}, errados = new Set(); let sel = null;
    const idxEsq = Object.fromEntries(v.esquerda.map((o, i) => [o.id, i]));
    const col = (id) => cores[idxEsq[id] % cores.length];
    const colE = el('div', { class: 'con-col' }), colD = el('div', { class: 'con-col' });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'con-linhas'); svg.setAttribute('aria-hidden', 'true');
    const grade = el('div', { class: 'con-grade' }, svg, colE, colD);
    const limpar = el('button', { class: 'btn mini-btn', type: 'button', onclick: () => { Object.keys(ligs).forEach((k) => delete ligs[k]); errados.clear(); sel = null; api.mensagem('', ''); render(); } }, 'Limpar ligações');
    corpo.append(grade, el('div', { class: 'con-extra' }, limpar));
    const bE = {}, bD = {};
    v.esquerda.forEach((o) => { bE[o.id] = el('button', { class: 'con-item', type: 'button', onclick: () => clicarEsq(o.id) }, el('span', { class: 'ponto' }), el('span', { texto: o.texto })); colE.append(bE[o.id]); });
    v.direita.forEach((o) => { bD[o.id] = el('button', { class: 'con-item', type: 'button', onclick: () => clicarDir(o.id) }, el('span', { class: 'pontos' }), el('span', { texto: o.texto })); colD.append(bD[o.id]); });

    function clicarEsq(id) {
      AM.Audio.sfx('clique');
      if (ligs[id] && sel === id) { delete ligs[id]; errados.delete(id); sel = null; }
      else sel = sel === id ? null : id;
      render();
    }
    function clicarDir(id) {
      if (!sel) { api.mensagem('Escolha primeiro um item da coluna da esquerda.', ''); return; }
      if (!v.multi) Object.keys(ligs).forEach((k) => { if (ligs[k] === id) { delete ligs[k]; errados.delete(k); } });
      ligs[sel] = id; errados.delete(sel); AM.Audio.sfx('pegar'); sel = null; api.mensagem('', ''); render();
    }
    function linhas() {
      svg.replaceChildren();
      const gr = grade.getBoundingClientRect();
      if (!gr.width) return;
      svg.setAttribute('viewBox', `0 0 ${gr.width} ${gr.height}`);
      Object.keys(ligs).forEach((k) => {
        const a = bE[k].getBoundingClientRect(), b = bD[ligs[k]].getBoundingClientRect();
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        l.setAttribute('x1', a.right - gr.left); l.setAttribute('y1', a.top + a.height / 2 - gr.top);
        l.setAttribute('x2', b.left - gr.left); l.setAttribute('y2', b.top + b.height / 2 - gr.top);
        l.setAttribute('stroke', errados.has(k) ? '#ef6f6f' : col(k)); l.setAttribute('stroke-width', '3'); l.setAttribute('stroke-linecap', 'round');
        svg.append(l);
      });
    }
    function render() {
      v.esquerda.forEach((o) => {
        const b = bE[o.id]; b.classList.toggle('sel', sel === o.id); b.classList.toggle('ligado', !!ligs[o.id]); b.classList.toggle('errado', errados.has(o.id));
        b.querySelector('.ponto').style.background = ligs[o.id] || sel === o.id ? col(o.id) : 'transparent';
        b.setAttribute('aria-pressed', sel === o.id ? 'true' : 'false');
      });
      v.direita.forEach((o) => {
        const b = bD[o.id], donos = Object.keys(ligs).filter((k) => ligs[k] === o.id);
        b.classList.toggle('ligado', donos.length > 0);
        b.querySelector('.pontos').replaceChildren(...donos.map((k) => el('i', { class: 'ponto', estilo: { background: errados.has(k) ? '#ef6f6f' : col(k) } })));
      });
      requestAnimationFrame(linhas);
    }
    window.addEventListener('resize', linhas);
    api.definirVerificar(() => {
      if (Object.keys(ligs).length < v.esquerda.length) { api.mensagem('Ligue todos os itens da esquerda antes de verificar.', ''); return; }
      errados.clear();
      v.esquerda.forEach((o) => { if (ligs[o.id] !== v.pares[o.id]) errados.add(o.id); });
      const certos = v.esquerda.length - errados.size;
      if (!errados.size) { api.mensagem('Todas as ligações estão certas!', 'ok'); render(); api.resolver(); }
      else { api.erro(`${certos} de ${v.esquerda.length} ligações estão certas. As linhas vermelhas precisam de outra escolha.`); render(); }
    });
    render();
    corpo._conectar = { ligs, v };
  });

  /* ═════════ 5) CLASSIFICAR (catálogo de livros) ═════════ */
  P.registrar('classificar', (corpo, v, api) => {
    const atribuicoes = {}, selecionado = { id: null };
    const cards = el('div', { class: 'cat-cartoes', role: 'group', 'aria-label': 'Livros sem prateleira' });
    const prateleiras = el('div', { class: 'cat-prateleiras', role: 'group', 'aria-label': 'Prateleiras por assunto' });
    const botoesLivros = {}, botoesPrateleiras = {}, contagens = {};
    v.livros.forEach((livro) => {
      const estado = el('small', { texto: 'Ainda sem prateleira' });
      const b = el('button', { class: 'cat-cartao', type: 'button', 'aria-pressed': 'false', onclick: () => {
        selecionado.id = selecionado.id === livro.id ? null : livro.id;
        Object.keys(botoesLivros).forEach((id) => botoesLivros[id].setAttribute('aria-pressed', selecionado.id === id ? 'true' : 'false'));
        api.mensagem(selecionado.id ? 'Agora escolha a prateleira para esse livro.' : 'Seleção cancelada.', '');
      } }, livro.texto, estado);
      botoesLivros[livro.id] = b; cards.append(b);
    });
    v.prateleiras.forEach((prateleira) => {
      const contagem = el('small', { texto: '0 livros' });
      const b = el('button', { class: 'cat-prateleira', type: 'button', onclick: () => {
        if (!selecionado.id) { api.mensagem('Escolha primeiro um livro.', ''); return; }
        atribuicoes[selecionado.id] = prateleira.id;
        selecionado.id = null;
        render();
        api.mensagem('Livro colocado. Você pode mudar a prateleira antes de verificar.', 'ok');
      } }, prateleira.nome, contagem);
      botoesPrateleiras[prateleira.id] = b; contagens[prateleira.id] = contagem; prateleiras.append(b);
    });
    corpo.append(cards, prateleiras);

    function render() {
      v.livros.forEach((livro) => {
        const b = botoesLivros[livro.id], idPrateleira = atribuicoes[livro.id];
        b.setAttribute('aria-pressed', selecionado.id === livro.id ? 'true' : 'false');
        b.querySelector('small').textContent = idPrateleira
          ? 'Prateleira: ' + v.prateleiras.find((p) => p.id === idPrateleira).nome
          : 'Ainda sem prateleira';
      });
      Object.keys(botoesPrateleiras).forEach((id) => {
        botoesPrateleiras[id].classList.toggle('destino', !!selecionado.id);
        const total = Object.values(atribuicoes).filter((destino) => destino === id).length;
        contagens[id].textContent = total + (total === 1 ? ' livro' : ' livros');
      });
    }

    api.definirVerificar(() => {
      const faltam = v.livros.filter((livro) => !atribuicoes[livro.id]).length;
      if (faltam) { api.mensagem(`Ainda faltam ${faltam} ${faltam === 1 ? 'livro' : 'livros'} para organizar.`, ''); return; }
      const certos = v.livros.filter((livro) => atribuicoes[livro.id] === livro.prateleira).length;
      if (certos === v.livros.length) { api.mensagem('Todos os livros estão no lugar certo!', 'ok'); api.resolver(); }
      else api.erro(`${certos} de ${v.livros.length} livros estão na prateleira certa. Confira os assuntos.`);
    });
    render();
    corpo._classificar = { atribuicoes, v, render };
  });
})();
