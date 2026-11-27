/* ALÉM DOS MUROS — mundo 2D top-down: mapa em camadas, colisões, jogador, NPCs, interação, câmera suave,
   vegetação animada, iluminação e melhorias visíveis do cenário. */
(function () {
  'use strict';
  const AM = window.AM, U = AM.util, G = AM.Gfx, T = AM.Config.TILE, M = AM.Data.mapa;
  const WPX = M.w * T, HPX = M.h * T;

  let canvas, ctx, dicaInteracao, vw = 480, vh = 270, ps = 3;
  let chao = null, construido = false;
  let colisores = [], objetos = [], flores = [], interativos = [], npcs = {}, particulas = [], brilhos = [];
  const jogador = { x: 0, y: 0, dir: 'up', anim: 0, passo: 0 };
  const cam = { x: 0, y: 0 };
  let t = 0, stepT = 0, alvo = null, cut = null, fila = [];
  let luzEscola = 0, luzVila = 0, cantoAnim = 0, descobrirT = 0, noite = 0;
  const duracaoDia = 480;
  function horarioJogo() {
    const hora = (8 + ((AM.GameState.dados.tempoJogo % duracaoDia) / duracaoDia) * 24) % 24;
    const h = Math.floor(hora), m = Math.floor((hora - h) * 60);
    return { hora, texto: String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'), periodo: hora >= 6 && hora < 18 ? 'Dia' : 'Noite' };
  }
  function intensidadeNoite() {
    const h = horarioJogo().hora;
    if (h < 5 || h >= 20) return 1;
    if (h < 7) return (7 - h) / 2;
    if (h >= 17) return (h - 17) / 3;
    return 0;
  }
  const reduz = () => !!AM.Settings.dados.reduzirAnim;

  /* ───────── construção ───────── */
  function livre(px, py, folga) {
    const f = folga || 0;
    const dentro = (r) => px > r.x - f && px < r.x + r.w + f && py > r.y - f && py < r.y + r.h + f;
    return !excl.some(dentro);
  }
  let excl = [];

  function construirChao() {
    const [c, g] = G.mk(WPX, HPX);
    const grade = Array.from({ length: M.h }, () => Array(M.w).fill('g'));
    const marca = (r, ch) => { for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) if (grade[y] && grade[y][x] !== undefined) grade[y][x] = ch; };
    M.caminhos.forEach((r) => marca(r, 't')); marca(M.praca, 'p');
    for (let y = 0; y < M.muro.altura; y++) grade[y].fill('m');
    for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) {
      const ch = grade[y][x], v = (U.hash(x, y, 3) * 4) | 0;
      let spr;
      if (ch === 'g') spr = G.tile('grama', v); else if (ch === 't') spr = G.tile('terra', v); else if (ch === 'p') spr = G.tile('pedra', v);
      else spr = G.tile(y === 0 ? 'muro_topo' : 'muro', v);
      g.drawImage(spr, x * T, y * T);
    }
    // franjas entre caminho e grama
    for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) {
      const ch = grade[y][x]; if (ch !== 't' && ch !== 'p') continue;
      const viz = [[0, -1, 0, 0, T, 2], [0, 1, 0, T - 2, T, 2], [-1, 0, 0, 0, 2, T], [1, 0, T - 2, 0, 2, T]];
      viz.forEach(([dx, dy, ox, oy, w, h]) => {
        const n = grade[y + dy] && grade[y + dy][x + dx];
        if (n === 'g') { g.fillStyle = ch === 't' ? 'rgba(92,64,34,0.38)' : 'rgba(70,74,80,0.35)'; g.fillRect(x * T + ox, y * T + oy, w, h); }
      });
    }
    // sombra do muro
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, M.muro.altura * T, WPX, 4);
    chao = c;
  }

  function colisor(x, y, w, h) { colisores.push({ x, y, w, h }); }

  function construir() {
    if (construido) return;
    construido = true;
    construirChao();
    colisores = []; objetos = []; flores = []; interativos = [];
    excl = [];
    M.caminhos.forEach((r) => excl.push({ x: r.x * T, y: r.y * T, w: r.w * T, h: r.h * T }));
    excl.push({ x: M.praca.x * T, y: M.praca.y * T, w: M.praca.w * T, h: M.praca.h * T });
    M.edificios.forEach((e) => excl.push({ x: e.x * T - 6, y: e.y * T, w: e.w * T + 12, h: e.h * T + 14 }));
    excl.push({ x: 0, y: 0, w: WPX, h: M.muro.altura * T + 10 });
    [M.quadro, M.mural, M.placa_tutorial, M.poco, M.canto_leitura].forEach((p) => excl.push({ x: p.x * T - 22, y: p.y * T - 26, w: 44, h: 40 }));

    // limites do mundo
    colisor(-40, 0, 40 + 8, HPX); colisor(WPX - 8, 0, 48, HPX); colisor(0, M.muro.altura * T - 4, WPX, 4); colisor(0, HPX - 36, WPX, 40);
    colisor(0, 0, WPX, M.muro.altura * T);

    // prédios
    M.edificios.forEach((e) => {
      const x = e.x * T, y = e.y * T, w = e.w * T, h = e.h * T;
      colisor(x, y, w, h - 2);
      objetos.push({
        y: y + h, x0: x, x1: x + w, y0: y,
        desenhar(c, ox, oy) {
          c.drawImage(G.edificio(e, false, e.id === 'biblioteca' && !!AM.GameState.dados.melhorias.biblioteca_reaberta), x - ox, y - oy);
          if (e.id === 'escola' && luzEscola * noite > 0.01) { c.globalAlpha = luzEscola * noite; c.drawImage(G.edificio(e, true), x - ox, y - oy); c.globalAlpha = 1; }
        },
      });
      const dc = x + e.porta * T + T;
      if (e.id === 'escola') interativos.push({ id: 'porta_escola', rect: { x: dc - 22, y: y + h - 4, w: 44, h: 14 }, rotulo: 'Examinar', ponto: { x: dc, y: y + h - 34 } });
      if (e.id === 'biblioteca') interativos.push({ id: 'porta_biblioteca', rect: { x: dc - 22, y: y + h - 4, w: 44, h: 14 }, rotulo: 'Examinar', ponto: { x: dc, y: y + h - 34 }, marca: 'porta_biblioteca' });
    });

    // portão trancado do muro
    {
      const x = M.muro.portao.x * T, w = M.muro.portao.w * T;
      objetos.push({ y: 3 * T - 1, x0: x, x1: x + w, y0: 0, desenhar(c, ox, oy) { const s = G.prop('portao'); c.drawImage(s, x + (w - 64) / 2 - ox, 3 * T - 52 - oy); } });
      interativos.push({ id: 'portao', rect: { x: x - 4, y: 3 * T, w: w + 8, h: 12 }, rotulo: 'Examinar', ponto: { x: x + w / 2, y: 3 * T - 40 } });
    }

    // árvores
    const rnd = U.rng(20241);
    const arv = [];
    const pertoDemais = (x, y, d) => arv.some((a) => Math.hypot(a.x - x, (a.y - y) * 1.3) < d);
    const poeArvore = (x, y) => arv.push({ x, y, v: Math.floor(rnd() * 12), ph: rnd() * 6.28 });
    for (let y = 4 * T; y < HPX; y += 22 + rnd() * 10) { if (livre(18, y, 4)) poeArvore(14 + rnd() * 14, y); if (livre(WPX - 18, y, 4)) poeArvore(WPX - 14 - rnd() * 14, y + 6); }
    for (let x = 28; x < WPX - 20; x += 22 + rnd() * 10) for (const yy of [HPX - 26, HPX - 12]) if (livre(x, yy, 4)) poeArvore(x, yy + rnd() * 6);
    for (let i = 0; i < 500 && arv.length < 150; i++) {
      const x = 40 + rnd() * (WPX - 80), y = 5 * T + rnd() * (HPX - 5 * T - 60);
      if (livre(x, y, 14) && !pertoDemais(x, y, 44)) poeArvore(x, y);
    }
    arv.forEach((a) => {
      colisor(a.x - 4, a.y - 5, 8, 5);
      objetos.push({
        y: a.y, x0: a.x - 24, x1: a.x + 24, y0: a.y - 60,
        desenhar(c, ox, oy) {
          const s = G.arvore(a.v), k = reduz() ? 0 : Math.sin(t * 1.3 + a.ph) * 0.035;
          c.drawImage(s.tronco, a.x - 6 - ox, a.y - 18 - oy);
          const dx = a.x - 22 - ox, dy = a.y - 18 - 34 - oy;
          c.setTransform(1, 0, k, 1, dx - k * 40, dy); c.drawImage(s.copa, 0, 0); c.setTransform(1, 0, 0, 1, 0, 0);
        },
      });
    });

    // arbustos perto dos prédios
    M.edificios.forEach((e, i) => {
      [[e.x * T + 6, (e.y + e.h) * T + 6], [(e.x + e.w) * T - 8, (e.y + e.h) * T + 6]].forEach(([bx, by], j) => {
        const onPath = M.caminhos.some((r) => bx > r.x * T - 6 && bx < (r.x + r.w) * T + 6 && by > r.y * T && by < (r.y + r.h) * T);
        if (onPath) return;
        colisor(bx - 7, by - 5, 14, 5);
        objetos.push({ y: by, x0: bx - 12, x1: bx + 12, y0: by - 16, desenhar(c, ox, oy) { c.drawImage(G.arbusto(i + j), bx - 10 - ox, by - 12 - oy); } });
      });
    });

    // flores (decoração viva)
    const cores = ['#ef8383', '#f5b942', '#ffffff', '#c79bff', '#8fb4ff'];
    for (let i = 0; i < 200 && flores.length < 90; i++) {
      const x = 24 + rnd() * (WPX - 48), y = 4 * T + rnd() * (HPX - 5 * T);
      if (!livre(x, y, 6)) continue;
      const proximo = M.edificios.some((e) => Math.abs(x - (e.x + e.w / 2) * T) < e.w * T / 2 + 40 && Math.abs(y - (e.y + e.h) * T) < 36) || Math.hypot(x - 25 * T, y - 19.5 * T) < 190;
      if (!proximo && rnd() < 0.7) continue;
      flores.push({ x, y, c: cores[Math.floor(rnd() * cores.length)], ph: rnd() * 6.28 });
    }

    // lâmpadas
    M.lampadas.forEach(([lx, ly], i) => {
      const x = lx * T + 8, y = ly * T + 14;
      colisor(x - 3, y - 4, 6, 4);
      objetos.push({ y, x0: x - 10, x1: x + 10, y0: y - 32, desenhar(c, ox, oy) { c.drawImage(G.prop('lampada', luzVila * noite > 0.5), x - 7 - ox, y - 29 - oy); } });
      brilhos.push({ x, y: y - 21, tipo: 'lampada', i });
    });
    // bancos
    M.bancos.forEach(([bx, by]) => {
      const x = bx * T + 8, y = by * T + 14;
      colisor(x - 10, y - 7, 20, 7);
      objetos.push({ y, x0: x - 12, x1: x + 12, y0: y - 14, desenhar(c, ox, oy) { c.drawImage(G.prop('banco'), x - 11 - ox, y - 13 - oy); } });
    });
    // caixotes
    M.caixotes.forEach(([bx, by]) => {
      const x = bx * T, y = by * T;
      colisor(x - 6, y - 8, 12, 8);
      objetos.push({ y, x0: x - 8, x1: x + 8, y0: y - 14, desenhar(c, ox, oy) { c.drawImage(G.prop('caixote'), x - 6 - ox, y - 12 - oy); } });
    });
    // poço
    {
      const x = M.poco.x * T, y = M.poco.y * T; colisor(x - 10, y - 8, 20, 8);
      objetos.push({ y, x0: x - 14, x1: x + 14, y0: y - 26, desenhar(c, ox, oy) {
        c.drawImage(G.prop('poco'), x - 12 - ox, y - 25 - oy);
        if (AM.GameState.dados.melhorias.poco_funcionando) { // bomba consertada: água brilhando e gotas subindo
          const a = reduz() ? 0.7 : 0.55 + 0.25 * Math.sin(t * 3);
          c.fillStyle = `rgba(111,196,255,${a})`; c.fillRect(Math.round(x - 6 - ox), Math.round(y - 9 - oy), 12, 2);
          if (!reduz()) for (let i = 0; i < 3; i++) { const p = (t * 0.9 + i / 3) % 1; c.fillStyle = `rgba(170,225,255,${1 - p})`; c.fillRect(Math.round(x - 4 + i * 4 - ox), Math.round(y - 10 - p * 12 - oy), 1, 2); }
          c.fillStyle = '#7a5530'; c.fillRect(Math.round(x + 9 - ox), Math.round(y - 6 - oy), 4, 4); c.fillStyle = '#b98650'; c.fillRect(Math.round(x + 9 - ox), Math.round(y - 6 - oy), 4, 1);
        }
      } });
      interativos.push({ id: 'poco', rect: { x: x - 18, y: y - 14, w: 36, h: 28 }, rotulo: 'Examinar', ponto: { x, y: y - 32 }, marca: 'poco' });
    }
    // fonte
    {
      const fx = M.fonte.x * T, fy = M.fonte.y * T;
      colisor(fx - 20, fy - 8, 40, 16);
      objetos.push({
        y: fy + 8, x0: fx - 26, x1: fx + 26, y0: fy - 34,
        desenhar(c, ox, oy) {
          const px = fx - 24 - ox, py = fy - 30 - oy;
          c.drawImage(G.fonteBase(), px, py);
          if (reduz()) return;
          const cx = px + 24, cy = py + 24;
          c.lineWidth = 1;
          for (let i = 0; i < 2; i++) { const p = (t * 0.7 + i * 0.5) % 1; c.strokeStyle = `rgba(255,255,255,${(1 - p) * 0.55})`; c.beginPath(); c.ellipse(cx, cy, 3 + p * 13, 1.5 + p * 5.5, 0, 0, 7); c.stroke(); }
          c.fillStyle = 'rgba(255,255,255,0.9)';
          for (let i = 0; i < 6; i++) { const p = (t * 1.2 + i / 6) % 1; c.fillRect(Math.round(cx + (i - 2.5) * 2.2 * p), Math.round(py + 1 - 6 * Math.sin(p * Math.PI) + p * 11), 1, 1); }
        },
      });
    }
    // placa, mural
    { const x = M.placa_tutorial.x * T, y = M.placa_tutorial.y * T; colisor(x - 3, y - 4, 6, 4); objetos.push({ y, x0: x - 10, x1: x + 10, y0: y - 26, desenhar(c, ox, oy) { c.drawImage(G.prop('placa'), x - 9 - ox, y - 23 - oy); } });
      interativos.push({ id: 'placa_tutorial', rect: { x: x - 16, y: y - 14, w: 32, h: 26 }, rotulo: 'Ler', ponto: { x, y: y - 28 } }); }
    { const x = M.mural.x * T, y = M.mural.y * T; colisor(x - 13, y - 5, 26, 5); objetos.push({ y, x0: x - 16, x1: x + 16, y0: y - 28, desenhar(c, ox, oy) { c.drawImage(G.prop('mural'), x - 15 - ox, y - 25 - oy); } });
      interativos.push({ id: 'mural', rect: { x: x - 20, y: y - 14, w: 40, h: 26 }, rotulo: 'Ler', ponto: { x, y: y - 30 } }); }
    // quadro de energia
    { const x = M.quadro.x * T, y = M.quadro.y * T; colisor(x - 6, y - 4, 12, 4);
      objetos.push({ y, x0: x - 10, x1: x + 10, y0: y - 28, desenhar(c, ox, oy) { c.drawImage(G.prop('quadro', luzEscola * noite > 0.5), x - 8 - ox, y - 25 - oy); } });
      interativos.push({ id: 'quadro', rect: { x: x - 18, y: y - 14, w: 36, h: 28 }, rotulo: 'Examinar', ponto: { x, y: y - 30 }, marca: 'quadro' }); }
    // cantinho de leitura (melhoria)
    { const x = M.canto_leitura.x * T, y = M.canto_leitura.y * T; colisor(x - 22, y - 6, 44, 6);
      objetos.push({ y, x0: x - 26, x1: x + 26, y0: y - 32, desenhar(c, ox, oy) {
        if (cantoAnim < 0.02) return;
        c.globalAlpha = Math.min(1, cantoAnim);
        c.drawImage(G.prop('estante'), x - 24 - ox, y - 26 - oy); c.drawImage(G.prop('banco'), x - 2 - ox, y - 13 - oy);
        if (AM.GameState.dados.melhorias.estante_cheia) { // livros recuperados: pilha no banco e mais volumes na estante
          [['#d94b4b', 4], ['#4a7bb0', 3], ['#f5b942', 2]].forEach(([cor, w], i) => { c.fillStyle = cor; c.fillRect(Math.round(x + 4 - ox), Math.round(y - 15 - i * 2 - oy), 6 + w % 2, 2); });
          c.fillStyle = '#4cc3b0'; c.fillRect(Math.round(x - 21 - ox), Math.round(y - 20 - oy), 2, 5); c.fillRect(Math.round(x - 18 - ox), Math.round(y - 11 - oy), 2, 5);
        }
        c.globalAlpha = 1;
      } });
      interativos.push({ id: 'canto_leitura', rect: { x: x - 28, y: y - 14, w: 56, h: 26 }, rotulo: 'Examinar', ponto: { x, y: y - 34 }, marca: 'canto_leitura', ativo: () => cantoAnim > 0.9 }); }

    // itens colecionáveis
    M.coletaveis.forEach((cl) => {
      const x = cl.x * T, y = cl.y * T, ph = Math.random() * 6;
      objetos.push({ y, x0: x - 10, x1: x + 10, y0: y - 16, desenhar(c, ox, oy) {
        if (AM.GameState.dados.coletados[cl.id]) return;
        const bob = reduz() ? 0 : Math.round(Math.sin(t * 2.5 + ph) * 1.5);
        c.fillStyle = 'rgba(0,0,0,0.22)'; c.beginPath(); c.ellipse(x - ox, y - oy, 5, 2, 0, 0, 7); c.fill();
        c.globalCompositeOperation = 'lighter'; c.globalAlpha = reduz() ? 0.5 : 0.35 + 0.2 * Math.sin(t * 3 + ph); c.drawImage(G.brilho(14, 'rgba(255,232,150,0.7)'), Math.round(x - 14 - ox), Math.round(y - 20 - oy)); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
        c.drawImage(G.item(cl.item), Math.round(x - 6 - ox), Math.round(y - 14 - oy + bob));
      } });
      interativos.push({ id: 'col:' + cl.id, coleta: cl, rect: { x: x - 11, y: y - 12, w: 22, h: 18 }, rotulo: 'Pegar', ponto: { x, y: y - 18 }, marca: cl.marca, ativo: () => !AM.GameState.dados.coletados[cl.id] });
    });

    criarNPCs();
    objetos.sort((a, b) => a.y - b.y);
  }


  /* ───────── NPCs que andam ───────── */
  const rand = (r) => r[0] + Math.random() * (r[1] - r[0]);
  const npcVisivel = (n) => (!n.d.aparece || AM.Quests.cond(n.d.aparece)) &&
    (!n.d.horario || (n.d.horario === 'noite' ? noite >= 0.55 : n.d.horario === 'dia' ? noite < 0.55 : true));
  function criarNPCs() {
    npcs = {};
    Object.keys(AM.Data.npcs).forEach((id) => {
      const d = AM.Data.npcs[id], x = d.x * T, y = d.y * T;
      npcs[id] = { id, d, x, y, casaX: x, casaY: y, dir: d.dir, v: 0, passo: 0, anim: 0, alpha: 1, caminho: [], ci: 0, estado: 'espera', espera: rand(d.espera), bloq: 0, olhar: 1 + Math.random() * 2, conversa: false, ph: Math.random() * 6 };
      interativos.push({ id, npc: true, rect: { x: x - 16, y: y - 22, w: 32, h: 32 }, rotulo: 'Conversar', ponto: { x, y: y - 30 }, marca: id, ativo: () => npcs[id].alpha > 0.85 });
    });
  }
  function resetarNPCs() {
    Object.values(npcs).forEach((n) => { n.x = n.casaX; n.y = n.casaY; n.dir = n.d.dir; n.v = 0; n.caminho = []; n.ci = 0; n.estado = 'espera'; n.espera = rand(n.d.espera) * 0.4; n.conversa = false; n.alpha = npcVisivel(n) ? 1 : 0; });
  }
  /** escolhe a próxima rota: entre as rotas válidas, as de maior prioridade; ida até o último ponto e volta pela mesma trilha */
  function escolherRota(n) {
    const d = n.d, ok = d.rotas.filter((r) => AM.Quests.cond(r.cond));
    const prio = Math.max(...ok.map((r) => r.prio || 0)), cand = ok.filter((r) => (r.prio || 0) === prio);
    const r = cand[Math.floor(Math.random() * cand.length)];
    const ida = r.pontos.map((p) => ({ x: p.x * T, y: p.y * T, espera: p.espera || [0.2, 0.6], dir: p.dir }));
    const volta = r.pontos.slice(0, -1).reverse().map((p) => ({ x: p.x * T, y: p.y * T, espera: [0.2, 0.5] }));
    n.caminho = ida.concat(volta, [{ x: n.casaX, y: n.casaY, espera: d.espera, dir: d.dir }]); n.ci = 0;
  }
  function npcBloqueiaNPC(n, x, y) {
    if (Math.abs(x - jogador.x) < 10.5 && Math.abs(y - jogador.y) < 5.5) return true;
    return Object.values(npcs).some((o) => o !== n && o.alpha > 0.3 && Math.abs(x - o.x) < 9.5 && Math.abs(y - o.y) < 4.5);
  }
  function npcBloqueiaJogador(x, y) {
    for (const n of Object.values(npcs)) {
      if (n.alpha < 0.5) continue;
      const dx = Math.abs(x - n.x), dy = Math.abs(y - n.y);
      if (dx < 9.5 && dy < 4.5) { // já sobreposto: só impede se estiver se aproximando
        const ox = Math.abs(jogador.x - n.x), oy = Math.abs(jogador.y - n.y);
        if (ox < 9.5 && oy < 4.5 && dx + dy * 2 >= ox + oy * 2) continue;
        return true;
      }
    }
    return false;
  }
  function atualizarNPC(n, dt) {
    const alvoA = npcVisivel(n) ? 1 : 0;
    n.alpha = U.clamp(n.alpha + U.clamp(alvoA - n.alpha, -dt * 1.2, dt * 1.2), 0, 1);
    n.anim = 0;
    if (n.alpha <= 0) return;
    const rect = interativos.find((i) => i.id === n.id && i.npc);
    if (rect) { rect.rect.x = n.x - 16; rect.rect.y = n.y - 22; rect.ponto.x = n.x; rect.ponto.y = n.y - 30; }
    if (AM.Modal.aberto() && !cut) { n.v = 0; return; }
    if (n.conversa) { if (!AM.Dialogue.ativo) n.conversa = false; else { n.v = 0; return; } }
    const dj = Math.hypot(n.x - jogador.x, n.y - jogador.y);
    const parado = alvo && alvo.id === n.id; // jogador pode conversar: o NPC espera e olha para ele
    if (parado) { n.v = 0; n.dir = direcaoPara(n.x, n.y, jogador.x, jogador.y); return; }
    if (n.estado === 'espera') {
      n.v = 0; n.espera -= dt;
      if (dj < 56) n.dir = direcaoPara(n.x, n.y, jogador.x, jogador.y);
      else { n.olhar -= dt; if (n.olhar <= 0 && n.espera > 1.4) { n.olhar = 1.6 + Math.random() * 2.4; if (Math.random() < 0.55) n.dir = ['down', 'left', 'right', 'up'][Math.floor(Math.random() * 4)]; } }
      if (n.espera <= 0) { if (n.ci >= n.caminho.length) escolherRota(n); n.estado = 'anda'; n.bloq = 0; }
      return;
    }
    // andando em direção ao próximo ponto, um eixo por vez
    const w = n.caminho[n.ci], dx = w.x - n.x, dy = w.y - n.y, dist = Math.abs(dx) + Math.abs(dy);
    if (dist < 0.6) { n.x = w.x; n.y = w.y; if (w.dir) n.dir = w.dir; n.ci++; n.estado = 'espera'; n.espera = rand(w.espera); n.v = 0; return; }
    const alvoV = n.d.vel * U.clamp(dist / 12, 0.4, 1);
    n.v += (alvoV - n.v) * Math.min(1, dt * 6);
    const passo = Math.min(n.v * dt, Math.max(Math.abs(dx), Math.abs(dy)));
    const eixoX = Math.abs(dx) >= Math.abs(dy);
    const nx = eixoX ? n.x + Math.sign(dx) * passo : n.x, ny = eixoX ? n.y : n.y + Math.sign(dy) * passo;
    if (colide(nx, ny) || npcBloqueiaNPC(n, nx, ny)) {
      n.v = 0; n.bloq += dt;
      if (n.bloq > 2.2) { n.estado = 'espera'; n.espera = 0.8; n.bloq = 0; n.ci = Math.min(n.ci + 1, n.caminho.length); }
      return;
    }
    n.bloq = 0; n.x = nx; n.y = ny;
    n.dir = eixoX ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    n.passo += dt * n.v * 0.17;
    n.anim = n.v > 3 ? 1 + (Math.floor(n.passo) % 4) : 0;
  }

  /* ───────── jogo ───────── */
  function colide(x, y) {
    const l = x - 4.5, r = x + 4.5, tp = y - 4, b = y;
    for (let i = 0; i < colisores.length; i++) { const c = colisores[i]; if (r > c.x && l < c.x + c.w && b > c.y && tp < c.y + c.h) return true; }
    return false;
  }
  function mover(dx, dy) {
    if (dx && !colide(jogador.x + dx, jogador.y) && !npcBloqueiaJogador(jogador.x + dx, jogador.y)) jogador.x += dx;
    if (dy && !colide(jogador.x, jogador.y + dy) && !npcBloqueiaJogador(jogador.x, jogador.y + dy)) jogador.y += dy;
  }
  function distRect(px, py, r) { const dx = Math.max(r.x - px, 0, px - (r.x + r.w)), dy = Math.max(r.y - py, 0, py - (r.y + r.h)); return Math.hypot(dx, dy); }
  function acharAlvo() {
    let melhor = null, md = 1e9;
    interativos.forEach((i) => {
      if (i.ativo && !i.ativo()) return;
      const d = distRect(jogador.x, jogador.y, i.rect);
      if (d < 5 && d < md) { md = d; melhor = i; }
    });
    return melhor;
  }
  function direcaoPara(ax, ay, bx, by) { const dx = bx - ax, dy = by - ay; return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); }

  function cutscene(c) { fila.push(c); }
  function iniciarCut(c) { cut = Object.assign({ t: 0, dur: 3, meio: false }, c); }
  function faiscas(x, y, n, cor) {
    if (reduz()) return;
    for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 14 + Math.random() * 30; particulas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 14, vida: 0.8 + Math.random() * 0.8, max: 1.6, c: cor || '#ffe28a', tipo: 'faisca' }); }
    if (particulas.length > 200) particulas.splice(0, particulas.length - 200);
  }

  const World = (AM.World = {
    iniciar(cv) { canvas = cv; ctx = cv.getContext('2d'); dicaInteracao = document.getElementById('dica-interacao'); construir(); this.redimensionar(window.innerWidth, window.innerHeight); },
    redimensionar(w, h) {
      ps = Math.max(2, Math.round(Math.min(w / 400, h / 240)));
      vw = Math.ceil(w / ps); vh = Math.ceil(h / ps);
      canvas.width = vw; canvas.height = vh;
      canvas.style.width = vw * ps + 'px'; canvas.style.height = vh * ps + 'px';
      ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
    },
    entrar(pos) {
      construir();
      jogador.x = pos.x; jogador.y = pos.y; jogador.dir = pos.dir || 'down'; jogador.anim = 0; jogador.passo = 0;
      const m = AM.GameState.dados.melhorias;
      luzEscola = m.escola_energia ? 1 : 0; luzVila = m.vila_iluminada ? 1 : 0; cantoAnim = m.canto_leitura ? 1 : 0;
      noite = intensidadeNoite();
      cut = null; fila = []; particulas = []; resetarNPCs(); AM.Quests.verificarAuto();
      cam.x = jogador.x - vw / 2; cam.y = jogador.y - vh / 2 - 8; this.limitarCamera();
      for (let i = 0; i < 26; i++) particulas.push({ x: Math.random() * WPX, y: Math.random() * HPX, vx: 6 + Math.random() * 6, vy: 3 + Math.random() * 4, ph: Math.random() * 6, tipo: 'folha', c: Math.random() < 0.6 ? '#8fcf6a' : '#e0b84a' });
    },
    limitarCamera() {
      cam.x = WPX <= vw ? (WPX - vw) / 2 : U.clamp(cam.x, 0, WPX - vw);
      cam.y = HPX <= vh ? (HPX - vh) / 2 : U.clamp(cam.y, 0, HPX - vh);
    },
    sincronizarEstado() { const d = AM.GameState.dados; if (d) d.pos = { x: Math.round(jogador.x * 10) / 10, y: Math.round(jogador.y * 10) / 10, dir: jogador.dir }; },
    bloqueado() { return AM.Modal.aberto() || !!cut; },
    alvo() { return alvo; },
    cutAtivo() { return !!cut; },
    posJogador() { return { x: jogador.x, y: jogador.y }; },
    /** posições (px) onde um objetivo "alvo" está agora: NPC (onde ele está neste momento) ou objeto/itens do mundo */
    posicoesAlvo(marca) {
      if (npcs[marca]) return npcs[marca].alpha > 0.5 ? [{ x: npcs[marca].x, y: npcs[marca].y }] : [];
      return interativos.filter((i) => i.marca === marca && (!i.ativo || i.ativo())).map((i) => ({ x: i.rect.x + i.rect.w / 2, y: i.rect.y + i.rect.h / 2 }));
    },
    npcPos(id) { const n = npcs[id]; return n && n.alpha > 0.5 ? { x: n.x, y: n.y } : null; },
    horario: horarioJogo,
    teletransportar(x, y) { jogador.x = x; jogador.y = y; },
    interagir() {
      if (this.bloqueado() || !alvo) return false;
      if (alvo.coleta) {
        const cl = alvo.coleta; AM.GameState.dados.coletados[cl.id] = true; AM.GameState.marcar();
        faiscas(cl.x * T, cl.y * T - 6, 10, '#fff1b0');
        AM.Inventory.dar(cl.item, 1); AM.SaveSystem.salvar('coleta');
        return true;
      }
      if (alvo.npc) { const n = npcs[alvo.id]; n.conversa = true; n.v = 0; n.dir = direcaoPara(n.x, n.y, jogador.x, jogador.y); jogador.dir = direcaoPara(jogador.x, jogador.y, n.x, n.y); }
      AM.Audio.sfx('clique');
      AM.Dialogue.iniciar(alvo.id);
      return true;
    },
    atualizar(dt) {
      t += dt;
      noite = intensidadeNoite();
      const bloq = this.bloqueado();
      let andando = false;
      if (!bloq) {
        const v = AM.Input.vetor();
        if (v.mag > 0.15) {
          const corre = AM.Input.down('correr'), vel = (corre ? 80 : 48) * Math.max(0.55, v.mag) * AM.Inventory.mult('vel');
          const l = Math.hypot(v.x, v.y) || 1, mx = (v.x / l) * vel * dt, my = (v.y / l) * vel * dt;
          mover(mx, 0); mover(0, my);
          jogador.dir = Math.abs(v.x) > Math.abs(v.y) ? (v.x > 0 ? 'right' : 'left') : (v.y > 0 ? 'down' : 'up');
          jogador.passo += dt * (corre ? 11 : 7.5); jogador.corre = corre; andando = true;
          stepT -= dt; if (stepT <= 0) { AM.Audio.sfx('passo'); stepT = corre ? 0.19 : 0.31; }
        }
      }
      if (!andando) jogador.passo = 0;
      jogador.anim = andando ? 1 + (Math.floor(jogador.passo) % 4) : 0;
      alvo = bloq ? null : acharAlvo();
      Object.values(npcs).forEach((n) => atualizarNPC(n, dt));
      descobrirT -= dt; if (descobrirT <= 0) { descobrirT = 0.4; AM.Knowledge.verificarLocais(jogador.x, jogador.y); }

      // cortes de câmera (melhorias)
      if (!cut && fila.length && !AM.Modal.aberto()) iniciarCut(fila.shift());
      let alvoCam = { x: jogador.x, y: jogador.y - 12 };
      if (cut) {
        cut.t += dt;
        const p = cut.t / cut.dur, vai = U.clamp(p < 0.25 ? p / 0.25 : p > 0.8 ? 1 - (p - 0.8) / 0.2 : 1, 0, 1), e = vai * vai * (3 - 2 * vai);
        alvoCam = { x: U.lerp(jogador.x, cut.para.x, e), y: U.lerp(jogador.y - 12, cut.para.y, e) };
        if (!cut.meio && cut.t > cut.dur * 0.3) { cut.meio = true; if (cut.aoMeio) cut.aoMeio(); }
        if (cut.t >= cut.dur) { const fim = cut.aoFim; cut = null; if (fim) fim(); AM.GameState.marcar(); AM.SaveSystem.salvar('melhoria'); }
      }
      const k = 1 - Math.exp(-dt * (cut ? 5 : 7));
      cam.x += (alvoCam.x - vw / 2 - cam.x) * k; cam.y += (alvoCam.y - vh / 2 - cam.y) * k;
      this.limitarCamera();

      // luzes animadas
      const m = AM.GameState.dados.melhorias;
      if (cut) {
        if (cut.alvoEscola !== undefined && cut.meio) luzEscola = U.clamp(luzEscola + dt * 0.7 * Math.sign(cut.alvoEscola - luzEscola), 0, 1);
        if (cut.alvoVila !== undefined && cut.meio) luzVila = U.clamp(luzVila + dt * 0.8 * Math.sign(cut.alvoVila - luzVila), 0, 1);
      }
      if (m.canto_leitura && !fila.length && !(cut && cut.id === 'vila_iluminada' && !cut.meio)) cantoAnim = Math.min(1, cantoAnim + dt * (cut ? 0.6 : 2));
      // partículas
      for (let i = particulas.length - 1; i >= 0; i--) {
        const p = particulas[i];
        if (p.tipo === 'folha') {
          if (reduz()) continue;
          p.x += (p.vx + Math.sin(t * 1.5 + p.ph) * 5) * dt; p.y += (p.vy + Math.cos(t * 1.1 + p.ph) * 3) * dt;
          if (p.x > WPX) p.x = 0; if (p.y > HPX) p.y = M.muro.altura * T;
        } else { p.vida -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 24 * dt; if (p.vida <= 0) particulas.splice(i, 1); }
      }
    },
    desenhar() {
      const c = ctx, ox = Math.round(cam.x), oy = Math.round(cam.y);
      c.fillStyle = '#1b2a1f'; c.fillRect(0, 0, vw, vh);
      c.drawImage(chao, -ox, -oy);
      // flores
      const sw = reduz() ? 0 : 1;
      flores.forEach((f) => { if (f.x < ox - 8 || f.x > ox + vw + 8 || f.y < oy - 8 || f.y > oy + vh + 8) return; c.drawImage(G.flor(f.c), Math.round(f.x - 3 - ox + Math.sin(t * 2 + f.ph) * 0.7 * sw), Math.round(f.y - 8 - oy)); });
      // objetos ordenados por profundidade (y)
      const lista = [];
      for (let i = 0; i < objetos.length; i++) { const o = objetos[i]; if (o.x1 < ox - 4 || o.x0 > ox + vw + 4 || o.y0 > oy + vh + 4 || o.y < oy - 4) continue; lista.push(o); }
      Object.values(npcs).forEach((n) => { if (n.alpha > 0.01) lista.push({ y: n.y, npc: n }); });
      lista.push({ y: jogador.y, jogador: true });
      lista.sort((a, b) => a.y - b.y);
      lista.forEach((o) => {
        if (o.npc) {
          const n = o.npc, parado = n.anim === 0, bob = reduz() || !parado ? 0 : (Math.sin(t * 2.2 + n.ph) > 0.75 ? -1 : 0);
          c.globalAlpha = n.alpha;
          c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(n.x - ox, n.y - oy - 1, 6, 2.5, 0, 0, 7); c.fill();
          c.drawImage(G.personagem(n.id, n.dir, n.anim, n.d.vel > 34 && n.anim > 0), Math.round(n.x - 9 - ox), Math.round(n.y - 25 - oy + bob));
          c.globalAlpha = 1;
        } else if (o.jogador) {
          c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(jogador.x - ox, jogador.y - oy - 1, 6, 2.5, 0, 0, 7); c.fill();
          c.drawImage(G.personagem('voce', jogador.dir, jogador.anim, !!jogador.corre && jogador.anim > 0), Math.round(jogador.x - 9 - ox), Math.round(jogador.y - 25 - oy));
        } else o.desenhar(c, ox, oy);
      });
      // folhas e faíscas
      particulas.forEach((p) => {
        if (p.x < ox - 4 || p.x > ox + vw + 4 || p.y < oy - 4 || p.y > oy + vh + 4) return;
        if (p.tipo === 'folha') { if (reduz()) return; c.fillStyle = p.c; c.fillRect(Math.round(p.x - ox), Math.round(p.y - oy), 2, 1); }
        else { c.globalAlpha = Math.min(1, p.vida / 0.5); c.fillStyle = p.c; c.fillRect(Math.round(p.x - ox), Math.round(p.y - oy), 2, 2); c.globalAlpha = 1; }
      });
      // entardecer + luzes
      c.fillStyle = `rgba(20,24,64,${0.07 + noite * 0.3})`; c.fillRect(0, 0, vw, vh);
      this.desenharLuzes(c, ox, oy);
      this.desenharMarcas(c, ox, oy);
    },
    desenharLuzes(c, ox, oy) {
      c.globalCompositeOperation = 'lighter';
      if (luzVila * noite > 0.01) {
        const g = G.brilho(34, 'rgba(255,214,120,0.55)');
        brilhos.forEach((b) => { const a = luzVila * noite * (reduz() ? 0.85 : 0.8 + 0.1 * Math.sin(t * 3 + b.i)); c.globalAlpha = a; c.drawImage(g, Math.round(b.x - 34 - ox), Math.round(b.y - 30 - oy)); });
        c.globalAlpha = 1;
      }
      if (luzEscola * noite > 0.01) {
        const e = M.edificios.find((x) => x.id === 'escola'), W = e.w * T, H = e.h * T, rh = Math.round(H * 0.46), n = Math.max(2, Math.floor(W / 50));
        const dc = e.porta * T + T, g = G.brilho(30, 'rgba(255,220,140,0.5)'), g2 = G.brilho(40, 'rgba(255,220,140,0.45)');
        c.globalAlpha = luzEscola * noite;
        for (let i = 0; i < n; i++) { const cx = ((i + 0.5) * W) / n; if (Math.abs(cx - dc) < 30) continue; c.drawImage(g, Math.round(e.x * T + cx - 30 - ox), Math.round(e.y * T + rh + 18 - 30 - oy)); }
        c.drawImage(g2, Math.round(e.x * T + dc - 40 - ox), Math.round(e.y * T + H - 8 - oy));
        c.globalAlpha = 1;
      }
      if (AM.GameState.dados.melhorias.biblioteca_reaberta && noite > 0.01) {
        const e = M.edificios.find((x) => x.id === 'biblioteca');
        c.globalAlpha = noite * 0.8;
        c.drawImage(G.brilho(42, 'rgba(255,214,140,0.5)'), Math.round((e.x + e.porta + 1) * T - 42 - ox), Math.round((e.y + e.h) * T - 42 - oy));
        c.globalAlpha = 1;
      }
      c.globalCompositeOperation = 'source-over';
      if (luzVila > 0.5 && noite > 0.5 && !reduz()) {
        c.fillStyle = '#ffe9a0';
        for (let i = 0; i < 14; i++) { const fx = 25 * T + Math.cos(t * 0.3 + i * 1.7) * (60 + i * 7), fy = 19 * T + Math.sin(t * 0.4 + i * 2.3) * (40 + i * 3); c.globalAlpha = luzVila * noite * (0.3 + 0.7 * Math.abs(Math.sin(t * 1.6 + i))); c.fillRect(Math.round(fx - ox), Math.round(fy - oy), 1, 1); }
        c.globalAlpha = 1;
      }
    },
    desenharMarcas(c, ox, oy) {
      if (dicaInteracao) dicaInteracao.hidden = true;
      if (this.bloqueado()) return;
      const ativos = new Set(AM.Quests.todosAtivos().map((a) => a.passo.alvo));
      interativos.forEach((i) => {
        if (!i.marca || !ativos.has(i.marca)) return;
        if (i.ativo && !i.ativo()) return;
        const bx = i.ponto.x - ox, by = i.ponto.y - oy - 4 - (reduz() ? 0 : Math.abs(Math.sin(t * 3)) * 3);
        c.fillStyle = '#1d1726'; c.fillRect(Math.round(bx - 3), Math.round(by - 9), 6, 11);
        c.fillStyle = '#f5b942'; c.fillRect(Math.round(bx - 2), Math.round(by - 8), 4, 6); c.fillRect(Math.round(bx - 2), Math.round(by), 4, 1);
        c.fillStyle = '#1d1726'; c.fillRect(Math.round(bx - 1), Math.round(by - 7), 2, 4); c.fillRect(Math.round(bx - 1), Math.round(by), 2, 1);
      });
      if (alvo) {
        const tecla = AM.Input.descrever('interagir').replace(/^o botão /, '').replace('botão ', '');
        const txt = `${tecla.length > 6 ? 'A' : tecla} · ${alvo.rotulo}`;
        const bx = alvo.ponto.x - ox, by = alvo.ponto.y - oy - 10 - (reduz() ? 0 : Math.sin(t * 4) * 1.2);
        if (dicaInteracao) {
          const canvasRect = canvas.getBoundingClientRect(), appRect = canvas.parentElement.getBoundingClientRect();
          dicaInteracao.textContent = txt;
          dicaInteracao.style.left = `${canvasRect.left - appRect.left + bx * (canvasRect.width / canvas.width)}px`;
          dicaInteracao.style.top = `${canvasRect.top - appRect.top + by * (canvasRect.height / canvas.height)}px`;
          dicaInteracao.hidden = false;
        }
      }
    },
    ocultarDica() { if (dicaInteracao) dicaInteracao.hidden = true; },
  });

  /* ───────── reação às melhorias ───────── */
  AM.Bus.on('melhoria', (id) => {
    if (id === 'escola_energia') {
      const e = M.edificios.find((x) => x.id === 'escola');
      cutscene({ id, dur: 4.2, para: { x: (e.x + e.w / 2) * T, y: (e.y + e.h / 2) * T }, alvoEscola: 1,
        aoMeio() { AM.Audio.sfx('luz'); const W = e.w * T; for (let i = 0; i < 4; i++) faiscas(e.x * T + ((i + 0.5) * W) / 4, e.y * T + 80, 14, '#ffe28a'); faiscas(e.x * T + (e.porta + 1) * T, e.y * T + e.h * T - 10, 24, '#fff4c0'); } });
    } else if (id === 'vila_iluminada') {
      cutscene({ id, dur: 4, para: { x: 32 * T, y: 15 * T }, alvoVila: 1,
        aoMeio() { AM.Audio.sfx('luz'); M.lampadas.forEach(([lx, ly]) => faiscas(lx * T + 8, ly * T - 6, 6, '#ffd98a')); faiscas(M.canto_leitura.x * T, M.canto_leitura.y * T - 10, 30, '#ffffff'); } });
    }
  });
})();
