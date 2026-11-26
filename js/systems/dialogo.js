/* ALÉM DOS MUROS — DialogueManager: retrato com expressão, texto animado, opções, falas condicionadas ao progresso. */
(function () {
  'use strict';
  const AM = window.AM, U = AM.util, el = U.el;

  AM.Dialogue = {
    ativo: false,
    formatar(txt) {
      const I = AM.Input;
      return txt.replace(/\{(\w+)\}/g, (m, k) => {
        if (k === 'mover') return I.descrever('mover');
        if (k === 'objetivo') return AM.Quests.objetivo();
        if (['interagir', 'correr', 'pausa', 'diario'].includes(k)) return I.descrever(k);
        return m;
      });
    },
    entrada(chave) {
      const lista = AM.Data.dialogos[chave] || [];
      return lista.find((e) => AM.Quests.cond(e.cond)) || null;
    },
    /** Inicia a conversa de "chave". Retorna Promise resolvida ao fechar. */
    iniciar(chave) {
      const ent = this.entrada(chave);
      if (!ent || this.ativo) return Promise.resolve();
      this.ativo = true;
      const self = this;
      return new Promise((resolve) => {
        const quem = el('div', { class: 'dlg-nome' });
        const texto = el('p', { class: 'dlg-texto', 'aria-live': 'polite' });
        const opcoes = el('div', { class: 'dlg-opcoes', role: 'group' });
        const dica = el('span', { class: 'dlg-seta', 'aria-hidden': 'true', texto: '▼' });
        const retr = el('canvas', { class: 'dlg-retrato', width: 48, height: 48, 'aria-hidden': 'true' });
        const moldura = el('div', { class: 'dlg-retrato-moldura', 'aria-hidden': 'true' }, retr);
        const caixa = el('div', { class: 'dlg-caixa' }, quem, texto, opcoes, dica);
        const box = el('div', { class: 'dialogo', role: 'dialog', 'aria-label': 'Conversa' }, moldura, caixa);
        AM.UI.camada().append(box);

        let no = null, noId = null, timer = null, completo = true, sel = 0, botoes = [], fimAcoes = null, fechado = false;
        const modal = { id: 'dialogo', acao: (a) => agir(a) };
        AM.Modal.push(modal); AM.Audio.sfx('abrir');
        box.addEventListener('pointerdown', (e) => { if (e.target.closest('.dlg-opcoes')) return; agir('interagir'); });

        function agir(a) {
          if (fechado) return;
          if (a === 'interagir') {
            if (!completo) { terminarTexto(); return; }
            if (botoes.length) { botoes[sel].click(); return; }
            avancar();
          } else if (a === 'cima' || a === 'baixo') {
            if (completo && botoes.length) { sel = (sel + (a === 'baixo' ? 1 : -1) + botoes.length) % botoes.length; marcar(); AM.Audio.sfx('clique'); }
          }
        }
        function marcar() { botoes.forEach((b, i) => b.classList.toggle('sel', i === sel)); if (botoes[sel]) botoes[sel].focus({ preventScroll: true }); }
        function terminarTexto() { clearInterval(timer); texto.textContent = AM.Dialogue.formatar(no.texto); completo = true; depoisDoTexto(); }

        function mostrar(id) {
          noId = id; no = ent.nos[id];
          if (!no) { fechar(); return; }
          if (no.puzzle) {
            box.hidden = true;
            AM.Puzzles.abrir(no.puzzle).then((r) => {
              box.hidden = false;
              const prox = r.resolvido ? no.ok : no.cancelar;
              if (prox) mostrar(prox); else fechar();
            });
            return;
          }
          (no.acoes || []).forEach((a) => AM.Quests.executar(a));
          fimAcoes = no.fimAcoes || null;
          const pid = no.quem || 'narrador', P = AM.Data.personagens[pid];
          box.classList.toggle('sem-retrato', pid === 'narrador');
          quem.textContent = pid === 'narrador' ? '' : P.nome;
          quem.hidden = pid === 'narrador';
          texto.classList.toggle('narracao', pid === 'narrador');
          if (pid !== 'narrador') {
            const g = retr.getContext('2d'); g.imageSmoothingEnabled = false; g.clearRect(0, 0, 48, 48); g.drawImage(AM.Gfx.retrato(pid, no.expr || 'neutra'), 0, 0);
          }
          opcoes.replaceChildren(); botoes = []; sel = 0; dica.hidden = true;
          const full = AM.Dialogue.formatar(no.texto);
          clearInterval(timer);
          if (AM.Settings.dados.reduzirAnim) { texto.textContent = full; completo = true; depoisDoTexto(); return; }
          texto.textContent = ''; completo = false;
          let i = 0;
          timer = setInterval(() => {
            i += 1; texto.textContent = full.slice(0, i);
            if (i % 3 === 0) AM.Audio.sfx('blip');
            if (i >= full.length) { clearInterval(timer); completo = true; depoisDoTexto(); }
          }, 26);
        }
        function depoisDoTexto() {
          const ops = (no.opcoes || []).filter((o) => AM.Quests.cond(o.cond));
          if (ops.length) {
            botoes = ops.map((o, i) => el('button', { class: 'dlg-opcao', type: 'button', onclick: () => { AM.Audio.sfx('clique'); (o.acoes || []).forEach((a) => AM.Quests.executar(a)); if (o.prox) mostrar(o.prox); else fechar(); } }, el('span', { class: 'num', texto: String(i + 1) }), o.texto));
            opcoes.replaceChildren(...botoes); marcar();
          } else dica.hidden = false;
        }
        function avancar() { if (no.prox) mostrar(no.prox); else fechar(); }
        function fechar() {
          if (fechado) return;
          fechado = true; clearInterval(timer); box.remove(); AM.Modal.pop(modal); self.ativo = false;
          if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
          AM.Audio.sfx('fechar');
          (fimAcoes || []).forEach((a) => AM.Quests.executar(a));
          (ent.aoFechar || []).forEach((a) => AM.Quests.executar(a));
          AM.Bus.emit('dialogo:fim', chave);
          resolve();
        }
        mostrar(ent.inicio);
      });
    },
  };
})();
