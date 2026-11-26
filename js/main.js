/* ALÉM DOS MUROS — ponto de entrada: laço principal, roteamento de ações, autosave e inicialização. */
(function () {
  'use strict';
  const AM = window.AM;
  let ultimo = 0, acum = 0;

  function iniciar() {
    AM.Settings.carregar();
    AM.Input.recarregarTeclas();
    AM.GameState.novo(); AM.GameState.sujo = false; // estado vazio até o jogador escolher
    AM.World.iniciar(document.getElementById('jogo'));
    AM.Menu.iniciar();
    AM.UI.iniciarHUD();
    AM.UI.iniciarToque();
    AM.Router.irParaMenu();

    AM.Bus.on('acao', (a) => {
      const m = AM.Modal.topo();
      if (m) { if (m.acao) m.acao(a); return; }
      if (AM.Router.cena === 'menu') { AM.UI.navegar(document.getElementById('menu'), a); return; }
      if (AM.World.cutAtivo()) return;
      if (a === 'interagir') AM.World.interagir();
      else if (a === 'pausa') AM.UI.abrirPausa();
      else if (a === 'diario') AM.UI.abrirDiario();
      else if (a === 'mochila') AM.UI.abrirMochila();
      else if (a === 'mapa') AM.UI.abrirMapa();
    });

    window.addEventListener('resize', () => { AM.World.redimensionar(window.innerWidth, window.innerHeight); AM.UI.atualizarToque(); });
    const salvarSaida = () => { if (AM.Router.cena === 'jogo') AM.SaveSystem.salvar('saida'); };
    document.addEventListener('visibilitychange', () => { if (document.hidden) salvarSaida(); });
    window.addEventListener('pagehide', salvarSaida);
    window.addEventListener('contextmenu', (e) => { if (e.target.id === 'jogo') e.preventDefault(); });

    requestAnimationFrame(quadro);
  }

  function quadro(ts) {
    const dt = Math.min(0.05, (ts - ultimo) / 1000 || 0.016); ultimo = ts;
    AM.Input.atualizar();
    if (AM.Router.cena === 'jogo') {
      AM.World.atualizar(dt); AM.World.desenhar();
      AM.GameState.dados.tempoJogo += dt;
      acum += dt * 1000;
      if (acum >= AM.Config.AUTOSAVE_MS) { acum = 0; if (!AM.Modal.aberto() && !AM.World.cutAtivo()) AM.SaveSystem.salvar('auto'); }
      const a = document.getElementById('tb-a'); if (a) a.classList.toggle('pronto', !!AM.World.alvo());
    } else { AM.World.ocultarDica(); AM.Menu.animar(ts / 1000); }
    requestAnimationFrame(quadro);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
