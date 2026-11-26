/* ALÉM DOS MUROS — entrada unificada: teclado, gamepad e toque, com remapeamento (equivale ao Input Map) */
(function () {
  'use strict';
  const AM = window.AM;
  const ACOES = ['cima', 'baixo', 'esquerda', 'direita', 'interagir', 'correr', 'pausa', 'diario', 'mochila', 'mapa'];
  const ROTULO = {
    cima: 'Mover para cima', baixo: 'Mover para baixo', esquerda: 'Mover para a esquerda', direita: 'Mover para a direita',
    interagir: 'Interagir / avançar', correr: 'Correr (segurar)', pausa: 'Menu / voltar', diario: 'Diário de missões', mochila: 'Mochila', mapa: 'Mapa',
  };
  const PADRAO = {
    cima: ['KeyW', 'ArrowUp'], baixo: ['KeyS', 'ArrowDown'], esquerda: ['KeyA', 'ArrowLeft'], direita: ['KeyD', 'ArrowRight'],
    interagir: ['KeyE', 'Enter', 'Space'], correr: ['ShiftLeft', 'ShiftRight'], pausa: ['Escape', 'KeyP'], diario: ['KeyJ', 'KeyQ'], mochila: ['KeyI'], mapa: ['KeyM'],
  };
  const NOMES = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', Space: 'Espaço', ShiftLeft: 'Shift', ShiftRight: 'Shift', Escape: 'Esc', Enter: 'Enter', Tab: 'Tab' };
  const nomeTecla = (c) => NOMES[c] || c.replace(/^Key/, '').replace(/^Digit/, '');

  let teclas = AM.util.clone(PADRAO);
  let mapaCod = {};
  const seguradas = new Set();
  const toque = {};
  const padHeld = {};
  const padPrev = {};
  let eixoToque = { x: 0, y: 0 };
  let eixoPad = { x: 0, y: 0 };
  let modo = 'teclado';
  let captura = null;
  try { if (window.matchMedia('(pointer: coarse)').matches) modo = 'toque'; } catch (e) { /* ignora */ }

  function reconstruir() {
    mapaCod = {};
    ACOES.forEach((a) => teclas[a].forEach((c) => { if (c) (mapaCod[c] = mapaCod[c] || []).push(a); }));
  }
  reconstruir();

  const Input = (AM.Input = {
    ACOES, ROTULO, PADRAO, nomeTecla,
    recarregarTeclas() {
      teclas = AM.util.clone(PADRAO);
      const t = (AM.Settings.dados && AM.Settings.dados.teclas) || {};
      ACOES.forEach((a) => { if (t[a] && t[a][0]) teclas[a][0] = t[a][0]; });
      reconstruir();
    },
    teclasDe(a) { return teclas[a].filter(Boolean); },
    /** Redefine a tecla principal de uma ação. Se já estiver em uso, troca com a outra ação. */
    remapear(acao, codigo) {
      const salvo = (AM.Settings.dados.teclas = Object.assign({}, AM.Settings.dados.teclas));
      const atuais = {}; ACOES.forEach((a) => (atuais[a] = teclas[a][0]));
      const outra = ACOES.find((a) => a !== acao && atuais[a] === codigo);
      if (outra) salvo[outra] = [atuais[acao]];
      salvo[acao] = [codigo];
      AM.Settings.set('teclas', salvo);
    },
    restaurarTeclas() { AM.Settings.set('teclas', {}); },
    capturar(cb) { captura = { cb }; },
    cancelarCaptura() { captura = null; },
    down(a) {
      return teclas[a].some((c) => c && seguradas.has(c)) || !!toque[a] || !!padHeld[a];
    },
    vetor() {
      let x = (this.down('direita') ? 1 : 0) - (this.down('esquerda') ? 1 : 0);
      let y = (this.down('baixo') ? 1 : 0) - (this.down('cima') ? 1 : 0);
      x += eixoToque.x + eixoPad.x; y += eixoToque.y + eixoPad.y;
      const l = Math.hypot(x, y);
      if (l > 1) { x /= l; y /= l; }
      return { x, y, mag: Math.min(1, l) };
    },
    setEixoToque(x, y) { eixoToque = { x, y }; if (x || y) modo = 'toque'; },
    toqueBotao(a, ativo) {
      toque[a] = ativo;
      if (ativo) { modo = 'toque'; AM.Bus.emit('acao', a); }
    },
    modo() { return modo; },
    definirModo(m) { modo = m; },
    descrever(a) {
      if (a === 'mover') {
        if (modo === 'toque') return 'o joystick virtual';
        if (modo === 'gamepad') return 'o analógico esquerdo';
        return [teclas.cima[0], teclas.esquerda[0], teclas.baixo[0], teclas.direita[0]].map(nomeTecla).join('');
      }
      if (modo === 'toque') return { interagir: 'o botão A', correr: 'o botão Correr', pausa: 'o botão Menu', diario: 'o botão Diário', mochila: 'o botão Mochila', mapa: 'o menu' }[a] || a;
      if (modo === 'gamepad') return { interagir: 'A', correr: 'X', pausa: 'Start', diario: 'Y', mochila: 'LB', mapa: 'Select' }[a] || a;
      return nomeTecla(teclas[a][0]);
    },
    /** chamar uma vez por quadro: lê o gamepad */
    atualizar() {
      let gp = null;
      try { gp = (navigator.getGamepads && Array.from(navigator.getGamepads()).find((g) => g && g.connected)) || null; } catch (e) { /* ignora */ }
      if (!gp) { eixoPad = { x: 0, y: 0 }; ACOES.forEach((a) => (padHeld[a] = false)); return; }
      const dz = (v) => (Math.abs(v) < 0.22 ? 0 : v);
      let ax = dz(gp.axes[0] || 0), ay = dz(gp.axes[1] || 0);
      const b = (i) => !!(gp.buttons[i] && gp.buttons[i].pressed);
      const dpad = { cima: b(12), baixo: b(13), esquerda: b(14), direita: b(15) };
      const estado = {
        cima: dpad.cima || ay < -0.6, baixo: dpad.baixo || ay > 0.6, esquerda: dpad.esquerda || ax < -0.6, direita: dpad.direita || ax > 0.6,
        interagir: b(0), pausa: b(9) || b(1), diario: b(3), mochila: b(4), mapa: b(8), correr: b(2) || b(5) || b(7),
      };
      eixoPad = { x: dpad.direita ? 1 : dpad.esquerda ? -1 : ax, y: dpad.baixo ? 1 : dpad.cima ? -1 : ay };
      ACOES.forEach((a) => {
        const agora = !!estado[a];
        if (agora && !padPrev[a] && a !== 'correr') { modo = 'gamepad'; AM.Bus.emit('acao', a); }
        padPrev[a] = agora;
        padHeld[a] = a === 'correr' ? agora : false; // movimento do pad entra por eixoPad
      });
      if (Math.abs(eixoPad.x) + Math.abs(eixoPad.y) > 0) modo = 'gamepad';
    },
  });

  window.addEventListener('keydown', (e) => {
    if (captura) {
      e.preventDefault();
      const cb = captura.cb; captura = null;
      cb(e.code === 'Escape' ? null : e.code);
      return;
    }
    const t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const acoes = mapaCod[e.code];
    if (!acoes) return;
    if (tag === 'BUTTON' && (e.code === 'Enter' || e.code === 'Space')) return; // o próprio botão trata
    e.preventDefault();
    if (!seguradas.has(e.code)) {
      seguradas.add(e.code);
      modo = 'teclado';
      acoes.forEach((a) => AM.Bus.emit('acao', a));
    }
  });
  window.addEventListener('keyup', (e) => { seguradas.delete(e.code); });
  window.addEventListener('blur', () => { seguradas.clear(); eixoToque = { x: 0, y: 0 }; });
})();
