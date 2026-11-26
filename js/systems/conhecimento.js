/* ALÉM DOS MUROS — Progressão de conhecimento por área (3 níveis de domínio), registro de conhecimentos e descoberta de locais. */
(function () {
  'use strict';
  const AM = window.AM, C = AM.Config, D = () => AM.Data.dominio;

  const K = (AM.Knowledge = {
    padrao() { const o = {}; C.AREAS.forEach((a) => (o[a] = { pontos: 0 })); return o; },
    normalizar(raw) {
      const o = this.padrao();
      if (raw && typeof raw === 'object') C.AREAS.forEach((a) => { if (raw[a] && isFinite(raw[a].pontos)) o[a].pontos = Math.max(0, Math.floor(raw[a].pontos)); });
      return o;
    },
    pontos(area) { return AM.GameState.dados.conhecimento[area].pontos; },
    nivelDePontos(p) { const l = D().limites; return p >= l[2] ? 3 : p >= l[1] ? 2 : 1; },
    nivel(area) { return this.nivelDePontos(this.pontos(area)); },
    /** {nivel, pontos, de, ate, frac}: progresso dentro do nível atual */
    progresso(area) {
      const p = this.pontos(area), n = this.nivelDePontos(p), l = D().limites;
      if (n === 3) return { nivel: 3, pontos: p, de: l[2], ate: null, frac: 1 };
      return { nivel: n, pontos: p, de: l[n - 1], ate: l[n], frac: (p - l[n - 1]) / (l[n] - l[n - 1]) };
    },
    ganhar(area, n) {
      if (!n || !AM.GameState.dados.conhecimento[area]) return;
      const antes = this.nivel(area);
      AM.GameState.dados.conhecimento[area].pontos += n;
      AM.GameState.marcar();
      const depois = this.nivel(area);
      AM.Bus.emit('conhecimento:pontos', area, n);
      if (depois > antes) {
        AM.UI.toast(`${C.AREA_NOME[area]}: domínio ${D().nomes[depois]}!`, 'ok');
        AM.Audio.sfx('missao');
        AM.Inventory.dar('apoio_comunidade', 1, { silencioso: false });
        AM.Bus.emit('dominio', { area, nivel: depois });
      }
    },
    /* registro de conhecimentos */
    desbloquear(origem) {
      AM.Data.conhecimentos.filter((k) => k.origem === origem).forEach((k) => {
        const reg = AM.GameState.dados.registro;
        if (reg[k.id]) return;
        reg[k.id] = true; AM.GameState.marcar();
        AM.UI.toast('Novo registro de conhecimento: ' + k.titulo, 'ok');
        AM.Bus.emit('conhecimento', k.id);
      });
    },
    desbloqueados() { return AM.Data.conhecimentos.filter((k) => AM.GameState.dados.registro[k.id]); },

    /* locais descobertos (mapa) */
    descobrir(id) {
      const d = AM.GameState.dados.descobertos;
      if (d[id]) return false;
      d[id] = true; AM.GameState.marcar();
      const l = AM.Data.locais.find((x) => x.id === id);
      if (l) AM.UI.toast('Local descoberto: ' + l.nome, 'ok');
      AM.Bus.emit('descoberta', id);
      return true;
    },
    verificarLocais(px, py) {
      const T = C.TILE;
      AM.Data.locais.forEach((l) => { if (!AM.GameState.dados.descobertos[l.id] && Math.hypot(px / T - l.x, py / T - l.y) <= l.r) this.descobrir(l.id); });
    },
    percentualDescoberto() { const n = AM.Data.locais.filter((l) => AM.GameState.dados.descobertos[l.id]).length; return Math.round((n / AM.Data.locais.length) * 100); },
    /** áreas disponíveis para "leitura guiada" no cantinho, de acordo com as melhorias feitas (benefícios dos dados) */
    areasDeLeitura() {
      const set = new Set();
      Object.keys(AM.GameState.dados.melhorias).forEach((m) => { const b = AM.Data.melhorias[m] && AM.Data.melhorias[m].beneficio; if (b && b.areas) b.areas.forEach((a) => set.add(a)); });
      return C.AREAS.filter((a) => set.has(a));
    },
  });
})();
