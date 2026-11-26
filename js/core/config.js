/* ALÉM DOS MUROS — núcleo: configuração, barramento de eventos, utilidades, preferências */
(function () {
  'use strict';
  const AM = (window.AM = { Data: {}, UI: {}, Modal: null });

  AM.Config = {
    VERSAO_JOGO: '0.2.0 (Etapa 2 · web)',
    VERSAO_SAVE: 2,
    TILE: 16,
    CHAVE_SAVE: 'alem_dos_muros.save',
    CHAVE_BACKUP: 'alem_dos_muros.save.bak',
    CHAVE_CFG: 'alem_dos_muros.config',
    AUTOSAVE_MS: 30000,
    AREAS: ['matematica', 'portugues', 'logica', 'conhecimentos'],
    AREA_NOME: {
      matematica: 'Matemática', portugues: 'Português', logica: 'Lógica', conhecimentos: 'Conhecimentos gerais',
    },
    NIVEL_NOME: { 1: 'Iniciante', 2: 'Intermediário', 3: 'Avançado' },
  };

  /* ---------- barramento de eventos ---------- */
  AM.Bus = {
    _h: {},
    on(ev, fn) { (this._h[ev] = this._h[ev] || []).push(fn); return () => this.off(ev, fn); },
    off(ev, fn) { this._h[ev] = (this._h[ev] || []).filter((f) => f !== fn); },
    emit(ev, ...args) {
      (this._h[ev] || []).slice().forEach((f) => { try { f(...args); } catch (e) { console.error('[Bus]', ev, e); } });
    },
  };

  /* ---------- utilidades ---------- */
  AM.util = {
    clamp: (v, a, b) => Math.min(b, Math.max(a, v)),
    lerp: (a, b, t) => a + (b - a) * t,
    hash(x, y, s = 0) {
      let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 2147483647)) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    },
    rng(seed) {
      let s = seed >>> 0;
      return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    clone: (o) => JSON.parse(JSON.stringify(o)),
    el(tag, props, ...kids) {
      const e = document.createElement(tag);
      if (props) {
        for (const k in props) {
          const v = props[k];
          if (v === null || v === undefined || v === false) continue;
          if (k === 'class') e.className = v;
          else if (k === 'texto') e.textContent = v;
          else if (k === 'html') e.innerHTML = v;
          else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
          else if (k === 'estilo') { for (const n in v) { if (n.startsWith('--')) e.style.setProperty(n, v[n]); else e.style[n] = v[n]; } }
          else e.setAttribute(k, v === true ? '' : v);
        }
      }
      kids.flat().forEach((c) => { if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c))); });
      return e;
    },
    fmtMetros(cm) {
      return (cm / 100).toFixed(2).replace(/\.?0+$/, '').replace('.', ',');
    },
    fmtTempo(s) {
      s = Math.floor(s);
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
      return h ? `${h} h ${m} min` : `${m} min`;
    },
    embaralhar(arr, rnd = Math.random) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
  };

  /* ---------- pilha de modais (diálogo, puzzle, menus) ---------- */
  AM.Modal = {
    pilha: [],
    push(m) { this.pilha.push(m); AM.Bus.emit('modal', this.pilha.length); return m; },
    pop(m) { this.pilha = this.pilha.filter((x) => x !== m); AM.Bus.emit('modal', this.pilha.length); },
    topo() { return this.pilha[this.pilha.length - 1] || null; },
    aberto() { return this.pilha.length > 0; },
  };

  /* ---------- preferências (acessibilidade, volume, controles) ---------- */
  AM.Settings = {
    dados: null,
    padrao() {
      let reduzir = false;
      try { reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignora */ }
      return { volMestre: 0.8, volMusica: 0.5, volEfeitos: 0.8, texto: 1, contraste: false, reduzirAnim: reduzir, teclas: {}, joystick: 'auto' };
    },
    carregar() {
      this.dados = this.padrao();
      try {
        const raw = localStorage.getItem(AM.Config.CHAVE_CFG);
        if (raw) {
          const o = JSON.parse(raw);
          if (o && typeof o === 'object') {
            for (const k in this.dados) if (k in o && typeof o[k] === typeof this.dados[k]) this.dados[k] = o[k];
          }
        }
      } catch (e) { /* armazenamento indisponível ou corrompido: usa padrões */ }
      this.aplicar();
    },
    salvar() { try { localStorage.setItem(AM.Config.CHAVE_CFG, JSON.stringify(this.dados)); } catch (e) { /* sem armazenamento */ } },
    set(k, v) { this.dados[k] = v; this.aplicar(); this.salvar(); AM.Bus.emit('config', k, v); },
    aplicar() {
      const r = document.documentElement;
      r.style.setProperty('--escala-texto', String(this.dados.texto));
      r.classList.toggle('alto-contraste', !!this.dados.contraste);
      r.classList.toggle('sem-anim', !!this.dados.reduzirAnim);
      if (AM.Audio && AM.Audio.aplicar) AM.Audio.aplicar();
      if (AM.Input && AM.Input.recarregarTeclas) AM.Input.recarregarTeclas();
    },
  };
})();
