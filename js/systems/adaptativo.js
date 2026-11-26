/* ALÉM DOS MUROS — dificuldade adaptativa por área.
   Considera acertos/erros, dicas, tempo (só como bônus: nunca penaliza quem precisa de mais tempo) e histórico recente.
   Sobe ou desce de forma gradual e só com evidência (pelo menos 2 desafios recentes na mesma direção). */
(function () {
  'use strict';
  const AM = window.AM, C = AM.Config, U = AM.util;

  function areaPadrao() {
    return { nivel: 1, manual: null, evidencia: 0.5, tentativas: 0, resolvidos: 0, erros: 0, dicas: 0, tempoTotal: 0, recentes: [], reforco: false, dominados: [], ultimo: '', fracos: {} };
  }

  AM.Adaptive = {
    padrao() { const o = {}; C.AREAS.forEach((a) => (o[a] = areaPadrao())); return o; },
    normalizar(raw) {
      const out = this.padrao();
      if (raw && typeof raw === 'object') {
        C.AREAS.forEach((a) => {
          const r = raw[a];
          if (!r || typeof r !== 'object') return;
          const o = out[a];
          if ([1, 2, 3].includes(r.nivel)) o.nivel = r.nivel;
          if ([1, 2, 3].includes(r.manual)) o.manual = r.manual;
          if (isFinite(r.evidencia)) o.evidencia = U.clamp(+r.evidencia, 0, 1);
          ['tentativas', 'resolvidos', 'erros', 'dicas', 'tempoTotal'].forEach((k) => { if (isFinite(r[k])) o[k] = Math.max(0, +r[k]); });
          if (Array.isArray(r.recentes)) o.recentes = r.recentes.filter((x) => isFinite(x)).slice(-5);
          if (Array.isArray(r.dominados)) o.dominados = r.dominados.filter((x) => typeof x === 'string');
          o.reforco = !!r.reforco;
          if (typeof r.ultimo === 'string') o.ultimo = r.ultimo;
          if (r.fracos && typeof r.fracos === 'object') Object.keys(r.fracos).forEach((k) => { if (isFinite(r.fracos[k]) && r.fracos[k] > 0) o.fracos[k] = Math.min(6, +r.fracos[k]); });
        });
      }
      return out;
    },
    dados(area) { return AM.GameState.dados.adaptativo[area]; },
    nivelBase(area) { return this.dados(area).nivel; },
    /** nível usado de fato: escolha manual do jogador tem prioridade */
    nivel(area) { const d = this.dados(area); return d.manual || d.nivel; },
    definirManual(area, n) { this.dados(area).manual = n; AM.GameState.marcar(); AM.Bus.emit('adaptativo', area); },
    /** escolhe a variante do desafio para o nível atual */
    escolher(area, puzzle) {
      const n = this.nivel(area);
      const vs = puzzle.variantes;
      return { nivel: vs[n] ? n : 1, variante: vs[n] || vs[1] };
    },
    /** Escolhe, no banco de desafios da área, o mais útil agora: prioriza assuntos com dificuldade recente (tags fracas),
        o que ainda não foi dominado no nível atual e evita repetir o último. Retorna o id do desafio. */
    escolherDesafio(area) {
      const d = this.dados(area), n = this.nivel(area);
      const ids = Object.keys(AM.Data.puzzles).filter((id) => AM.Data.puzzles[id].area === area);
      if (!ids.length) return null;
      const pontos = ids.map((id) => {
        const p = AM.Data.puzzles[id], v = p.variantes[n] || p.variantes[1], tag = v.tag || p.tag;
        let s = Math.random() * 0.5;
        if (tag && d.fracos[tag]) s += 1.5 + Math.min(2, d.fracos[tag] * 0.5);
        if (!d.dominados.includes(id + '@' + n)) s += 1;
        if (!(AM.GameState.dados.puzzles[id] && AM.GameState.dados.puzzles[id].vezes)) s += 0.6;
        if (id === d.ultimo && ids.length > 1) s -= 3;
        return { id, s };
      });
      pontos.sort((a, b) => b.s - a.s);
      return pontos[0].id;
    },
    precisaReforco(area) { return this.dados(area).reforco; },
    /** Pontuação 0..1 de "evidência de aprendizagem" de um desafio concluído. */
    pontuar(r) {
      let s = 1;
      s -= Math.min(0.5, r.erros * 0.12);
      s -= Math.min(0.3, r.dicas * 0.1);
      if (r.tempoMs > 0 && r.tempoEsperadoMs > 0 && r.tempoMs < r.tempoEsperadoMs * 0.6 && r.erros === 0) s += 0.05; // bônus; lento nunca perde pontos
      return U.clamp(s, 0.25, 1);
    },
    /** Registra um desafio resolvido. Retorna {mudou:'subiu'|'desceu'|null, nivelAnterior, nivelNovo}. */
    registrar(area, r) {
      const d = this.dados(area);
      const score = this.pontuar(r);
      d.tentativas += r.tentativas || 1; d.resolvidos += 1; d.erros += r.erros; d.dicas += r.dicas; d.tempoTotal += Math.round(r.tempoMs / 1000);
      d.evidencia = U.clamp(d.evidencia * 0.65 + score * 0.35, 0, 1);
      d.recentes.push(+score.toFixed(2)); d.recentes = d.recentes.slice(-5);
      d.ultimo = r.puzzleId || d.ultimo;
      // dificuldade por tipo de assunto: erros e dicas marcam o assunto como "fraco"; acertos de primeira o aliviam (sem punir)
      if (r.tag) {
        if (r.erros > 0 || r.dicas > 1) d.fracos[r.tag] = Math.min(6, (d.fracos[r.tag] || 0) + 1);
        else if (d.fracos[r.tag]) { d.fracos[r.tag]--; if (d.fracos[r.tag] <= 0) delete d.fracos[r.tag]; }
      }
      if (r.dominio && !d.dominados.includes(r.puzzleId + '@' + r.nivel)) d.dominados.push(r.puzzleId + '@' + r.nivel);
      const ultimos = d.recentes.slice(-2);
      const anterior = d.nivel;
      let mudou = null;
      if (!d.manual) {
        if (d.nivel < 3 && d.evidencia >= 0.78 && ultimos.length >= 2 && ultimos.every((x) => x >= 0.7)) { d.nivel++; d.evidencia = 0.55; d.recentes = []; mudou = 'subiu'; d.reforco = false; }
        else if (d.nivel > 1 && d.evidencia <= 0.38 && ultimos.length >= 2 && ultimos.every((x) => x <= 0.5)) { d.nivel--; d.evidencia = 0.5; d.recentes = []; mudou = 'desceu'; }
      }
      // reforço: dificuldade em dois desafios seguidos → próximo vem com mais apoio (sem punição)
      d.reforco = score <= 0.5 && ultimos.length >= 2 && ultimos.every((x) => x <= 0.55);
      // Etapa 1: com apenas um desafio por área, a subida também considera um primeiro desempenho muito forte
      if (!mudou && !d.manual && d.nivel < 3 && d.recentes.length === 1 && score >= 0.95 && d.resolvidos === 1) { d.nivel++; d.evidencia = 0.6; mudou = 'subiu'; }
      AM.GameState.marcar();
      AM.Bus.emit('adaptativo', area, { mudou, score });
      return { mudou, nivelAnterior: anterior, nivelNovo: d.nivel, score };
    },
  };
})();
