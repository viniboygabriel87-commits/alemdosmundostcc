/* ALÉM DOS MUROS — Inventário e recursos: livros, materiais, ferramentas, equipamentos e recursos da comunidade.
   Sem microtransações: todo item vem de exploração, missões ou desafios. */
(function () {
  'use strict';
  const AM = window.AM;
  const inv = () => AM.GameState.dados.inventario;

  AM.Inventory = {
    def(id) { return AM.Data.itens[id]; },
    qtd(id) { return inv().itens[id] || 0; },
    tem(id, n = 1) { return this.qtd(id) >= n; },
    /** adiciona itens; itens "únicos" não passam de 1. Retorna quanto entrou de fato. */
    dar(id, n = 1, opc = {}) {
      const d = this.def(id); if (!d) { console.warn('[Inventory] item desconhecido', id); return 0; }
      const antes = this.qtd(id), max = d.unico ? 1 : 99;
      const depois = Math.min(max, antes + n);
      if (depois === antes) return 0;
      inv().itens[id] = depois;
      AM.GameState.marcar();
      if (!opc.silencioso) { AM.UI.toast(`Você recebeu: ${d.nome}${depois - antes > 1 ? ' ×' + (depois - antes) : ''}`, 'ok'); AM.Audio.sfx('pegar'); }
      AM.Bus.emit('inventario', id);
      return depois - antes;
    },
    tirar(id, n = 1) {
      if (!this.tem(id, n)) return false;
      inv().itens[id] -= n;
      if (inv().itens[id] <= 0) { delete inv().itens[id]; delete inv().equipado[id]; }
      AM.GameState.marcar(); AM.Bus.emit('inventario', id);
      return true;
    },
    /** lista agrupada por categoria: [{cat, itens:[{id, def, qtd}]}] */
    lista() {
      const out = [];
      Object.keys(AM.Data.categorias).forEach((cat) => {
        const itens = Object.keys(inv().itens).filter((id) => this.def(id) && this.def(id).cat === cat).map((id) => ({ id, def: this.def(id), qtd: inv().itens[id] }));
        if (itens.length) out.push({ cat, itens });
      });
      return out;
    },
    total() { return Object.keys(inv().itens).length; },
    equipado(id) { return !!inv().equipado[id]; },
    equipar(id, ligar) {
      const d = this.def(id); if (!d || d.uso !== 'equipar' || !this.tem(id)) return false;
      if (ligar) inv().equipado[id] = true; else delete inv().equipado[id];
      AM.GameState.marcar(); AM.Bus.emit('inventario', id);
      return true;
    },
    /** multiplicador de um efeito passivo (ex.: 'vel') somando todos os equipamentos em uso */
    mult(efeito) {
      let m = 1;
      Object.keys(inv().equipado).forEach((id) => { const d = this.def(id); if (d && d.efeito && d.efeito[efeito]) m *= d.efeito[efeito]; });
      return m;
    },
    jaLeu(id) { return !!inv().lidos[id]; },
    /** ler um livro: gera pontos de conhecimento na área (uma vez por livro) e libera o registro correspondente */
    ler(id) {
      const d = this.def(id);
      if (!d || d.uso !== 'ler' || !this.tem(id)) return { ok: false };
      const primeira = !this.jaLeu(id);
      if (primeira) {
        inv().lidos[id] = true;
        AM.Knowledge.ganhar(d.area, AM.Data.dominio.pontosLeitura);
        AM.Knowledge.desbloquear('livro:' + id);
        AM.GameState.marcar();
      }
      const k = AM.Data.conhecimentos.find((x) => x.origem === 'livro:' + id);
      return { ok: true, primeira, area: d.area, pontos: primeira ? AM.Data.dominio.pontosLeitura : 0, registro: k || null };
    },
  };
})();
