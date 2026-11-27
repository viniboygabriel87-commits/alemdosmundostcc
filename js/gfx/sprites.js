/* ALÉM DOS MUROS — arte em pixel art gerada por código (sprites, retratos, tiles, prédios, props).
   Tudo é desenhado uma vez em canvases offscreen e reaproveitado (cache). Estilo: contorno escuro + 3 tons por material. */
(function () {
  'use strict';
  const AM = window.AM, U = AM.util;
  const OUT = '#1d1726';
  const cache = new Map();

  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; }
  function R(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w === undefined ? 1 : w, h === undefined ? 1 : h); }
  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(h, amt) {
    const f = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
    return '#' + hexRgb(h).map((v) => f(v).toString(16).padStart(2, '0')).join('');
  }
  function disco(g, c, cx, cy, r) { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y + 0.5)); R(g, c, cx - w, cy + y, w * 2 + 1, 1); } }
  function elipse(g, c, cx, cy, rx, ry) { for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(1 - (y * y) / (ry * ry + 0.01)) + 0.5); R(g, c, cx - w, cy + y, w * 2 + 1, 1); } }
  function contorno(c, cor = OUT) {
    const g = c.getContext('2d'), w = c.width, h = c.height;
    const id = g.getImageData(0, 0, w, h), d = id.data, out = new Uint8ClampedArray(d), [r, gg, b] = hexRgb(cor);
    const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 128;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] < 128 && (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1))) { out[i] = r; out[i + 1] = gg; out[i + 2] = b; out[i + 3] = 255; }
    }
    g.putImageData(new ImageData(out, w, h), 0, 0);
    return c;
  }

  /* ───── fonte 3x5 para letreiros ───── */
  const FONTE = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
    G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111',
    M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100', Q: '010101101011001', R: '110101110101101',
    S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
    Y: '101101010010010', Z: '111001010100111', ' ': '000000000000000',
  };
  function texto3x5(g, str, x, y, cor) {
    let cx = x;
    for (const ch of str) {
      const p = FONTE[ch] || FONTE[' '];
      for (let i = 0; i < 15; i++) if (p[i] === '1') R(g, cor, cx + (i % 3), y + Math.floor(i / 3), 1, 1);
      cx += 4;
    }
  }

  /* ───── tiles 16x16 ───── */
  function tile(tipo, v) {
    const key = `t|${tipo}|${v}`;
    if (cache.has(key)) return cache.get(key);
    const [c, g] = mk(16, 16), rnd = U.rng(v * 977 + tipo.length * 131 + 7);
    if (tipo === 'grama') {
      R(g, '#4f9b45', 0, 0, 16, 16);
      for (let i = 0; i < 16; i++) { const x = (rnd() * 15) | 0, y = (rnd() * 14) | 0; R(g, rnd() < 0.5 ? '#448a3b' : '#5fa951', x, y, 1, rnd() < 0.4 ? 2 : 1); }
      for (let i = 0; i < 3; i++) { const x = (rnd() * 14) | 0, y = 2 + ((rnd() * 12) | 0); R(g, '#74c063', x, y, 1, 1); R(g, '#3a7a33', x + 1, y + 1, 1, 1); }
    } else if (tipo === 'terra') {
      R(g, '#b8905c', 0, 0, 16, 16);
      for (let i = 0; i < 14; i++) { const x = (rnd() * 15) | 0, y = (rnd() * 15) | 0; R(g, rnd() < 0.5 ? '#a27b49' : '#c9a56f', x, y, 1, 1); }
      for (let i = 0; i < 2; i++) { const x = (rnd() * 13) | 0, y = (rnd() * 14) | 0; R(g, '#8c6b41', x, y, 2, 1); R(g, '#d6b784', x, y - 1, 1, 1); }
    } else if (tipo === 'pedra') {
      R(g, '#a7adb4', 0, 0, 16, 16);
      R(g, '#8a9098', 0, 7, 16, 1); R(g, '#8a9098', 0, 15, 16, 1);
      R(g, '#8a9098', v % 2 ? 5 : 10, 0, 1, 7); R(g, '#8a9098', v % 2 ? 11 : 4, 8, 1, 7);
      for (let i = 0; i < 6; i++) R(g, rnd() < 0.5 ? '#bcc2c8' : '#9aa0a8', (rnd() * 15) | 0, (rnd() * 15) | 0, 1, 1);
    } else if (tipo === 'muro' || tipo === 'muro_topo') {
      R(g, '#8b8f9a', 0, 0, 16, 16);
      for (let row = 0; row < 4; row++) {
        R(g, '#6c7080', 0, row * 4 + 3, 16, 1);
        const off = row % 2 ? 4 : 0; R(g, '#6c7080', off + 3, row * 4, 1, 3); R(g, '#6c7080', off + 11, row * 4, 1, 3);
      }
      for (let i = 0; i < 6; i++) R(g, '#a3a7b3', (rnd() * 15) | 0, (rnd() * 15) | 0, 2, 1);
      if (tipo === 'muro_topo') { R(g, '#b4b8c4', 0, 0, 16, 3); R(g, '#6c7080', 0, 3, 16, 1); R(g, '#d0d3dc', 0, 0, 16, 1); }
    }
    cache.set(key, c);
    return c;
  }

  /* ───── personagens (16x24 dentro de 18x26) ───── */
  function desenharPersonagem(g, P, dir, passo, corre) {
    const p = P.pal, s = P.estilo || {};
    const andar = passo > 0;
    const fase = andar ? [1, 0, -1, 0][passo - 1] : 0;
    const b = andar && (passo === 2 || passo === 4) ? -1 : 0;
    const amp = corre ? 2 : 1;
    const sombra = mix(p.pele, -28), olho = '#1b1620', boca = '#8a4a3a';
    if (dir === 'down' || dir === 'up') {
      const frente = dir === 'down';
      if (s.cabelo === 'longo') R(g, p.cabelo, 3, 3 + b, 10, 9);
      const lE = fase === 1 ? amp : 0, lD = fase === -1 ? amp : 0;
      R(g, p.calca, 5, 16, 3, 5 - lE); R(g, p.sapato, 5, 21 - lE, 3, 2);
      R(g, p.calca, 8, 16, 3, 5 - lD); R(g, p.sapato, 8, 21 - lD, 3, 2);
      R(g, p.camisa, 4, 10 + b, 8, 7);
      R(g, mix(p.camisa, -28), 4, 15 + b, 8, 1);
      if (s.cachecol && frente) { R(g, p.extra || '#f5b942', 4, 9 + b, 8, 2); R(g, p.extra || '#f5b942', 5, 11 + b, 2, 2); }
      const aE = fase === 1 ? 1 : 0, aD = fase === -1 ? 1 : 0;
      R(g, p.camisa, 2, 10 + b + aE, 2, 3); R(g, p.pele, 2, 13 + b + aE, 2, 2);
      R(g, p.camisa, 12, 10 + b + aD, 2, 3); R(g, p.pele, 12, 13 + b + aD, 2, 2);
      if (s.mochila && !frente) R(g, p.mochila, 4, 10 + b, 8, 6);
      if (s.mochila && frente) { R(g, mix(p.mochila, -20), 5, 10 + b, 1, 5); R(g, mix(p.mochila, -20), 10, 10 + b, 1, 5); }
      R(g, sombra, 6, 9 + b, 4, 1);
      R(g, p.pele, 4, 2 + b, 8, 7);
      if (frente) {
        if (s.cabelo === 'coque') { R(g, p.cabelo, 6, 0 + b, 4, 2); R(g, p.cabelo, 5, 1 + b, 6, 1); R(g, p.cabelo, 4, 2 + b, 8, 2); R(g, p.cabelo, 4, 4 + b, 1, 2); R(g, p.cabelo, 11, 4 + b, 1, 2); }
        else if (s.cabelo === 'bagunca') { R(g, p.cabelo, 4, 1 + b, 8, 3); R(g, p.cabelo, 4, 0 + b, 2, 1); R(g, p.cabelo, 8, 0 + b, 3, 1); R(g, p.cabelo, 4, 4 + b, 1, 2); R(g, p.cabelo, 11, 4 + b, 1, 2); }
        else if (s.cabelo === 'longo') { R(g, p.cabelo, 4, 1 + b, 8, 3); R(g, p.cabelo, 3, 3 + b, 1, 9); R(g, p.cabelo, 12, 3 + b, 1, 9); R(g, p.cabelo, 4, 4 + b, 1, 3); R(g, p.cabelo, 11, 4 + b, 1, 3); R(g, p.cabelo, 7, 3 + b, 3, 1); }
        else { R(g, p.cabelo, 5, 1 + b, 6, 1); R(g, p.cabelo, 4, 2 + b, 8, 2); R(g, p.cabelo, 4, 4 + b, 1, 2); R(g, p.cabelo, 11, 4 + b, 1, 2); }
        if (s.goggles) { R(g, '#3b3b4a', 4, 2 + b, 8, 1); R(g, '#8fd3e8', 5, 1 + b, 2, 2); R(g, '#8fd3e8', 9, 1 + b, 2, 2); R(g, '#3b3b4a', 7, 2 + b, 2, 1); }
        R(g, olho, 6, 5 + b, 1, 2); R(g, olho, 9, 5 + b, 1, 2);
        R(g, boca, 7, 7 + b, 2, 1);
        if (s.oculos) { R(g, '#3b2b2b', 5, 4 + b, 3, 1); R(g, '#3b2b2b', 8, 4 + b, 3, 1); R(g, '#3b2b2b', 5, 7 + b, 3, 1); R(g, '#3b2b2b', 8, 7 + b, 3, 1); R(g, '#3b2b2b', 5, 5 + b, 1, 2); R(g, '#3b2b2b', 10, 5 + b, 1, 2); }
      } else {
        R(g, p.cabelo, 4, 1 + b, 8, 7);
        if (s.cabelo === 'coque') R(g, p.cabelo, 6, 0 + b, 4, 1);
        if (s.tranca) { R(g, p.cabelo, 7, 8 + b, 2, 6); R(g, p.extra || '#ef8383', 7, 13 + b, 2, 1); }
      }
    } else { // lado (direita)
      const o = fase * amp;
      R(g, mix(p.calca, -25), 7 - o, 16, 3, 5); R(g, p.sapato, 7 - o, 21, 4, 2);
      R(g, p.calca, 6 + o, 16, 3, 5); R(g, p.sapato, 6 + o, 21, 4, 2);
      if (s.cabelo === 'longo') R(g, p.cabelo, 3, 3 + b, 5, 9);
      R(g, p.camisa, 5, 10 + b, 6, 7); R(g, mix(p.camisa, -28), 5, 15 + b, 6, 1);
      if (s.cachecol) R(g, p.extra || '#f5b942', 5, 9 + b, 6, 2);
      if (s.mochila) R(g, p.mochila, 3, 10 + b, 3, 6);
      R(g, p.camisa, 6 - o, 10 + b, 3, 3); R(g, p.pele, 6 - o, 13 + b, 3, 2);
      R(g, sombra, 6, 9 + b, 4, 1);
      R(g, p.pele, 5, 2 + b, 7, 7);
      R(g, sombra, 12, 6 + b, 1, 1);
      if (s.cabelo === 'coque') { R(g, p.cabelo, 4, 0 + b, 4, 2); R(g, p.cabelo, 4, 2 + b, 7, 2); R(g, p.cabelo, 4, 4 + b, 3, 3); }
      else if (s.cabelo === 'bagunca') { R(g, p.cabelo, 4, 1 + b, 8, 3); R(g, p.cabelo, 3, 0 + b, 2, 1); R(g, p.cabelo, 7, 0 + b, 3, 1); R(g, p.cabelo, 4, 4 + b, 3, 3); }
      else if (s.cabelo === 'longo') { R(g, p.cabelo, 4, 1 + b, 8, 3); R(g, p.cabelo, 4, 4 + b, 3, 7); }
      else { R(g, p.cabelo, 4, 1 + b, 8, 3); R(g, p.cabelo, 4, 4 + b, 3, 3); }
      if (s.tranca) { R(g, p.cabelo, 4, 8 + b, 2, 5); R(g, p.extra || '#ef8383', 4, 12 + b, 2, 1); }
      if (s.goggles) { R(g, '#3b3b4a', 5, 2 + b, 7, 1); R(g, '#8fd3e8', 9, 1 + b, 2, 2); }
      R(g, olho, 10, 5 + b, 1, 2);
      R(g, boca, 10, 7 + b, 2, 1);
      if (s.oculos) { R(g, '#3b2b2b', 9, 4 + b, 3, 1); R(g, '#3b2b2b', 9, 7 + b, 3, 1); R(g, '#3b2b2b', 9, 5 + b, 1, 2); R(g, '#3b2b2b', 11, 5 + b, 1, 2); }
    }
  }
  function personagem(id, dir, passo, corre) {
    const key = `p|${id}|${dir}|${passo}|${corre ? 1 : 0}`;
    if (cache.has(key)) return cache.get(key);
    let c;
    if (dir === 'left') {
      const r = personagem(id, 'right', passo, corre);
      const [cc, g] = mk(18, 26); g.translate(18, 0); g.scale(-1, 1); g.drawImage(r, 0, 0); c = cc;
    } else {
      const [cc, g] = mk(18, 26); g.translate(1, 1);
      desenharPersonagem(g, AM.Data.personagens[id], dir, passo, corre); contorno(cc); c = cc;
    }
    cache.set(key, c);
    return c;
  }

  /* ───── retratos 48x48 ───── */
  function retrato(id, expr) {
    const key = `r|${id}|${expr}`;
    if (cache.has(key)) return cache.get(key);
    const P = AM.Data.personagens[id], p = P.pal, s = P.estilo || {};
    const [c, g] = mk(48, 48);
    R(g, P.fundo, 0, 0, 48, 48);
    for (let i = 0; i < 48; i += 4) R(g, mix(P.fundo, 10), i, 0, 2, 48);
    const sombra = mix(p.pele, -30), olho = '#1b1620', boca = '#8a3d3d', branco = '#f6f1e6';
    // cabelo de trás
    if (s.cabelo === 'longo') R(g, p.cabelo, 9, 8, 30, 36);
    if (s.cabelo === 'cacheado') R(g, p.cabelo, 8, 6, 32, 24);
    // ombros e pescoço
    R(g, p.camisa, 6, 38, 36, 10); R(g, p.camisa, 9, 36, 30, 2);
    R(g, mix(p.camisa, -30), 6, 46, 36, 2);
    if (s.cachecol) { R(g, p.extra, 14, 35, 20, 4); R(g, p.extra, 14, 38, 6, 6); }
    R(g, sombra, 19, 30, 10, 8);
    // cabeça
    R(g, p.pele, 12, 11, 24, 20); R(g, p.pele, 13, 10, 22, 1); R(g, p.pele, 13, 31, 22, 1); R(g, p.pele, 14, 32, 20, 1);
    R(g, p.pele, 10, 19, 2, 5); R(g, p.pele, 36, 19, 2, 5);
    R(g, sombra, 12, 28, 24, 3);
    // cabelo da frente
    if (s.cabelo === 'coque') { R(g, p.cabelo, 20, 1, 8, 6); R(g, p.cabelo, 21, 0, 6, 1); R(g, p.cabelo, 12, 8, 24, 6); R(g, p.cabelo, 13, 7, 22, 1); R(g, p.cabelo, 11, 10, 3, 9); R(g, p.cabelo, 34, 10, 3, 9); R(g, p.cabelo, 14, 14, 8, 2); R(g, p.cabelo, 28, 14, 6, 1); }
    else if (s.cabelo === 'bagunca') { R(g, p.cabelo, 12, 8, 24, 7); R(g, p.cabelo, 14, 5, 4, 3); R(g, p.cabelo, 22, 4, 5, 4); R(g, p.cabelo, 30, 5, 4, 3); R(g, p.cabelo, 11, 10, 3, 8); R(g, p.cabelo, 34, 10, 3, 8); }
    else if (s.cabelo === 'longo') { R(g, p.cabelo, 12, 8, 24, 7); R(g, p.cabelo, 13, 7, 22, 1); R(g, p.cabelo, 10, 12, 4, 24); R(g, p.cabelo, 34, 12, 4, 24); R(g, p.cabelo, 22, 15, 6, 2); R(g, p.cabelo, 14, 15, 5, 3); }
    else { R(g, p.cabelo, 12, 8, 24, 6); R(g, p.cabelo, 13, 7, 22, 1); R(g, p.cabelo, 11, 10, 3, 8); R(g, p.cabelo, 34, 10, 3, 8); R(g, p.cabelo, 14, 14, 10, 2); }
    if (s.goggles) { R(g, '#3b3b4a', 12, 12, 24, 2); R(g, '#3b3b4a', 14, 7, 8, 7); R(g, '#8fd3e8', 15, 8, 6, 5); R(g, '#3b3b4a', 26, 7, 8, 7); R(g, '#8fd3e8', 27, 8, 6, 5); R(g, '#d8f2fb', 16, 9, 2, 1); R(g, '#d8f2fb', 28, 9, 2, 1); }
    // olhos
    const olhoAberto = (x, dx = 0, dy = 0, tam = 5) => { R(g, branco, x, 19, tam, tam); R(g, olho, x + 1 + dx, 20 + dy, tam - 2, tam - 1); R(g, '#ffffff', x + 1 + dx, 20 + dy, 1, 1); };
    const e = (expr || 'neutra').replace(/[ao]$/, '');
    if (e === 'feliz') {
      [16, 28].forEach((x) => { R(g, olho, x, 22, 1, 1); R(g, olho, x + 1, 21, 3, 1); R(g, olho, x + 4, 22, 1, 1); });
    } else if (e === 'surpres') {
      olhoAberto(16, 0, 0, 6); olhoAberto(28, 0, 0, 6);
    } else if (e === 'pensativ') {
      olhoAberto(16, 1, -1); olhoAberto(28, 1, -1);
    } else { olhoAberto(16); olhoAberto(28); }
    // sobrancelhas
    const sb = mix(p.cabelo, 10);
    if (e === 'preocupad' || e === 'trist') { R(g, sb, 15, 17, 3, 1); R(g, sb, 18, 16, 3, 1); R(g, sb, 27, 16, 3, 1); R(g, sb, 30, 17, 3, 1); }
    else if (e === 'surpres') { R(g, sb, 15, 14, 6, 1); R(g, sb, 27, 14, 6, 1); }
    else if (e === 'pensativ') { R(g, sb, 15, 16, 6, 1); R(g, sb, 27, 14, 6, 1); }
    else if (e === 'feliz') { R(g, sb, 15, 15, 6, 1); R(g, sb, 27, 15, 6, 1); }
    else { R(g, sb, 15, 16, 6, 1); R(g, sb, 27, 16, 6, 1); }
    // nariz e boca
    R(g, sombra, 23, 23, 2, 2);
    if (e === 'feliz') { R(g, boca, 19, 27, 1, 1); R(g, boca, 20, 28, 1, 1); R(g, boca, 21, 29, 6, 1); R(g, boca, 27, 28, 1, 1); R(g, boca, 28, 27, 1, 1); R(g, branco, 22, 28, 4, 1); R(g, '#ef8f8f', 14, 25, 3, 2); R(g, '#ef8f8f', 31, 25, 3, 2); }
    else if (e === 'trist' || e === 'preocupad') { R(g, boca, 20, 29, 1, 1); R(g, boca, 21, 28, 6, 1); R(g, boca, 27, 29, 1, 1); }
    else if (e === 'surpres') { R(g, boca, 22, 26, 4, 5); R(g, '#5a1f2a', 23, 27, 2, 3); }
    else if (e === 'pensativ') { R(g, boca, 22, 28, 5, 1); R(g, boca, 27, 27, 1, 1); }
    else { R(g, boca, 21, 28, 6, 1); }
    if (s.oculos) {
      const f = '#3b2b2b';
      [[14, 18], [26, 18]].forEach(([x, y]) => { R(g, f, x, y, 9, 1); R(g, f, x, y + 7, 9, 1); R(g, f, x, y, 1, 8); R(g, f, x + 8, y, 1, 8); });
      R(g, f, 23, 20, 3, 1); R(g, 'rgba(255,255,255,0.18)', 15, 19, 7, 6); R(g, 'rgba(255,255,255,0.18)', 27, 19, 7, 6);
    }
    cache.set(key, c);
    return c;
  }

  /* ───── árvores e plantas ───── */
  function arvore(v) {
    const key = `a|${v}`;
    if (cache.has(key)) return cache.get(key);
    const pal = [['#2c7a3a', '#3f9a48', '#63bd5e'], ['#26684a', '#348856', '#58ab76'], ['#3d8a2b', '#58a83d', '#86c957']][v % 3];
    const [cc, g] = mk(44, 40), rnd = U.rng(v * 31 + 5);
    if (v % 4 === 3) { // pinheiro
      for (let i = 0; i < 4; i++) {
        const y = 4 + i * 8, w = 6 + i * 5;
        for (let r = 0; r < 12; r++) { const ww = Math.floor((w * (r + 1)) / 12); R(g, pal[0], 22 - ww, y + r, ww * 2, 1); }
        for (let r = 0; r < 12; r++) { const ww = Math.floor((w * (r + 1)) / 12 * 0.6); R(g, pal[1], 22 - ww + 3, y + r, ww, 1); }
      }
    } else {
      disco(g, pal[0], 22, 22, 17); disco(g, pal[0], 12, 24, 10); disco(g, pal[0], 32, 24, 10);
      disco(g, pal[1], 20, 18, 13); disco(g, pal[1], 11, 22, 8); disco(g, pal[1], 31, 22, 8);
      disco(g, pal[2], 17, 13, 7); disco(g, pal[2], 28, 17, 4);
      for (let i = 0; i < 18; i++) R(g, rnd() < 0.5 ? pal[2] : pal[0], 6 + ((rnd() * 32) | 0), 8 + ((rnd() * 24) | 0), 2, 1);
      if (v % 3 === 1) for (let i = 0; i < 5; i++) R(g, '#e0584f', 10 + ((rnd() * 24) | 0), 12 + ((rnd() * 16) | 0), 2, 2);
    }
    contorno(cc);
    const [tc, tg] = mk(12, 18);
    R(tg, '#6b4a2e', 3, 0, 6, 18); R(tg, '#8a6240', 3, 0, 2, 18); R(tg, '#4d3421', 8, 0, 1, 18); R(tg, '#6b4a2e', 1, 15, 10, 3);
    contorno(tc);
    const o = { copa: cc, tronco: tc };
    cache.set(key, o);
    return o;
  }
  function arbusto(v) {
    const key = `ab|${v}`;
    if (cache.has(key)) return cache.get(key);
    const [c, g] = mk(20, 14), rnd = U.rng(v + 91);
    disco(g, '#2f8a3d', 6, 8, 5); disco(g, '#2f8a3d', 13, 8, 6); disco(g, '#43a64d', 9, 6, 5); disco(g, '#68c164', 8, 5, 3);
    for (let i = 0; i < 3; i++) R(g, '#f27f9a', 3 + ((rnd() * 13) | 0), 4 + ((rnd() * 7) | 0), 1, 1);
    contorno(c); cache.set(key, c); return c;
  }
  function flor(cor) {
    const key = `f|${cor}`;
    if (cache.has(key)) return cache.get(key);
    const [c, g] = mk(7, 9);
    R(g, '#3f8639', 3, 4, 1, 5); R(g, '#3f8639', 2, 6, 1, 1); R(g, '#3f8639', 4, 7, 1, 1);
    R(g, cor, 2, 1, 3, 3); R(g, cor, 3, 0, 1, 1); R(g, cor, 3, 4, 1, 1); R(g, '#ffe28a', 3, 2, 1, 1);
    cache.set(key, c); return c;
  }

  /* ───── props ───── */
  function prop(nome, estado) {
    const key = `pr|${nome}|${estado ? 1 : 0}`;
    if (cache.has(key)) return cache.get(key);
    let c, g;
    switch (nome) {
      case 'lampada': {
        [c, g] = mk(14, 30);
        R(g, '#2b2f3a', 6, 11, 2, 17); R(g, '#2b2f3a', 4, 26, 6, 3); R(g, '#3b4150', 6, 11, 1, 16);
        R(g, '#2b2f3a', 3, 3, 8, 8); R(g, estado ? '#ffe9a8' : '#5b6575', 4, 4, 6, 6); R(g, estado ? '#fff6d6' : '#7a8496', 5, 5, 2, 2);
        R(g, '#2b2f3a', 2, 2, 10, 2); R(g, '#3b4150', 5, 0, 4, 2);
        break;
      }
      case 'banco': {
        [c, g] = mk(22, 14);
        R(g, '#7a5530', 1, 0, 20, 3); R(g, '#a07040', 1, 0, 20, 1); R(g, '#9a6b3f', 0, 5, 22, 4); R(g, '#b98650', 0, 5, 22, 1);
        R(g, '#4d3421', 2, 9, 2, 5); R(g, '#4d3421', 18, 9, 2, 5);
        break;
      }
      case 'caixote': {
        [c, g] = mk(13, 13);
        R(g, '#a8773f', 0, 0, 13, 13); R(g, '#7a5429', 0, 0, 13, 2); R(g, '#7a5429', 0, 11, 13, 2); R(g, '#7a5429', 0, 0, 2, 13); R(g, '#7a5429', 11, 0, 2, 13);
        R(g, '#7a5429', 2, 2, 1, 1); R(g, '#c18f55', 3, 3, 7, 1); R(g, '#7a5429', 3, 6, 7, 1);
        break;
      }
      case 'placa': {
        [c, g] = mk(18, 24);
        R(g, '#6b4a2e', 8, 9, 2, 15); R(g, '#b98a50', 1, 1, 16, 10); R(g, '#8a6a3a', 1, 1, 16, 1); R(g, '#8a6a3a', 1, 10, 16, 1);
        R(g, '#4d3421', 4, 4, 10, 1); R(g, '#4d3421', 4, 6, 8, 1); R(g, '#4d3421', 4, 8, 6, 1);
        break;
      }
      case 'mural': {
        [c, g] = mk(30, 26);
        R(g, '#6b4a2e', 3, 14, 3, 12); R(g, '#6b4a2e', 24, 14, 3, 12);
        R(g, '#5b3d24', 0, 0, 30, 18); R(g, '#c9a46a', 2, 2, 26, 14);
        R(g, '#f6f1e6', 4, 4, 7, 6); R(g, '#f5b942', 13, 4, 6, 5); R(g, '#f6f1e6', 21, 5, 5, 7); R(g, '#ef8383', 5, 11, 6, 4); R(g, '#4cc3b0', 14, 11, 5, 4);
        R(g, '#d33b3b', 7, 3, 1, 1); R(g, '#d33b3b', 15, 3, 1, 1);
        for (let i = 0; i < 4; i++) { R(g, '#6b4a2e', 5, 6 + i, 5 - (i % 2), 1); }
        break;
      }
      case 'poco': {
        [c, g] = mk(24, 26);
        R(g, '#6b4a2e', 3, 0, 2, 14); R(g, '#6b4a2e', 19, 0, 2, 14); R(g, '#9a5b3c', 0, 0, 24, 5); R(g, '#b9744f', 0, 0, 24, 2);
        elipse(g, '#8a9098', 12, 18, 10, 6); elipse(g, '#a7adb4', 12, 17, 10, 5); elipse(g, '#25384d', 12, 17, 7, 3);
        R(g, '#8a9098', 2, 18, 20, 6); R(g, '#a7adb4', 2, 18, 20, 2);
        for (let i = 0; i < 4; i++) R(g, '#6f747c', 4 + i * 5, 20, 1, 4);
        break;
      }
      case 'quadro': {
        [c, g] = mk(16, 26);
        R(g, '#5b5f6a', 7, 12, 2, 14); R(g, '#8a919c', 1, 1, 14, 13); R(g, '#aab2bd', 2, 2, 12, 11); R(g, '#6b727d', 1, 13, 14, 1);
        R(g, '#f5b942', 5, 4, 6, 6); R(g, '#1d1726', 8, 5, 1, 2); R(g, '#1d1726', 7, 7, 2, 1); R(g, '#1d1726', 7, 8, 1, 1);
        R(g, estado ? '#7bd36b' : '#d94b4b', 12, 3, 2, 2);
        R(g, '#2b2f3a', 3, 14, 1, 6); R(g, '#2b2f3a', 12, 14, 1, 4);
        break;
      }
      case 'estante': {
        [c, g] = mk(24, 28);
        R(g, '#6b4a2e', 0, 0, 24, 28); R(g, '#8a6240', 1, 1, 22, 26);
        for (let r = 0; r < 3; r++) {
          R(g, '#4d3421', 1, 8 + r * 9, 22, 2); R(g, '#3a2a1a', 2, 1 + r * 9, 20, 7);
          let x = 2; const cores = ['#d94b4b', '#4a7bb0', '#f5b942', '#4cc3b0', '#a3405f', '#7bd36b'];
          for (let i = 0; i < 6; i++) { const w = 2 + ((i + r) % 2); R(g, cores[(i + r * 2) % 6], x, 2 + r * 9 + ((i % 3 === 0) ? 1 : 0), w, 6 - ((i % 3 === 0) ? 1 : 0)); x += w + 1; }
        }
        break;
      }
      case 'portao': {
        [c, g] = mk(64, 52);
        R(g, '#767b87', 0, 0, 14, 52); R(g, '#9298a6', 0, 0, 4, 52); R(g, '#5d626e', 12, 0, 2, 52);
        R(g, '#767b87', 50, 0, 14, 52); R(g, '#9298a6', 50, 0, 4, 52); R(g, '#5d626e', 62, 0, 2, 52);
        R(g, '#b4b8c4', 0, 0, 14, 3); R(g, '#b4b8c4', 50, 0, 14, 3);
        R(g, '#1c1f27', 14, 6, 36, 46);
        for (let x = 17; x < 50; x += 5) R(g, '#3b4150', x, 6, 2, 46);
        R(g, '#3b4150', 14, 16, 36, 2); R(g, '#3b4150', 14, 38, 36, 2);
        R(g, '#6b4a2e', 22, 26, 20, 3); R(g, '#8a6a3a', 22, 26, 20, 1);
        R(g, '#a8774f', 29, 29, 6, 7); R(g, '#1d1726', 31, 31, 2, 2);
        for (let i = 0; i < 6; i++) R(g, '#7a4a21', 18 + i * 5, 22 + (i % 2) * 2, 3, 2);
        break;
      }
      default: [c, g] = mk(8, 8);
    }
    contorno(c);
    cache.set(key, c);
    return c;
  }

  function fonteBase() {
    if (cache.has('fonte')) return cache.get('fonte');
    const [c, g] = mk(48, 38);
    elipse(g, '#8a9098', 24, 26, 22, 11); elipse(g, '#b5bbc2', 24, 24, 22, 10); elipse(g, '#8a9098', 24, 24, 18, 8);
    elipse(g, '#3f95c9', 24, 24, 17, 7); elipse(g, '#5cb4e6', 24, 23, 14, 5);
    R(g, '#b5bbc2', 21, 8, 6, 15); R(g, '#8a9098', 21, 8, 1, 15); elipse(g, '#b5bbc2', 24, 8, 8, 3); elipse(g, '#5cb4e6', 24, 8, 6, 2);
    R(g, '#b5bbc2', 23, 2, 2, 6);
    contorno(c); cache.set('fonte', c); return c;
  }

  /* ───── prédios ───── */
  function edificio(def, aceso, aberta) {
    const key = `e|${def.id}|${aceso ? 1 : 0}|${aberta ? 1 : 0}`;
    if (cache.has(key)) return cache.get(key);
    const W = def.w * 16, H = def.h * 16, [c, g] = mk(W, H);
    const rh = Math.round(H * 0.46), wall = def.wall, roof = def.roof;
    R(g, wall, 0, rh, W, H - rh);
    for (let x = 0; x < W; x += 8) R(g, mix(wall, -12), x, rh, 1, H - rh);
    R(g, mix(wall, 10), 0, rh + 3, W, 1);
    R(g, mix(wall, -50), 0, H - 5, W, 5); R(g, mix(wall, -30), 0, H - 5, W, 1);
    // telhado
    R(g, roof, 0, 0, W, rh);
    for (let y = 4; y < rh - 3; y += 6) {
      R(g, mix(roof, -22), 0, y, W, 1);
      for (let x = ((y / 6) % 2) * 5; x < W; x += 10) R(g, mix(roof, -22), x, y - 5 > 0 ? y - 5 : 0, 1, 5);
    }
    for (let y = 1; y < rh - 3; y += 6) R(g, mix(roof, 18), 0, y, W, 1);
    R(g, mix(roof, 35), 0, 0, W, 2); R(g, mix(roof, -38), 0, rh - 3, W, 3); R(g, 'rgba(0,0,0,0.28)', 0, rh, W, 4);
    // porta
    const dc = def.porta * 16 + 16, dw = 24, dh = 28, dx = dc - dw / 2, dy = H - 5 - dh + 3;
    R(g, '#4d3421', dx - 2, dy - 2, dw + 4, dh + 2);
    const isEscola = def.id === 'escola';
    if (isEscola && aceso) {
      R(g, '#ffd98a', dx, dy, dw, dh); R(g, '#fff0c0', dx + 3, dy + 3, dw - 6, dh - 8);
      R(g, '#a8774f', dx, dy, 3, dh); R(g, '#a8774f', dx + dw - 3, dy, 3, dh);
    } else if (def.id === 'biblioteca' && aberta) {
      R(g, '#251e2b', dx, dy, dw, dh); R(g, '#6b4a2e', dx, dy, 4, dh);
      R(g, '#9a7448', dx + 4, dy + 3, 2, dh - 6); R(g, '#f5b942', dx + dw - 5, dy + dh / 2, 2, 2);
      R(g, '#d94b4b', dx + 9, dy + 8, 3, 6); R(g, '#4a7bb0', dx + 13, dy + 6, 3, 8);
    } else if (def.id === 'biblioteca') {
      R(g, '#6b4a2e', dx, dy, dw, dh); R(g, '#8a6240', dx, dy, dw, 1);
      R(g, '#9a7448', dx - 3, dy + 4, dw + 6, 4); R(g, '#9a7448', dx - 3, dy + 14, dw + 6, 4); R(g, '#9a7448', dx - 3, dy + 22, dw + 6, 4);
      for (const yy of [4, 14, 22]) { R(g, '#3a2a1a', dx - 2, dy + yy + 1, 1, 1); R(g, '#3a2a1a', dx + dw + 1, dy + yy + 1, 1, 1); }
    } else {
      R(g, '#7a4a21', dx, dy, dw, dh); R(g, '#9a6234', dx + 2, dy + 2, dw / 2 - 3, dh - 4); R(g, '#9a6234', dx + dw / 2 + 1, dy + 2, dw / 2 - 3, dh - 4);
      R(g, '#f5b942', dx + dw - 6, dy + dh / 2, 2, 2);
    }
    R(g, '#8a8f98', dx - 3, H - 5, dw + 6, 3);
    // janelas
    const n = Math.max(2, Math.floor(W / 50));
    for (let i = 0; i < n; i++) {
      const cx = ((i + 0.5) * W) / n;
      if (Math.abs(cx - dc) < 30) continue;
      const wx = Math.round(cx - 10), wy = rh + 9, ww = 20, wh = 18;
      R(g, '#4d3421', wx - 2, wy - 2, ww + 4, wh + 4);
      if (def.id === 'biblioteca') {
        R(g, '#1c2230', wx, wy, ww, wh); R(g, '#9a7448', wx - 3, wy + 3, ww + 6, 4); R(g, '#9a7448', wx - 3, wy + 11, ww + 6, 4);
      } else {
        R(g, aceso ? '#ffd98a' : '#27384f', wx, wy, ww, wh);
        if (aceso) { R(g, '#fff0c0', wx + 2, wy + 2, ww - 4, wh - 6); } else { R(g, '#3f5a7a', wx + 2, wy + 2, 5, 2); R(g, '#3f5a7a', wx + 2, wy + 4, 3, 1); }
        R(g, '#4d3421', wx + ww / 2, wy, 1, wh); R(g, '#4d3421', wx, wy + wh / 2, ww, 1);
        R(g, '#b9a98a', wx - 3, wy + wh + 2, ww + 6, 2);
        if (def.id === 'casa_lia') { R(g, '#a8774f', wx, wy + wh + 3, ww, 3); R(g, '#ef8383', wx + 3, wy + wh, 3, 3); R(g, '#f5b942', wx + 9, wy + wh, 3, 3); R(g, '#4cc3b0', wx + 15, wy + wh, 3, 3); }
      }
    }
    // letreiro
    if (def.nome) {
      const tw = def.nome.length * 4 + 3, tx = Math.round(dc - tw / 2), ty = dy - 14;
      R(g, '#4d3421', tx - 1, ty - 1, tw + 2, 9); R(g, '#e8d7ae', tx, ty, tw, 7);
      texto3x5(g, def.nome, tx + 2, ty + 1, '#3a2a1a');
    }
    // detalhes por prédio
    if (isEscola) {
      const cx = Math.round(W / 2);
      R(g, mix(roof, -15), cx - 12, 2, 24, 20); R(g, mix(roof, 18), cx - 12, 2, 24, 2); R(g, '#e8d7ae', cx - 8, 8, 16, 12);
      R(g, '#1c2230', cx - 3, 11, 6, 9); R(g, '#f5b942', cx - 2, 12, 4, 4); R(g, '#f5b942', cx - 1, 16, 2, 2);
      R(g, '#6b4a2e', cx - 1, -0, 2, 2);
      R(g, '#6b4a2e', 12, 0, 1, 16); R(g, aceso ? '#4cc3b0' : '#6aa59b', 13, 1, 9, 6); R(g, '#f5b942', 15, 3, 4, 2);
      if (aceso) { R(g, '#2f9e8f', W / 2 - 26, rh + 5, 52, 10); R(g, '#1d6f64', W / 2 - 26, rh + 14, 52, 1); texto3x5(g, 'ESCOLA ABERTA', Math.round(W / 2 - 25), rh + 7, '#fff4d0'); }
    }
    if (def.id === 'oficina') {
      R(g, '#7a4a3a', W - 30, 2, 10, 20); R(g, '#5b3328', W - 31, 1, 12, 3);
      R(g, '#6b727d', 14, rh + 36, 14, 3); // engrenagem simplificada
      disco(g, '#c9a56f', 24, rh + 34, 4); disco(g, '#8a6a3a', 24, rh + 34, 2);
      for (const [ox, oy] of [[0, -6], [0, 6], [-6, 0], [6, 0]]) R(g, '#c9a56f', 24 + ox - 1, rh + 34 + oy - 1, 3, 3);
    }
    if (def.id === 'casa_vizinha') { R(g, '#7a4a3a', W - 26, 2, 9, 18); R(g, '#5b3328', W - 27, 1, 11, 3); }
    if (def.id === 'casa_lia') { R(g, '#7a4a3a', 14, 3, 9, 16); R(g, '#5b3328', 13, 2, 11, 3); }
    if (def.id === 'biblioteca') {
      for (const [ix, iy] of [[3, H - 6], [6, H - 14], [4, H - 22], [8, H - 30], [W - 6, H - 8], [W - 4, H - 18]]) { disco(g, '#2f8a3d', ix, iy, 3); disco(g, '#43a64d', ix, iy - 1, 2); }
      R(g, '#5b4a7a', W / 2 - 14, 2, 28, 8);
    }
    cache.set(key, c);
    return c;
  }

  const brilhos = new Map();
  function brilho(raio, cor) {
    const key = raio + cor;
    if (brilhos.has(key)) return brilhos.get(key);
    const [c, g] = mk(raio * 2, raio * 2);
    const grad = g.createRadialGradient(raio, raio, 0, raio, raio, raio);
    grad.addColorStop(0, cor); grad.addColorStop(1, 'rgba(255,200,90,0)');
    g.fillStyle = grad; g.fillRect(0, 0, raio * 2, raio * 2);
    brilhos.set(key, c);
    return c;
  }

  /* ───── ícones de itens (12x12), gerados a partir de AM.Data.itens[id].icone ───── */
  function item(id) {
    const key = 'it|' + id;
    if (cache.has(key)) return cache.get(key);
    const ic = AM.Data.itens[id].icone, cor = ic.c, esc = mix(cor, -40), cl = mix(cor, 40);
    const [c, g] = mk(12, 12);
    switch (ic.f) {
      case 'livro': R(g, esc, 2, 1, 8, 10); R(g, cor, 2, 1, 7, 9); R(g, cl, 3, 2, 1, 7); R(g, '#f4ecd8', 3, 10, 7, 1); R(g, '#f4ecd8', 5, 4, 3, 1); R(g, '#f4ecd8', 5, 6, 3, 1); break;
      case 'tabua': R(g, esc, 0, 3, 12, 3); R(g, cor, 0, 3, 12, 2); R(g, esc, 1, 7, 11, 3); R(g, cor, 1, 7, 11, 2); R(g, cl, 2, 3, 3, 1); R(g, '#3a2a1a', 9, 4, 1, 1); break;
      case 'parafuso': for (const [x, y] of [[2, 2], [7, 3], [4, 7]]) { R(g, esc, x, y, 3, 3); R(g, cor, x, y, 3, 2); R(g, '#555d6a', x + 1, y + 1, 1, 1); R(g, cor, x + 1, y + 3, 1, 2); } break;
      case 'corda': disco(g, esc, 6, 6, 5); disco(g, cor, 6, 6, 4); g.clearRect(5, 5, 2, 2); R(g, cl, 3, 3, 2, 1); R(g, cl, 8, 8, 2, 1); break;
      case 'chave': R(g, esc, 5, 1, 2, 9); R(g, cor, 5, 1, 1, 9); R(g, esc, 3, 0, 6, 3); R(g, cor, 3, 0, 6, 2); R(g, '#1d1726', 5, 1, 2, 1); R(g, esc, 4, 9, 4, 2); break;
      case 'bota': R(g, esc, 2, 1, 5, 8); R(g, cor, 3, 1, 4, 7); R(g, esc, 2, 8, 9, 3); R(g, cor, 2, 8, 8, 2); R(g, cl, 3, 2, 1, 5); R(g, '#f4ecd8', 3, 1, 4, 1); break;
      default: { // estrela / coração da comunidade
        R(g, esc, 5, 0, 2, 12); R(g, esc, 0, 5, 12, 2); R(g, esc, 2, 2, 8, 8); R(g, cor, 5, 1, 2, 10); R(g, cor, 1, 5, 10, 2); R(g, cor, 3, 3, 6, 6); R(g, cl, 4, 4, 2, 2);
      }
    }
    contorno(c);
    cache.set(key, c); return c;
  }

  AM.Gfx = { item, mk, R, mix, disco, elipse, contorno, texto3x5, tile, personagem, retrato, arvore, arbusto, flor, prop, fonteBase, edificio, brilho };
})();
