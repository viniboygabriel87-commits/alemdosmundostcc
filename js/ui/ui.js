/* ALÉM DOS MUROS — interface: HUD, pausa, diário, progresso/prática, configurações, toques e avisos. */
(function () {
  'use strict';
  const AM = window.AM, U = AM.util, el = U.el, C = AM.Config;
  const UI = AM.UI;

  UI.camada = () => document.getElementById('camada-ui');

  /* ───────── avisos ───────── */
  const filaToasts = [];
  function mostrarToast(msg, tipo) {
    const box = document.getElementById('toasts');
    const t = el('div', { class: 'toast ' + (tipo || ''), role: 'status', texto: msg });
    box.append(t);
    setTimeout(() => t.classList.add('saindo'), 3400);
    setTimeout(() => t.remove(), 3900);
    while (box.children.length > 4) box.firstChild.remove();
  }
  // avisos que chegam durante um diálogo/puzzle esperam a janela fechar, para não cobrir o conteúdo
  UI.toast = function (msg, tipo) { if (AM.Modal.aberto()) filaToasts.push([msg, tipo]); else mostrarToast(msg, tipo); };
  AM.Bus.on('modal', (n) => { if (n === 0 && filaToasts.length) setTimeout(() => { while (filaToasts.length && !AM.Modal.aberto()) mostrarToast(...filaToasts.shift()); }, 250); });

  /* ───────── navegação por teclado/gamepad dentro de painéis ───────── */
  function focaveis(raiz) { return [...raiz.querySelectorAll('button:not([disabled]), [tabindex="0"], input:not([disabled]), select')].filter((x) => x.offsetParent !== null); }
  UI.navegar = function (raiz, a) {
    const f = focaveis(raiz); if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    if (a === 'cima' || a === 'baixo') { const n = i < 0 ? 0 : (i + (a === 'baixo' ? 1 : -1) + f.length) % f.length; f[n].focus(); AM.Audio.sfx('clique'); }
    else if (a === 'interagir' && i >= 0 && f[i].tagName === 'BUTTON') f[i].click();
  };

  /** Abre um painel modal genérico. Retorna {fechar, painel}. */
  UI.painel = function ({ titulo, classe, corpo, aoFechar, semFechar }) {
    const painel = el('div', { class: 'painel ' + (classe || ''), role: 'dialog', 'aria-modal': 'true', 'aria-label': titulo });
    const cab = el('header', { class: 'painel-cab' }, el('h2', { texto: titulo }));
    const overlay = el('div', { class: 'overlay' }, painel);
    let fechado = false;
    const modal = { id: 'painel', acao: (a) => { if (a === 'pausa') api.fechar(); else UI.navegar(painel, a); } };
    const api = {
      painel, overlay,
      fechar() {
        if (fechado) return; fechado = true;
        overlay.remove(); AM.Modal.pop(modal); AM.Audio.sfx('fechar');
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        if (aoFechar) aoFechar();
      },
      definirCorpo(nos) { painel.replaceChildren(cab, ...nos); },
    };
    if (!semFechar) cab.append(el('button', { class: 'btn mini-btn', type: 'button', 'aria-label': 'Fechar', onclick: () => api.fechar() }, 'Fechar'));
    UI.camada().append(overlay); AM.Modal.push(modal); AM.Audio.sfx('abrir');
    api.definirCorpo(corpo(api));
    painel.setAttribute('tabindex', '-1');
    const primeiro = focaveis(painel).find((b) => !b.classList.contains('mini-btn')) || focaveis(painel)[0];
    (primeiro || painel).focus();
    return api;
  };

  UI.confirmar = function (titulo, texto, ok = 'Confirmar', cancelar = 'Cancelar') {
    return new Promise((resolve) => {
      let resp = false;
      UI.painel({
        titulo, classe: 'pequeno', semFechar: true, aoFechar: () => resolve(resp),
        corpo: (p) => [el('p', { texto }), el('div', { class: 'puz-acoes' },
          el('button', { class: 'btn', type: 'button', onclick: () => p.fechar() }, cancelar),
          el('button', { class: 'btn primario', type: 'button', onclick: () => { resp = true; p.fechar(); } }, ok))],
      });
    });
  };

  /* ───────── HUD ───────── */
  let hudCompacto = false;
  UI.iniciarHUD = function () {
    const hud = document.getElementById('hud');
    hud.replaceChildren(
      el('button', { class: 'hud-obj', type: 'button', id: 'hud-obj', 'aria-label': 'Objetivo atual (tocar para recolher)', onclick: () => { hudCompacto = !hudCompacto; UI.atualizarHUD(); } }),
      el('div', { class: 'hud-botoes' },
        el('button', { class: 'hud-btn', type: 'button', id: 'hud-mochila', onclick: () => UI.abrirMochila() }, 'Mochila'),
        el('button', { class: 'hud-btn', type: 'button', id: 'hud-diario', onclick: () => UI.abrirDiario() }, 'Diário'),
        el('button', { class: 'hud-btn', type: 'button', id: 'hud-menu', onclick: () => UI.abrirPausa() }, 'Menu')),
      el('div', { class: 'hud-pontos', id: 'hud-pontos', title: 'Pontos de conhecimento' }),
      el('div', { class: 'hud-hora', id: 'hud-hora', 'aria-live': 'off' }),
      el('div', { class: 'hud-salvo', id: 'hud-salvo', 'aria-hidden': 'true' }, 'Jogo salvo'));
    ['hud-mochila', 'hud-diario', 'hud-menu', 'hud-obj'].forEach((id) => document.getElementById(id).setAttribute('tabindex', '-1'));
    ['passo', 'missao:iniciada', 'missao:concluida', 'adaptativo', 'inventario'].forEach((ev) => AM.Bus.on(ev, () => UI.atualizarHUD()));
    AM.Bus.on('save', (r) => {
      const s = document.getElementById('hud-salvo'); if (!s) return;
      s.textContent = r.ok ? 'Jogo salvo' : (r.memoria ? 'Sem armazenamento: use Exportar' : 'Falha ao salvar');
      s.classList.toggle('erro', !r.ok); s.classList.add('visivel'); clearTimeout(UI._st); UI._st = setTimeout(() => s.classList.remove('visivel'), 1800);
    });
    AM.Bus.on('passo', () => { AM.SaveSystem.salvar('passo'); });
    AM.Bus.on('missao:concluida', (id) => {
      AM.Audio.sfx('missao'); UI.toast('Missão concluída: ' + AM.Data.missoes[id].titulo, 'ok'); UI.atualizarHUD();
      AM.SaveSystem.salvar('missao');
    });
    AM.Bus.on('missao:iniciada', (id) => { UI.toast('Nova missão: ' + AM.Data.missoes[id].titulo, 'ok'); });
    UI.atualizarHUD();
  };
  UI.atualizarHUD = function () {
    const o = document.getElementById('hud-obj'), p = document.getElementById('hud-pontos');
    if (!o || !AM.GameState.dados) return;
    const ativos = AM.Quests.todosAtivos();
    const nodes = [];
    Object.keys(AM.Data.missoes).forEach((id) => {
      if (!AM.Quests.iniciada(id)) return;
      const d = AM.Data.missoes[id];
      nodes.push(el('strong', { class: 'hud-tit', texto: AM.Quests.concluida(id) ? d.titulo + ' (concluída)' : d.titulo }));
      if (hudCompacto || AM.Quests.concluida(id)) return;
      ativos.filter((a) => a.missao === id).forEach((a) => nodes.push(el('span', { class: 'hud-passo', texto: a.passo.texto })));
    });
    if (!nodes.length) nodes.push(el('span', { class: 'hud-passo', texto: 'Explore a vila.' }));
    o.replaceChildren(...nodes);
    p.textContent = `★ ${AM.GameState.dados.pontos}`;
  };
  UI.atualizarHorario = function (horario) {
    const h = document.getElementById('hud-hora');
    if (!h || !horario) return;
    h.textContent = `${horario.texto} · ${horario.periodo}`;
    h.classList.toggle('noite', horario.periodo === 'Noite');
  };
  UI.mostrarHUD = function (v) { document.getElementById('hud').hidden = !v; };

  /* ───────── Pausa ───────── */
  UI.abrirPausa = function () {
    if (AM.Modal.aberto()) return;
    UI.painel({
      titulo: 'Menu', classe: 'pequeno',
      corpo: (p) => [el('div', { class: 'lista-btn' },
        el('button', { class: 'btn primario', type: 'button', onclick: () => p.fechar() }, 'Continuar'),
        el('button', { class: 'btn', type: 'button', onclick: () => UI.abrirDiario() }, 'Diário de missões'),
        el('button', { class: 'btn', type: 'button', onclick: () => UI.abrirMochila() }, 'Mochila'),
        el('button', { class: 'btn', type: 'button', onclick: () => UI.abrirMapa() }, 'Mapa'),
        el('button', { class: 'btn', type: 'button', onclick: () => UI.abrirConhecimentos() }, 'Registro de conhecimentos'),
        el('button', { class: 'btn', type: 'button', onclick: () => UI.abrirProgresso() }, 'Progresso e treino'),
        el('button', { class: 'btn', type: 'button', onclick: () => { const ok = AM.SaveSystem.salvar('manual'); UI.toast(ok ? 'Jogo salvo.' : 'Não foi possível salvar neste navegador. Use Exportar nas configurações.', ok ? 'ok' : 'erro'); AM.Audio.sfx('salvar'); } }, 'Salvar agora'),
        el('button', { class: 'btn', type: 'button', onclick: () => UI.abrirConfig() }, 'Configurações'),
        el('button', { class: 'btn perigo', type: 'button', onclick: async () => { if (await UI.confirmar('Voltar ao menu?', 'O progresso é salvo automaticamente antes de sair.', 'Salvar e sair')) { p.fechar(); AM.Router.irParaMenu(); } } }, 'Voltar ao menu principal')),
      el('p', { class: 'nota', texto: AM.Config.VERSAO_JOGO })],
    });
  };

  /* ───────── Configurações ───────── */
  UI.abrirConfig = function () {
    UI.painel({
      titulo: 'Configurações', classe: 'largo',
      corpo: (p) => {
        const S = AM.Settings;
        const slider = (rot, chave) => {
          const id = 'cfg-' + chave;
          const out = el('output', { for: id, texto: Math.round(S.dados[chave] * 100) + '%' });
          const inp = el('input', { type: 'range', id, min: 0, max: 100, value: Math.round(S.dados[chave] * 100), oninput: (e) => { S.set(chave, e.target.value / 100); out.textContent = e.target.value + '%'; }, onchange: () => AM.Audio.sfx('clique') });
          return el('label', { class: 'cfg-linha', for: id }, el('span', { texto: rot }), inp, out);
        };
        const toggle = (rot, chave, desc) => {
          const id = 'cfg-' + chave;
          return el('label', { class: 'cfg-linha', for: id }, el('span', null, rot, desc ? el('small', { texto: desc }) : null),
            el('input', { type: 'checkbox', id, checked: S.dados[chave] ? true : null, onchange: (e) => { S.set(chave, e.target.checked); AM.Audio.sfx('clique'); } }));
        };
        const escalas = [[0.85, 'Pequeno'], [1, 'Normal'], [1.2, 'Grande'], [1.4, 'Muito grande']];
        const tamanho = el('div', { class: 'seg-nivel', role: 'group', 'aria-label': 'Tamanho do texto' }, ...escalas.map(([v, r]) => el('button', { class: 'chip' + (S.dados.texto === v ? ' ativo' : ''), type: 'button', onclick: () => { S.set('texto', v); p.definirCorpo(corpo2(p)); } }, r)));
        const joy = el('div', { class: 'seg-nivel', role: 'group', 'aria-label': 'Controles de toque' }, ...[['auto', 'Automático'], ['sempre', 'Sempre'], ['nunca', 'Ocultar']].map(([v, r]) => el('button', { class: 'chip' + (S.dados.joystick === v ? ' ativo' : ''), type: 'button', onclick: () => { S.set('joystick', v); UI.atualizarToque(); p.definirCorpo(corpo2(p)); } }, r)));
        function teclas() {
          const lista = el('div', { class: 'teclas' });
          AM.Input.ACOES.forEach((a) => {
            const b = el('button', { class: 'btn mini-btn tecla', type: 'button' }, AM.Input.nomeTecla(AM.Input.teclasDe(a)[0]));
            b.addEventListener('click', () => {
              b.textContent = 'Pressione uma tecla… (Esc cancela)';
              AM.Input.capturar((cod) => { if (cod) AM.Input.remapear(a, cod); p.definirCorpo(corpo2(p)); });
            });
            lista.append(el('div', { class: 'cfg-linha' }, el('span', { texto: AM.Input.ROTULO[a] }), b));
          });
          lista.append(el('button', { class: 'btn mini-btn', type: 'button', onclick: () => { AM.Input.restaurarTeclas(); p.definirCorpo(corpo2(p)); } }, 'Restaurar teclas padrão'));
          return lista;
        }
        function salvamento() {
          const area = el('textarea', { id: 'cfg-codigo', rows: 3, 'aria-label': 'Código do jogo salvo', placeholder: 'Cole aqui um código de jogo salvo para importar' });
          const msg = el('p', { class: 'nota', role: 'status' });
          return el('div', null, area, el('div', { class: 'puz-acoes' },
            el('button', { class: 'btn mini-btn', type: 'button', onclick: () => { area.value = AM.SaveSystem.exportar(); area.select(); try { navigator.clipboard.writeText(area.value).then(() => (msg.textContent = 'Código copiado. Guarde-o em um lugar seguro.'), () => (msg.textContent = 'Selecione o código acima e copie.')); } catch (e) { msg.textContent = 'Selecione o código acima e copie.'; } } }, 'Exportar jogo'),
            el('button', { class: 'btn mini-btn', type: 'button', onclick: async () => { if (!area.value.trim()) { msg.textContent = 'Cole um código antes de importar.'; return; } const r = AM.SaveSystem.importar(area.value); if (!r.ok) { msg.textContent = r.erro; return; } msg.textContent = 'Código importado. Use "Continuar" no menu principal para abrir.'; AM.Audio.sfx('ok'); } }, 'Importar'),
            el('button', { class: 'btn mini-btn perigo', type: 'button', onclick: async () => { if (await UI.confirmar('Apagar progresso?', 'Isto remove o jogo salvo deste navegador. Não dá para desfazer.', 'Apagar')) { AM.SaveSystem.apagar(); msg.textContent = 'Jogo salvo apagado.'; } } }, 'Apagar jogo salvo')), msg);
        }
        function corpo2(pp) {
          return [
            el('h3', { texto: 'Som' }), slider('Volume geral', 'volMestre'), slider('Música', 'volMusica'), slider('Efeitos', 'volEfeitos'),
            el('h3', { texto: 'Acessibilidade' }), el('div', { class: 'cfg-linha' }, el('span', { texto: 'Tamanho do texto' }), tamanho),
            toggle('Alto contraste', 'contraste', 'Cores mais fortes na interface.'),
            toggle('Reduzir animações', 'reduzirAnim', 'Sem balanço da vegetação, partículas e texto digitado.'),
            el('div', { class: 'cfg-linha' }, el('span', null, 'Controles de toque', el('small', { texto: 'Joystick virtual e botões na tela.' })), joy),
            el('h3', { texto: 'Controles do teclado' }), teclas(),
            el('p', { class: 'nota', texto: 'Gamepad: analógico/direcional move, A interage, X corre, Y diário, Start menu.' }),
            el('h3', { texto: 'Jogo salvo' }), salvamento(),
          ];
        }
        return corpo2(p);
      },
    });
  };

  /* ───────── Toque ───────── */
  UI.iniciarToque = function () {
    const joy = document.getElementById('joy'), base = joy.querySelector('.joy-base'), knob = joy.querySelector('.joy-knob');
    const R = 46; let id = null, ox = 0, oy = 0;
    const padrao = () => { base.style.left = '64px'; base.style.bottom = '64px'; base.style.top = 'auto'; knob.style.left = '64px'; knob.style.bottom = '64px'; knob.style.top = 'auto'; };
    padrao();
    joy.addEventListener('pointerdown', (e) => {
      if (id !== null) return; id = e.pointerId; joy.setPointerCapture(id);
      const r = joy.getBoundingClientRect(); ox = e.clientX - r.left; oy = e.clientY - r.top;
      [base, knob].forEach((n) => { n.style.left = ox + 'px'; n.style.top = oy + 'px'; n.style.bottom = 'auto'; });
      AM.Input.definirModo('toque');
    });
    joy.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      const r = joy.getBoundingClientRect(), dx = e.clientX - r.left - ox, dy = e.clientY - r.top - oy, l = Math.hypot(dx, dy) || 1, k = Math.min(1, l / R);
      knob.style.left = ox + (dx / l) * k * R + 'px'; knob.style.top = oy + (dy / l) * k * R + 'px';
      AM.Input.setEixoToque(k < 0.2 ? 0 : (dx / l) * k, k < 0.2 ? 0 : (dy / l) * k);
    });
    const fim = (e) => { if (e.pointerId !== id) return; id = null; AM.Input.setEixoToque(0, 0); padrao(); };
    joy.addEventListener('pointerup', fim); joy.addEventListener('pointercancel', fim);
    const botao = (idb, acao, segurar) => {
      const b = document.getElementById(idb);
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.setPointerCapture(e.pointerId); b.classList.add('premido'); AM.Input.toqueBotao(acao, true); });
      const solta = () => { b.classList.remove('premido'); AM.Input.toqueBotao(acao, false); };
      b.addEventListener('pointerup', solta); b.addEventListener('pointercancel', solta);
    };
    botao('tb-a', 'interagir'); botao('tb-correr', 'correr');
    window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') { AM.Input.definirModo('toque'); UI.atualizarToque(); } }, { passive: true });
    AM.Bus.on('modal', () => UI.atualizarToque());
    UI.atualizarToque();
  };
  UI.atualizarToque = function () {
    const t = document.getElementById('toque'), cfg = AM.Settings.dados.joystick;
    const noJogo = AM.Router && AM.Router.cena === 'jogo';
    const mostrar = noJogo && !AM.Modal.aberto() && (cfg === 'sempre' || (cfg === 'auto' && AM.Input.modo() === 'toque'));
    t.hidden = !mostrar;
  };
})();
