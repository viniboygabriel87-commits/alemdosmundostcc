/* ALÉM DOS MUROS — QuestManager: missões orientadas por dados, condições de diálogo e ações. */
(function () {
  'use strict';
  const AM = window.AM;

  const Q = (AM.Quests = {
    def(id) { return AM.Data.missoes[id]; },
    estado(id) { return AM.GameState.dados.missoes[id] || null; },
    iniciada(id) { return !!this.estado(id); },
    concluida(id) { const e = this.estado(id); return !!e && e.estado === 'concluida'; },
    iniciar(id) {
      if (this.iniciada(id) || !this.def(id)) return false;
      AM.GameState.dados.missoes[id] = { estado: 'ativa', passos: {} };
      AM.GameState.marcar();
      AM.Bus.emit('missao:iniciada', id);
      return true;
    },
    tipo(id) { const d = this.def(id); return d ? d.tipo : 'secundaria'; },
    /** Verifica passos com "auto" e missões com "iniciaQuando". Chamado a cada mudança relevante do estado. */
    verificarAuto() {
      if (this._auto || !AM.GameState.dados) return;
      this._auto = true;
      try {
        let mudou = true, voltas = 0;
        while (mudou && voltas++ < 6) {
          mudou = false;
          Object.keys(AM.Data.missoes).forEach((id) => {
            const d = this.def(id);
            if (!this.iniciada(id) && d.iniciaQuando && this.cond(d.iniciaQuando)) { this.iniciar(id); mudou = true; }
            if (!this.iniciada(id) || this.concluida(id)) return;
            d.passos.forEach((p) => { if (p.auto && this.passoEstado(id, p.id) === 'ativo' && this.cond(p.auto)) { this.completarPasso(id, p.id); mudou = true; } });
          });
        }
      } finally { this._auto = false; }
    },
    iniciarDoNovoJogo() { Object.keys(AM.Data.missoes).forEach((id) => { if (AM.Data.missoes[id].iniciaNoNovoJogo) this.iniciar(id); }); },
    /** 'feito' | 'ativo' | 'bloqueado' | 'inativo' */
    passoEstado(id, passo) {
      const e = this.estado(id), d = this.def(id);
      if (!e || !d) return 'inativo';
      if (e.passos[passo]) return 'feito';
      const p = d.passos.find((x) => x.id === passo);
      if (!p) return 'inativo';
      return p.apos.every((a) => e.passos[a]) ? 'ativo' : 'bloqueado';
    },
    passosAtivos(id) { const d = this.def(id); return d ? d.passos.filter((p) => this.passoEstado(id, p.id) === 'ativo') : []; },
    /** passos ativos de todas as missões em andamento (para HUD, diário e marcadores) */
    todosAtivos() {
      const out = [];
      Object.keys(AM.Data.missoes).forEach((id) => { if (this.iniciada(id) && !this.concluida(id)) this.passosAtivos(id).forEach((p) => out.push({ missao: id, passo: p })); });
      return out;
    },
    objetivo() {
      const a = this.todosAtivos();
      return a.length ? a[0].passo.texto : 'Explore a vila e converse com os moradores.';
    },
    progresso(id, dados) {
      const d = this.def(id), src = dados || AM.GameState.dados, e = src.missoes[id];
      if (!d || !e) return 0;
      return Math.round((Object.keys(e.passos).length / d.passos.length) * 100);
    },
    completarPasso(id, passo, opc = {}) {
      if (this.passoEstado(id, passo) !== 'ativo') return false;
      const e = this.estado(id), d = this.def(id), p = d.passos.find((x) => x.id === passo);
      e.passos[passo] = true;
      AM.GameState.marcar();
      AM.Bus.emit('passo', { missao: id, passo, texto: p.texto });
      if (d.passos.every((x) => e.passos[x.id])) this.concluir(id);
      else if (!opc.silencioso) AM.UI.toast('Objetivo cumprido: ' + p.texto, 'ok');
      return true;
    },
    concluir(id) {
      const e = this.estado(id), d = this.def(id);
      if (!e || e.estado === 'concluida') return;
      e.estado = 'concluida';
      const r = d.recompensa || {};
      if (r.pontos) AM.GameState.dados.pontos += r.pontos;
      Object.keys(r.itens || {}).forEach((i) => AM.Inventory.dar(i, r.itens[i]));
      Object.keys(r.conhecimento || {}).forEach((a) => AM.Knowledge.ganhar(a, r.conhecimento[a]));
      (d.aoConcluir || []).forEach((a) => this.executar(a));
      AM.GameState.marcar();
      AM.Bus.emit('missao:concluida', id);
    },
    melhoria(id) {
      if (AM.GameState.dados.melhorias[id]) return;
      AM.GameState.dados.melhorias[id] = true;
      AM.GameState.marcar();
      AM.Bus.emit('melhoria', id);
    },

    /* ───── condições e ações usadas pelos diálogos ───── */
    cond(lista) {
      return (lista || []).every((c) => {
        let neg = false;
        if (c[0] === '!') { neg = true; c = c.slice(1); }
        const i = c.indexOf(':'), tipo = c.slice(0, i), arg = c.slice(i + 1);
        let v = false;
        if (tipo === 'flag') v = AM.GameState.flag(arg);
        else if (tipo === 'feito' || tipo === 'ativo') { const [m, p] = arg.split('.'); v = this.passoEstado(m, p) === (tipo === 'feito' ? 'feito' : 'ativo'); }
        else if (tipo === 'missao_concluida') v = this.concluida(arg);
        else if (tipo === 'missao_iniciada') v = this.iniciada(arg);
        else if (tipo === 'melhoria') v = !!AM.GameState.dados.melhorias[arg];
        else if (tipo === 'tem') { const [it, q] = arg.split(':'); v = AM.Inventory.tem(it, q ? +q : 1); }
        else if (tipo === 'dominio') { const [a, n] = arg.split('>='); v = AM.Knowledge.nivel(a) >= +n; }
        else if (tipo === 'coletado') v = !!AM.GameState.dados.coletados[arg];
        else console.warn('[Quests] condição desconhecida', c);
        return neg ? !v : v;
      });
    },
    executar(a) {
      if (!a) return;
      if (a.flag) AM.GameState.setFlag(a.flag, a.valor === undefined ? true : a.valor);
      if (a.passo) { const [m, p] = a.passo.split('.'); this.completarPasso(m, p); }
      if (a.missao) this.iniciar(a.missao);
      if (a.pontos) { AM.GameState.dados.pontos += a.pontos; AM.GameState.marcar(); }
      if (a.tirarVarios) Object.keys(a.tirarVarios).forEach((i) => AM.Inventory.tirar(i, a.tirarVarios[i]));
      if (a.melhoria) this.melhoria(a.melhoria);
      if (a.item) AM.Inventory.dar(a.item, a.qtd || 1);
      if (a.tirar) AM.Inventory.tirar(a.tirar, a.qtd || 1);
      if (a.conhecimento) AM.Knowledge.ganhar(a.conhecimento.area, a.conhecimento.pontos);
      if (a.sfx) AM.Audio.sfx(a.sfx);
    },
  });

  ['inventario', 'melhoria', 'conhecimento:pontos', 'missao:iniciada', 'dominio'].forEach((ev) => AM.Bus.on(ev, () => Q.verificarAuto()));
})();
