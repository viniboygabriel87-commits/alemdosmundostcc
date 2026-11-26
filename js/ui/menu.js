/* ALÉM DOS MUROS — SceneRouter + menu inicial (Novo jogo, Continuar, Configurações, Sair) com fundo animado. */
(function () {
  'use strict';
  const AM = window.AM, U = AM.util, el = U.el;
  let fundo, fg, W = 240, H = 135;

  const Router = (AM.Router = {
    cena: 'menu',
    iniciarJogo() {
      this.cena = 'jogo';
      document.getElementById('menu').hidden = true;
      AM.UI.mostrarHUD(true); AM.UI.atualizarHUD(); AM.UI.atualizarToque();
      AM.Audio.musica('vila');
      if (!AM.GameState.flag('intro_vista')) setTimeout(() => { if (Router.cena === 'jogo') AM.Dialogue.iniciar('prologo'); }, 700);
    },
    irParaMenu() {
      if (this.cena === 'jogo') AM.SaveSystem.salvar('menu');
      this.cena = 'menu';
      AM.UI.mostrarHUD(false); AM.UI.atualizarToque();
      document.getElementById('menu').hidden = false;
      AM.Audio.musica('menu');
      montarBotoes();
    },
    novoJogo() {
      AM.GameState.novo();
      AM.Quests.iniciarDoNovoJogo();
      AM.World.entrar(AM.GameState.dados.pos);
      AM.SaveSystem.salvar('novo');
      this.iniciarJogo();
    },
    continuar() {
      const r = AM.SaveSystem.carregar();
      if (!r.ok) { AM.UI.toast('Não foi possível abrir o jogo salvo (' + r.erro + ').', 'erro'); montarBotoes(); return; }
      AM.GameState.carregar(r.dados);
      AM.World.entrar(r.dados.pos);
      if (r.recuperado) AM.UI.toast('O arquivo principal estava danificado. Recuperamos o backup.', 'ok');
      this.iniciarJogo();
    },
    sair() {
      const ov = el('div', { class: 'overlay claro' }, el('div', { class: 'painel pequeno' },
        el('h2', { texto: 'Até logo!' }),
        el('p', { texto: 'Seu progresso está salvo neste navegador. Você pode fechar esta aba ou voltar ao menu.' }),
        el('div', { class: 'puz-acoes' }, el('button', { class: 'btn primario', type: 'button', onclick: () => ov.remove() }, 'Voltar ao menu'))));
      AM.UI.camada().append(ov);
      try { window.close(); } catch (e) { /* navegadores bloqueiam; a mensagem acima cobre */ }
      ov.querySelector('button').focus();
    },
  });

  function montarBotoes() {
    const box = document.getElementById('menu-botoes');
    const tem = AM.SaveSystem.temSave();
    const resumo = tem ? AM.SaveSystem.resumo() : null;
    const continuar = el('button', { class: 'btn grande', type: 'button', disabled: !tem, onclick: () => { AM.Audio.sfx('clique'); Router.continuar(); } },
      'Continuar', el('small', { texto: tem ? (resumo ? `${U.fmtTempo(resumo.tempo)} · missão ${resumo.progresso}%` : 'jogo salvo possivelmente danificado') : 'nenhum jogo salvo' }));
    box.replaceChildren(
      el('button', { class: 'btn grande primario', type: 'button', onclick: async () => {
        AM.Audio.sfx('clique');
        if (tem && !(await AM.UI.confirmar('Começar um novo jogo?', 'Isto substitui o jogo salvo atual neste navegador.', 'Novo jogo'))) return;
        Router.novoJogo();
      } }, 'Novo jogo'),
      continuar,
      el('button', { class: 'btn grande', type: 'button', onclick: () => { AM.Audio.sfx('clique'); AM.UI.abrirConfig(); } }, 'Configurações'),
      el('button', { class: 'btn grande', type: 'button', onclick: () => { AM.Audio.sfx('clique'); Router.sair(); } }, 'Sair'));
    document.getElementById('menu-rodape').textContent = AM.Config.VERSAO_JOGO + ' · O progresso é salvo automaticamente.';
    const primeiro = tem ? continuar : box.firstChild;
    if (primeiro && Router.cena === 'menu' && !AM.Modal.aberto()) primeiro.focus({ preventScroll: true });
  }

  /* ───────── fundo animado do menu ───────── */
  AM.Menu = {
    iniciar() {
      fundo = document.getElementById('fundo-menu'); fg = fundo.getContext('2d');
      fundo.width = W; fundo.height = H; fg.imageSmoothingEnabled = false;
    },
    animar(t) {
      if (!fg) return;
      const reduz = AM.Settings.dados.reduzirAnim, g = fg;
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#0d1230'); grad.addColorStop(0.5, '#2a2a5a'); grad.addColorStop(0.78, '#7a3f5e'); grad.addColorStop(1, '#f0a35a');
      g.fillStyle = grad; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 70; i++) {
        const x = U.hash(i, 1, 9) * W, y = U.hash(i, 2, 9) * H * 0.55;
        g.globalAlpha = 0.35 + 0.65 * (reduz ? 0.7 : Math.abs(Math.sin(t * (0.6 + U.hash(i, 3, 9)) + i)));
        g.fillStyle = '#f4ecd8'; g.fillRect(Math.floor(x), Math.floor(y), 1, 1);
      }
      g.globalAlpha = 1;
      // luz atrás do muro
      const glow = g.createRadialGradient(W / 2, H * 0.62, 2, W / 2, H * 0.62, 90);
      glow.addColorStop(0, 'rgba(255,226,150,0.95)'); glow.addColorStop(0.4, 'rgba(255,190,100,0.4)'); glow.addColorStop(1, 'rgba(255,160,80,0)');
      g.fillStyle = glow; g.fillRect(0, 0, W, H);
      // feixes
      g.fillStyle = 'rgba(255,230,160,0.10)';
      g.beginPath(); g.moveTo(W / 2 - 14, H * 0.62); g.lineTo(W / 2 - 70, H); g.lineTo(W / 2 + 70, H); g.lineTo(W / 2 + 14, H * 0.62); g.fill();
      // muro com portão
      g.fillStyle = '#15172b'; g.fillRect(0, H * 0.55, W, H);
      for (let y = Math.floor(H * 0.55); y < H; y += 6) { g.fillStyle = '#1d2040'; g.fillRect(0, y, W, 1); for (let x = (y / 6) % 2 ? 4 : 0; x < W; x += 10) g.fillRect(x, y, 1, 6); }
      g.fillStyle = '#0a0b18'; g.fillRect(W / 2 - 40, H * 0.55 - 4, 18, H); g.fillRect(W / 2 + 22, H * 0.55 - 4, 18, H);
      g.fillStyle = '#fff1b8'; g.fillRect(W / 2 - 22, H * 0.55 + 6, 44, H);
      g.fillStyle = '#0a0b18'; for (let x = W / 2 - 20; x < W / 2 + 22; x += 6) g.fillRect(x, H * 0.55 + 6, 2, H);
      g.fillRect(W / 2 - 22, H * 0.55 + 22, 44, 2);
      // telhados da vila na frente
      const casas = [[8, 18, 0], [38, 26, 1], [150, 22, 2], [182, 30, 3], [214, 20, 4], [90, 14, 5], [118, 16, 6]];
      casas.forEach(([x, w, i]) => {
        const y = H - 30 - (i % 3) * 3;
        g.fillStyle = '#0a0b18'; g.fillRect(x, y, w, H); g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + w / 2, y - 10); g.lineTo(x + w + 3, y); g.fill();
        if (U.hash(i, 5, 2) > 0.2) { g.fillStyle = (reduz || Math.sin(t * 0.7 + i * 3) > -0.8) ? '#ffcf6a' : '#6b5528'; g.fillRect(x + 4, y + 8, 3, 4); if (w > 20) g.fillRect(x + w - 8, y + 8, 3, 4); }
      });
      g.fillStyle = '#05060f'; g.fillRect(0, H - 8, W, 8);
    },
  };
})();
