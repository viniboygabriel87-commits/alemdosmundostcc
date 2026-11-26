/* ALÉM DOS MUROS — GameState (estado do jogo) e SaveSystem (salvamento com versão, checksum, backup e migração) */
(function () {
  'use strict';
  const AM = window.AM, C = AM.Config, U = AM.util;
  const DIRS = ['up', 'down', 'left', 'right'];
  const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);

  function fnv(str) { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return (h >>> 0).toString(16); }

  function padrao() {
    const m = AM.Data.mapa;
    return {
      criadoEm: Date.now(), tempoJogo: 0,
      pos: { x: m.inicio.x * C.TILE, y: m.inicio.y * C.TILE, dir: m.inicio.dir },
      flags: {}, missoes: {}, adaptativo: AM.Adaptive.padrao(), pontos: 0,
      melhorias: {}, regioes: { vila: true }, puzzles: {}, decisoes: {},
      inventario: { itens: {}, equipado: {}, lidos: {} },
      conhecimento: AM.Knowledge ? AM.Knowledge.padrao() : {},
      registro: {}, coletados: {}, descobertos: {},
    };
  }

  AM.GameState = {
    dados: null, sujo: false,
    novo() { this.dados = padrao(); this.sujo = true; },
    carregar(d) { this.dados = d; this.sujo = false; },
    flag(k) { return !!this.dados.flags[k]; },
    setFlag(k, v = true) { this.dados.flags[k] = v; this.sujo = true; },
    marcar() { this.sujo = true; },
  };

  /* ───── migrações: chave = versão de origem ───── */
  const MIGRACOES = {
    // v1 → v2 (Etapa 2): inventário, conhecimento por área, registro, coletáveis e locais descobertos
    1: (d) => {
      d.inventario = { itens: {}, equipado: {}, lidos: {} };
      d.conhecimento = {}; d.registro = {}; d.coletados = {}; d.descobertos = { praca: true };
      // quem já concluiu a missão principal recebe o apoio da comunidade que a recompensa passou a dar
      if (d.missoes && d.missoes.escola_luz && d.missoes.escola_luz.estado === 'concluida') d.inventario.itens.apoio_comunidade = 2;
      // pontos de conhecimento antigos viram progresso nas áreas dos desafios já resolvidos
      const area = { circuito: 'logica', energia: 'conhecimentos', cabos: 'matematica', bilhete: 'portugues' };
      Object.keys(d.puzzles || {}).forEach((id) => { if (area[id] && d.puzzles[id] && d.puzzles[id].vezes > 0) d.conhecimento[area[id]] = { pontos: 10 * (d.puzzles[id].melhorNivel || 1) }; });
      return d;
    },
  };
  function migrar(corpo) {
    let v = corpo.v | 0;
    if (v > C.VERSAO_SAVE) throw new Error('save de uma versão mais nova do jogo');
    let d = corpo.d;
    while (v < C.VERSAO_SAVE) { if (!MIGRACOES[v]) throw new Error('sem migração da versão ' + v); d = MIGRACOES[v](d); v++; }
    return d;
  }

  function validar(d) {
    if (!isObj(d)) throw new Error('dados inválidos');
    const base = padrao(), out = base;
    const W = AM.Data.mapa.w * C.TILE, H = AM.Data.mapa.h * C.TILE;
    if (isObj(d.pos) && isFinite(d.pos.x) && isFinite(d.pos.y)) {
      out.pos = { x: U.clamp(+d.pos.x, 8, W - 8), y: U.clamp(+d.pos.y, 56, H - 16), dir: DIRS.includes(d.pos.dir) ? d.pos.dir : 'down' };
    }
    ['flags', 'missoes', 'melhorias', 'regioes', 'puzzles', 'decisoes'].forEach((k) => { if (isObj(d[k])) out[k] = d[k]; });
    if (isFinite(d.pontos)) out.pontos = Math.max(0, +d.pontos);
    if (isFinite(d.tempoJogo)) out.tempoJogo = Math.max(0, +d.tempoJogo);
    if (isFinite(d.criadoEm)) out.criadoEm = +d.criadoEm;
    out.adaptativo = AM.Adaptive.normalizar(d.adaptativo);
    ['registro', 'coletados', 'descobertos'].forEach((k) => { if (isObj(d[k])) out[k] = d[k]; });
    if (isObj(d.inventario)) {
      const inv = out.inventario;
      ['itens', 'equipado', 'lidos'].forEach((k) => { if (isObj(d.inventario[k])) inv[k] = d.inventario[k]; });
      Object.keys(inv.itens).forEach((id) => { if (!AM.Data.itens[id] || !(inv.itens[id] > 0)) delete inv.itens[id]; else inv.itens[id] = Math.min(99, Math.floor(inv.itens[id])); });
      Object.keys(inv.equipado).forEach((id) => { if (!inv.itens[id]) delete inv.equipado[id]; });
    }
    out.conhecimento = AM.Knowledge.normalizar(d.conhecimento);
    out.regioes.vila = true;
    return out;
  }

  function decodificar(str) {
    if (!str) throw new Error('vazio');
    const env = JSON.parse(str);
    if (!env || typeof env.b !== 'string' || fnv(env.b) !== env.s) throw new Error('checksum inválido (arquivo danificado)');
    const corpo = JSON.parse(env.b);
    return { dados: validar(migrar(corpo)), t: corpo.t };
  }

  AM.SaveSystem = {
    memoria: null, // reserva quando o navegador bloqueia o armazenamento
    _ler(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    _gravar(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    _remover(k) { try { localStorage.removeItem(k); } catch (e) { /* ignora */ } },
    temSave() { return !!(this._ler(C.CHAVE_SAVE) || this._ler(C.CHAVE_BACKUP) || this.memoria); },
    resumo() {
      const r = this.carregar(true);
      if (!r.ok) return null;
      const d = r.dados, passos = AM.Quests ? AM.Quests.progresso('escola_luz', d) : 0;
      return { tempo: d.tempoJogo, pontos: d.pontos, progresso: passos, recuperado: r.recuperado, missoes: Object.keys(d.missoes).filter((m) => d.missoes[m].estado === 'concluida').length };
    },
    salvar(motivo) {
      try {
        if (!AM.GameState.dados) return false;
        if (AM.World && AM.World.sincronizarEstado) AM.World.sincronizarEstado();
        const corpo = JSON.stringify({ v: C.VERSAO_SAVE, t: Date.now(), d: AM.GameState.dados });
        const env = JSON.stringify({ s: fnv(corpo), b: corpo });
        const atual = this._ler(C.CHAVE_SAVE);
        let ok = true;
        if (atual) { try { decodificar(atual); this._gravar(C.CHAVE_BACKUP, atual); } catch (e) { /* não propaga save ruim para o backup */ } }
        ok = this._gravar(C.CHAVE_SAVE, env);
        if (!ok) this.memoria = env; else this.memoria = null;
        AM.GameState.sujo = false;
        AM.Bus.emit('save', { ok, motivo, memoria: !ok });
        return ok;
      } catch (e) {
        console.error('[Save]', e);
        AM.Bus.emit('save', { ok: false, motivo, erro: e.message });
        return false;
      }
    },
    /** Retorna {ok, dados, recuperado, erro}. Tenta o save principal, depois o backup. */
    carregar(silencioso) {
      const tentativas = [[C.CHAVE_SAVE, this._ler(C.CHAVE_SAVE)], [C.CHAVE_BACKUP, this._ler(C.CHAVE_BACKUP)], ['memoria', this.memoria]];
      let erro = null, falhouPrincipal = false;
      for (let i = 0; i < tentativas.length; i++) {
        const [nome, str] = tentativas[i];
        if (!str) continue;
        try {
          const r = decodificar(str);
          return { ok: true, dados: r.dados, recuperado: i > 0 && falhouPrincipal, quando: r.t };
        } catch (e) { erro = e.message; if (i === 0) falhouPrincipal = true; if (!silencioso) console.warn('[Save] falha em', nome, e.message); }
      }
      return { ok: false, erro: erro || 'nenhum save encontrado' };
    },
    apagar() { this._remover(C.CHAVE_SAVE); this._remover(C.CHAVE_BACKUP); this.memoria = null; },
    exportar() {
      this.salvar('exportar');
      const str = this._ler(C.CHAVE_SAVE) || this.memoria;
      return str ? btoa(unescape(encodeURIComponent(str))) : '';
    },
    importar(texto) {
      try {
        const str = decodeURIComponent(escape(atob(texto.trim())));
        decodificar(str); // valida antes de gravar
        if (!this._gravar(C.CHAVE_SAVE, str)) this.memoria = str;
        return { ok: true };
      } catch (e) { return { ok: false, erro: 'Código inválido ou danificado.' }; }
    },
  };
})();
