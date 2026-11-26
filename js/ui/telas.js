/* ALÉM DOS MUROS — telas da Etapa 2: Diário de missões, Mochila, Mapa (vila e mundo), Registro de conhecimentos, Progresso e treino. */
(function () {
  'use strict';
  const AM = window.AM, U = AM.util, el = U.el, C = AM.Config, UI = AM.UI;
  const AREA_COR = { matematica: '#f5b942', portugues: '#ef8383', logica: '#8fb4ff', conhecimentos: '#7bd36b' };

  function abas(lista, atual, aoTrocar) {
    return el('div', { class: 'abas', role: 'tablist' }, ...lista.map(([id, rotulo]) =>
      el('button', { class: 'aba' + (id === atual ? ' ativa' : ''), type: 'button', role: 'tab', 'aria-selected': id === atual ? 'true' : 'false', onclick: () => { AM.Audio.sfx('clique'); aoTrocar(id); } }, rotulo)));
  }
  function recompensaTexto(r) {
    if (!r) return '';
    const p = [];
    if (r.pontos) p.push(`★ ${r.pontos} pontos`);
    Object.keys(r.itens || {}).forEach((i) => p.push(AM.Data.itens[i].nome + (r.itens[i] > 1 ? ' ×' + r.itens[i] : '')));
    Object.keys(r.conhecimento || {}).forEach((a) => p.push(`+${r.conhecimento[a]} em ${C.AREA_NOME[a]}`));
    return p.join(' · ');
  }

  /* ───────── Diário ───────── */
  UI.abrirDiario = function () {
    UI.painel({
      titulo: 'Diário de missões', classe: 'largo',
      corpo: () => {
        const nodes = [];
        const GRUPOS = [['principal', 'Missão principal'], ['secundaria', 'Missões secundárias'], ['opcional', 'Missões opcionais']];
        GRUPOS.forEach(([tipo, rotulo]) => {
          const ids = Object.keys(AM.Data.missoes).filter((id) => AM.Quests.iniciada(id) && AM.Data.missoes[id].tipo === tipo);
          if (!ids.length) return;
          nodes.push(el('h3', { class: 'diario-grupo', texto: rotulo }));
          ids.sort((a, b) => Number(AM.Quests.concluida(a)) - Number(AM.Quests.concluida(b)));
          ids.forEach((id) => {
            const d = AM.Data.missoes[id], conc = AM.Quests.concluida(id);
            const lista = el('ul', { class: 'diario-passos' });
            let bloqueados = 0;
            d.passos.forEach((s) => {
              const st = AM.Quests.passoEstado(id, s.id);
              if (st === 'feito') lista.append(el('li', { class: 'feito' }, el('span', { class: 'marca', texto: '✓' }), s.texto));
              else if (st === 'ativo') lista.append(el('li', { class: 'ativo' }, el('span', { class: 'marca', texto: '➤' }), s.texto));
              else bloqueados++;
            });
            if (bloqueados) lista.append(el('li', { class: 'oculto' }, el('span', { class: 'marca', texto: '·' }), `Mais ${bloqueados} ${bloqueados === 1 ? 'objetivo será revelado' : 'objetivos serão revelados'} conforme você avança.`));
            nodes.push(el('section', { class: 'diario-missao' + (conc ? ' concluida' : '') },
              el('div', { class: 'diario-topo' }, el('h3', { texto: d.titulo }), el('span', { class: 'selo ' + (conc ? 'ok' : ''), texto: conc ? 'Concluída' : 'Em andamento' })),
              el('p', { class: 'resumo', texto: d.resumo }), lista,
              el('div', { class: 'barra' }, el('i', { estilo: { width: AM.Quests.progresso(id) + '%' } })),
              d.recompensa ? el('p', { class: 'nota', texto: (conc ? 'Recompensa recebida: ' : 'Recompensa: ') + recompensaTexto(d.recompensa) }) : null));
          });
        });
        const dec = [];
        if (AM.GameState.flag('decisao_noite')) dec.push('Você sugeriu usar a nova luz para aulas à noite.');
        if (AM.GameState.flag('decisao_leitura')) dec.push('Você sugeriu manter a biblioteca e a leitura abertas à noite.');
        if (dec.length) nodes.push(el('section', { class: 'diario-missao' }, el('h3', { texto: 'Suas decisões' }), el('ul', { class: 'diario-passos' }, ...dec.map((t) => el('li', null, el('span', { class: 'marca', texto: '•' }), t)))));
        const mel = Object.keys(AM.GameState.dados.melhorias).filter((m) => AM.Data.melhorias[m]);
        if (mel.length) nodes.push(el('section', { class: 'diario-missao' }, el('h3', { texto: 'Melhorias na vila' }),
          ...mel.map((m) => { const d = AM.Data.melhorias[m]; return el('div', { class: 'melhoria' }, el('strong', { texto: '✓ ' + d.nome }), el('span', { class: 'nota', texto: d.desc }), el('span', { class: 'beneficio', texto: 'Benefício: ' + d.beneficio.texto })); })));
        if (!nodes.length) nodes.push(el('p', { texto: 'Nenhuma missão ainda. Explore a vila e converse com os moradores.' }));
        return nodes;
      },
    });
  };

  /* ───────── Mochila ───────── */
  UI.abrirMochila = function () {
    UI.painel({ titulo: 'Mochila', classe: 'largo', corpo: (p) => montar(p, null) });
    function montar(p, msg) {
      const d = AM.GameState.dados, grupos = AM.Inventory.lista();
      const nodes = [el('p', { class: 'nota', texto: `Pontos de conhecimento: ${d.pontos} · Itens diferentes: ${AM.Inventory.total()}. Todos os itens vêm de explorar, conversar e resolver desafios.` })];
      if (msg) nodes.push(el('section', { class: 'leitura', role: 'status' }, ...msg));
      if (!grupos.length) nodes.push(el('p', { class: 'vazio', texto: 'A mochila está vazia. Procure objetos brilhando pela vila e converse com os moradores.' }));
      grupos.forEach((g) => {
        nodes.push(el('h3', { texto: AM.Data.categorias[g.cat] }));
        nodes.push(el('div', { class: 'grade-itens' }, ...g.itens.map((it) => {
          const ico = el('canvas', { class: 'item-ico', width: 12, height: 12, 'aria-hidden': 'true' });
          const cx = ico.getContext('2d'); cx.imageSmoothingEnabled = false; cx.drawImage(AM.Gfx.item(it.id), 0, 0);
          const botoes = [];
          if (it.def.uso === 'ler') botoes.push(el('button', { class: 'btn mini-btn', type: 'button', onclick: () => ler(p, it.id) }, AM.Inventory.jaLeu(it.id) ? 'Reler' : 'Ler'));
          if (it.def.uso === 'equipar') { const eq = AM.Inventory.equipado(it.id); botoes.push(el('button', { class: 'btn mini-btn' + (eq ? '' : ' primario'), type: 'button', onclick: () => { AM.Inventory.equipar(it.id, !eq); AM.Audio.sfx('clique'); p.definirCorpo(montar(p, [el('p', { texto: eq ? `${it.def.nome} removidas.` : `${it.def.nome} equipadas: ${it.def.desc}` })])); } }, eq ? 'Remover' : 'Equipar')); }
          return el('article', { class: 'item-card' },
            el('div', { class: 'item-topo' }, ico, el('strong', { texto: it.def.nome }), it.qtd > 1 ? el('span', { class: 'qtd', texto: '×' + it.qtd }) : null,
              it.def.uso === 'equipar' && AM.Inventory.equipado(it.id) ? el('span', { class: 'selo ok', texto: 'Em uso' }) : null),
            el('p', { class: 'nota', texto: it.def.desc }), botoes.length ? el('div', { class: 'puz-acoes' }, ...botoes) : null);
        })));
      });
      return nodes;
    }
    function ler(p, id) {
      const r = AM.Inventory.ler(id), d = AM.Data.itens[id];
      const m = [el('h3', { texto: d.nome })];
      if (r.registro) m.push(el('p', { texto: r.registro.texto }));
      m.push(el('p', { class: 'nota', texto: r.primeira ? `Primeira leitura: +${r.pontos} pontos em ${C.AREA_NOME[r.area]}. O registro foi salvo em Conhecimentos.` : 'Você já havia lido este livro. Reler ajuda a fixar!' }));
      p.definirCorpo(montar(p, m));
      AM.Audio.sfx(r.primeira ? 'ok' : 'clique');
    }
  };

  /* ───────── Registro de conhecimentos ───────── */
  UI.abrirConhecimentos = function () {
    UI.painel({ titulo: 'Registro de conhecimentos', classe: 'largo', corpo: () => {
      const all = AM.Data.conhecimentos, abertos = AM.Knowledge.desbloqueados();
      const nodes = [el('p', { class: 'nota', texto: `${abertos.length} de ${all.length} registros. Resolver desafios e ler livros libera novas anotações no seu caderno.` })];
      C.AREAS.forEach((a) => {
        const lista = all.filter((k) => k.area === a);
        nodes.push(el('h3', { texto: C.AREA_NOME[a], estilo: { color: AREA_COR[a] } }));
        nodes.push(el('div', { class: 'grade-itens' }, ...lista.map((k) => {
          if (AM.GameState.dados.registro[k.id]) return el('article', { class: 'item-card registro' }, el('strong', { texto: k.titulo }), el('p', { texto: k.texto }));
          const [tipo, id] = k.origem.split(':');
          const dica = tipo === 'puzzle' ? `Resolva o desafio “${AM.Data.puzzles[id].titulo}”.` : `Leia o livro “${AM.Data.itens[id].nome}”.`;
          return el('article', { class: 'item-card bloqueado' }, el('strong', { texto: '???' }), el('p', { class: 'nota', texto: dica }));
        })));
      });
      return nodes;
    } });
  };

  /* ───────── Mapa ───────── */
  UI.abrirMapa = function () {
    let aba = 'vila';
    UI.painel({ titulo: 'Mapa', classe: 'largo', corpo: (p) => montar(p) });
    function montar(p) {
      const corpo = aba === 'vila' ? mapaVila() : mapaMundo();
      return [abas([['vila', 'Vila Esperança'], ['mundo', 'Mundo']], aba, (id) => { aba = id; p.definirCorpo(montar(p)); }), ...corpo];
    }
    function mapaVila() {
      const M = AM.Data.mapa, T = C.TILE, S = 6, W = M.w * S, H = M.h * S, dsc = AM.GameState.dados.descobertos;
      const cv = el('canvas', { class: 'mapa-cv', width: W, height: H, role: 'img', 'aria-label': 'Mapa da Vila Esperança' });
      const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
      const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
      g.fillStyle = '#2f5a3a'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#6a6e78'; g.fillRect(0, 0, W, M.muro.altura * S);
      g.fillStyle = '#b08a55'; M.caminhos.forEach((r) => g.fillRect(r.x * S, r.y * S, r.w * S, r.h * S));
      g.fillStyle = '#9aa0a8'; g.fillRect(M.praca.x * S, M.praca.y * S, M.praca.w * S, M.praca.h * S);
      g.fillStyle = '#4a86b8'; g.beginPath(); g.arc(M.fonte.x * S, M.fonte.y * S, 2.5 * S, 0, 7); g.fill();
      g.fillStyle = '#3c3f48'; g.fillRect(M.muro.portao.x * S, 0, M.muro.portao.w * S, M.muro.altura * S);
      M.edificios.forEach((e) => { g.fillStyle = e.roof; g.fillRect(e.x * S, e.y * S, e.w * S, e.h * S); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(e.x * S, (e.y + e.h - 2) * S, e.w * S, 2 * S); });
      if (AM.GameState.dados.melhorias.canto_leitura) { g.fillStyle = '#c9a46a'; g.fillRect((M.canto_leitura.x - 1.5) * S, (M.canto_leitura.y - 1) * S, 3 * S, 1.5 * S); }
      g.font = `bold ${S * 2}px "Atkinson Hyperlegible", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      AM.Data.locais.forEach((l) => {
        const x = l.x * S, y = l.y * S;
        if (dsc[l.id]) { const w = g.measureText(l.nome).width + 8; g.fillStyle = 'rgba(18,22,29,0.85)'; g.fillRect(x - w / 2, y - S * 1.4, w, S * 2.8); g.fillStyle = '#f4ecd8'; g.fillText(l.nome, x, y); }
        else { g.fillStyle = 'rgba(18,22,29,0.75)'; g.beginPath(); g.arc(x, y, S * 1.5, 0, 7); g.fill(); g.fillStyle = '#b9b4a3'; g.fillText('?', x, y); }
      });
      // objetivos
      const marcas = []; AM.Quests.todosAtivos().forEach((a) => { if (a.passo.alvo) AM.World.posicoesAlvo(a.passo.alvo).forEach((pt) => marcas.push(pt)); });
      marcas.forEach((pt) => { const x = pt.x / T * S, y = pt.y / T * S; g.fillStyle = '#12161d'; g.beginPath(); g.arc(x, y, S * 1.6, 0, 7); g.fill(); g.fillStyle = '#f5b942'; g.beginPath(); g.arc(x, y, S * 1.15, 0, 7); g.fill(); g.fillStyle = '#12161d'; g.fillText('!', x, y + 0.5); });
      const pj = AM.World.posJogador(); const jx = pj.x / T * S, jy = pj.y / T * S;
      g.fillStyle = '#fff'; g.beginPath(); g.arc(jx, jy, S * 1.5, 0, 7); g.fill(); g.fillStyle = '#4cc3b0'; g.beginPath(); g.arc(jx, jy, S * 1.0, 0, 7); g.fill();
      const obj = AM.Quests.todosAtivos();
      return [
        el('p', { class: 'nota', texto: `Locais descobertos: ${AM.Knowledge.percentualDescoberto()}%. Caminhe pela vila para revelar nomes no mapa.` }),
        el('div', { class: 'mapa-box' }, cv),
        el('div', { class: 'mapa-legenda' }, el('span', null, el('i', { class: 'pt voce' }), ' Você'), el('span', null, el('i', { class: 'pt obj' }), ' Objetivo'), el('span', null, el('i', { class: 'pt loc' }), ' Local não descoberto')),
        el('h3', { texto: 'Objetivos agora' }),
        obj.length ? el('ul', { class: 'diario-passos' }, ...obj.map((a) => el('li', { class: 'ativo' }, el('span', { class: 'marca', texto: '➤' }), `${AM.Data.missoes[a.missao].titulo}: ${a.passo.texto}`))) : el('p', { class: 'nota', texto: 'Nenhum objetivo ativo. Converse com os moradores.' }),
      ];
    }
    function mapaMundo() {
      const d = AM.GameState.dados, caixa = el('div', { class: 'mundo' });
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('class', 'mundo-linhas'); svg.setAttribute('aria-hidden', 'true');
      const vila = AM.Data.regioes[0];
      AM.Data.regioes.slice(1).forEach((r) => { const l = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l.setAttribute('x1', vila.mx); l.setAttribute('y1', vila.my); l.setAttribute('x2', r.mx); l.setAttribute('y2', r.my); l.setAttribute('stroke-dasharray', '2 2'); svg.append(l); });
      caixa.append(svg);
      const detalhes = [];
      AM.Data.regioes.forEach((r) => {
        const aberta = d.regioes[r.id], pista = r.pista && AM.GameState.flag(r.pista);
        const estado = aberta ? 'aberta' : pista ? 'pista' : 'oculta';
        caixa.append(el('div', { class: 'regiao ' + estado, estilo: { left: r.mx + '%', top: r.my + '%', '--cor': r.cor } },
          el('strong', { texto: aberta || pista ? r.nome : '???' }), el('small', { texto: aberta ? `Explorada ${AM.Knowledge.percentualDescoberto()}%` : pista ? 'Pista encontrada' : 'Não descoberta' })));
        detalhes.push(el('li', { class: estado }, el('span', { class: 'marca', texto: aberta ? '●' : pista ? '◐' : '○' }), el('span', null, el('strong', { texto: aberta || pista ? r.nome + ': ' : 'Região desconhecida: ' }), aberta ? r.desc : pista ? r.dica : r.dica)));
      });
      return [el('p', { class: 'nota', texto: 'Mais regiões serão liberadas conforme a vila evolui. Pistas aparecem quando você examina portas, portões e conversa com moradores.' }), caixa, el('ul', { class: 'diario-passos regioes-lista' }, ...detalhes)];
    }
  };

  /* ───────── Progresso e treino ───────── */
  UI.abrirProgresso = function () {
    UI.painel({ titulo: 'Progresso e treino', classe: 'largo', corpo: (p) => montar(p) });
    function montar(p) {
      const d = AM.GameState.dados;
      const cards = C.AREAS.map((a) => {
        const ad = d.adaptativo[a], efetivo = AM.Adaptive.nivel(a), pr = AM.Knowledge.progresso(a);
        const fracos = Object.keys(ad.fracos || {}).map((t) => AM.Data.assuntos[t] || t);
        const banco = Object.keys(AM.Data.puzzles).filter((id) => AM.Data.puzzles[id].area === a).length;
        const seletor = el('div', { class: 'seg-nivel', role: 'group', 'aria-label': 'Nível de ' + C.AREA_NOME[a] },
          ...[['auto', 'Automático', null], ['1', 'Iniciante', 1], ['2', 'Intermediário', 2], ['3', 'Avançado', 3]].map(([k, rot, n]) =>
            el('button', { class: 'chip' + ((ad.manual || null) === n ? ' ativo' : ''), type: 'button', 'aria-pressed': (ad.manual || null) === n ? 'true' : 'false', onclick: () => { AM.Adaptive.definirManual(a, n); AM.Audio.sfx('clique'); p.definirCorpo(montar(p)); } }, rot)));
        return el('section', { class: 'card-area area-' + a },
          el('div', { class: 'diario-topo' }, el('h3', { texto: C.AREA_NOME[a] }), el('span', { class: 'selo', texto: `Desafios: ${C.NIVEL_NOME[efetivo]}${ad.manual ? ' (escolhido)' : ' (automático)'}` })),
          el('p', { class: 'nota', texto: `Domínio: ${AM.Data.dominio.nomes[pr.nivel]} · ${pr.pontos} pontos${pr.ate ? ` (faltam ${pr.ate - pr.pontos} para o nível ${AM.Data.dominio.nomes[pr.nivel + 1]})` : ' (nível máximo)'}` }),
          el('div', { class: 'barra', title: 'Progresso de domínio' }, el('i', { estilo: { width: Math.round(pr.frac * 100) + '%' } })),
          el('p', { class: 'nota', texto: `Desafios resolvidos: ${ad.resolvidos} · Dicas: ${ad.dicas} · Erros: ${ad.erros} · Banco: ${banco} desafios` }),
          fracos.length ? el('p', { class: 'nota atencao', texto: 'Assuntos para reforçar: ' + fracos.join(', ') + '. Os próximos desafios vão passar por eles.' }) : null,
          el('p', { class: 'nota', texto: 'Nível dos desafios:' }), seletor,
          el('div', { class: 'puz-acoes' }, el('button', { class: 'btn', type: 'button', onclick: async () => { await AM.Puzzles.abrir('auto:' + a, { treino: true }); p.definirCorpo(montar(p)); } }, 'Treinar esta área')));
      });
      return [
        el('p', { class: 'nota', texto: `Pontos de conhecimento: ${d.pontos} · Tempo de jogo: ${U.fmtTempo(d.tempoJogo)}. O nível dos desafios sobe aos poucos quando você mostra domínio e desce com mais apoio quando algo está difícil (o tempo nunca pune). Você também pode escolher o nível. O domínio cresce ao resolver desafios, ler livros e concluir missões.` }),
        el('div', { class: 'grade-areas' }, ...cards),
      ];
    }
  };
})();
