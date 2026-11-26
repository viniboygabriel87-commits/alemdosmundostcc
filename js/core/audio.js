/* ALÉM DOS MUROS — AudioManager (WebAudio, sons sintetizados; sem arquivos externos) */
(function () {
  'use strict';
  const AM = window.AM;
  let ctx = null, mestre, bmusica, befeitos, tema = null, timer = null, prox = 0, passo = 0;

  const PENTA = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];
  const TEMAS = {
    vila: { notas: PENTA, bpm: 66, baixo: [130.81, 98.0, 110.0, 87.31], vol: 0.5 },
    menu: { notas: [196.0, 220.0, 261.63, 293.66, 329.63], bpm: 46, baixo: [98.0, 110.0, 87.31, 98.0], vol: 0.45 },
  };

  function iniciar() {
    if (ctx) return;
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return;
      ctx = new C();
      mestre = ctx.createGain(); bmusica = ctx.createGain(); befeitos = ctx.createGain();
      bmusica.connect(mestre); befeitos.connect(mestre); mestre.connect(ctx.destination);
      aplicar();
    } catch (e) { ctx = null; }
  }
  function retomar() { iniciar(); if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); }
  function aplicar() {
    if (!ctx || !AM.Settings.dados) return;
    const s = AM.Settings.dados;
    mestre.gain.value = s.volMestre; bmusica.gain.value = s.volMusica * 0.6; befeitos.gain.value = s.volEfeitos;
  }
  function tom(freq, dur, o = {}) {
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime + (o.atraso || 0);
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.tipo || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.desliza) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + o.desliza), t + dur);
    const v = o.vol === undefined ? 0.2 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + (o.ataque || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(o.dest || befeitos);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  const SFX = {
    clique() { tom(660, 0.07, { tipo: 'square', vol: 0.07 }); },
    blip() { tom(520 + Math.random() * 80, 0.035, { tipo: 'square', vol: 0.035 }); },
    passo() { tom(95 + Math.random() * 30, 0.06, { tipo: 'triangle', vol: 0.06 }); },
    girar() { tom(330, 0.05, { tipo: 'square', vol: 0.08 }); tom(440, 0.05, { tipo: 'square', vol: 0.06, atraso: 0.04 }); },
    pegar() { tom(500, 0.08, { tipo: 'triangle', vol: 0.12 }); },
    ok() { [523, 659, 784, 1047].forEach((f, i) => tom(f, 0.22, { tipo: 'triangle', vol: 0.16, atraso: i * 0.09 })); },
    erro() { tom(220, 0.18, { tipo: 'sawtooth', vol: 0.07, desliza: -60 }); },
    dica() { tom(740, 0.12, { vol: 0.12 }); tom(988, 0.16, { vol: 0.1, atraso: 0.08 }); },
    abrir() { tom(392, 0.1, { tipo: 'triangle', vol: 0.1 }); tom(587, 0.12, { tipo: 'triangle', vol: 0.1, atraso: 0.06 }); },
    fechar() { tom(587, 0.1, { tipo: 'triangle', vol: 0.09 }); tom(392, 0.12, { tipo: 'triangle', vol: 0.09, atraso: 0.06 }); },
    missao() { [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tom(f, 0.4, { tipo: 'triangle', vol: 0.15, atraso: i * 0.12 })); },
    passoMissao() { tom(659, 0.15, { tipo: 'triangle', vol: 0.14 }); tom(880, 0.25, { tipo: 'triangle', vol: 0.14, atraso: 0.1 }); },
    luz() { tom(110, 1.4, { tipo: 'sawtooth', vol: 0.06, desliza: 220 }); [523, 784, 1047, 1568].forEach((f, i) => tom(f, 0.6, { vol: 0.12, atraso: 0.5 + i * 0.1 })); },
    salvar() { tom(880, 0.08, { vol: 0.08 }); tom(1175, 0.1, { vol: 0.07, atraso: 0.07 }); },
  };

  function agendar() {
    if (!ctx || ctx.state !== 'running' || !tema) return;
    const T = TEMAS[tema];
    const dur = 60 / T.bpm;
    while (prox < ctx.currentTime + 0.8) {
      if (prox < ctx.currentTime) prox = ctx.currentTime + 0.05;
      const compasso = Math.floor(passo / 8) % T.baixo.length;
      if (passo % 8 === 0) {
        const f = T.baixo[compasso];
        tom(f, dur * 8, { tipo: 'triangle', vol: 0.11 * T.vol, ataque: 0.8, dest: bmusica, atraso: prox - ctx.currentTime });
        tom(f * 1.5, dur * 8, { tipo: 'sine', vol: 0.07 * T.vol, ataque: 1.2, dest: bmusica, atraso: prox - ctx.currentTime });
      }
      if (Math.random() < 0.55) {
        const n = T.notas[Math.floor(Math.random() * T.notas.length)];
        tom(n, dur * 2.4, { tipo: 'sine', vol: 0.12 * T.vol, ataque: 0.02, dest: bmusica, atraso: prox - ctx.currentTime });
      }
      prox += dur; passo++;
    }
  }

  AM.Audio = {
    aplicar, retomar,
    sfx(nome) { try { retomar(); if (SFX[nome]) SFX[nome](); } catch (e) { /* ignora */ } },
    musica(nome) {
      if (nome === tema) return;
      tema = nome; passo = 0; prox = 0;
      if (timer) { clearInterval(timer); timer = null; }
      if (!nome) return;
      timer = setInterval(agendar, 250); // só toca depois que o navegador liberar o áudio (primeira interação)
    },
  };
  // desbloqueio do áudio na primeira interação do usuário
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, () => { retomar(); }, { passive: true }));
})();
