/* NPCs que andam. Dados de comportamento: casa (início), velocidade, rotas e condição para aparecer.
   Cada rota é uma lista de pontos (em tiles) percorrida de ida e volta a partir da casa (x,y).
   Os trechos entre pontos devem ser retos (mesmo x ou mesmo y), pois o NPC anda em linha reta nos eixos.
   Ponto: { x, y, espera:[min,max] segundos, dir: direção ao parar }.
   Rota: { cond:[...], prio, pontos }  — entre as rotas válidas, vale a de maior prio; empates sorteiam.
   cond usa a mesma linguagem dos diálogos (flag:, feito:, ativo:, missao_concluida:, melhoria:, tem:). */
AM.Data.npcs = {
  helena: {
    x: 38, y: 14.6, dir: 'down', vel: 22, espera: [6, 12],
    rotas: [
      { pontos: [{ x: 38, y: 19.5, espera: [2, 4] }, { x: 33.5, y: 19.5, espera: [4, 8], dir: 'up' }] },
      { pontos: [{ x: 38, y: 17, espera: [3, 6], dir: 'left' }] },
    ],
  },
  gabriel: {
    x: 10, y: 14.6, dir: 'down', vel: 24, espera: [4, 9],
    rotas: [
      { pontos: [{ x: 8, y: 14.6, espera: [3, 6], dir: 'left' }] },
      { pontos: [{ x: 10, y: 17.2 }, { x: 13.2, y: 17.2, espera: [3, 7], dir: 'up' }] },
      { prio: 2, cond: ['ativo:poco_agua.calcular_corda'], pontos: [{ x: 10, y: 17.2 }, { x: 13.2, y: 17.2, espera: [40, 70], dir: 'up' }] },
      { prio: 2, cond: ['ativo:poco_agua.consertar'], pontos: [{ x: 10, y: 17.2 }, { x: 13.2, y: 17.2, espera: [40, 70], dir: 'up' }] },
    ],
  },
  lia: {
    x: 22.2, y: 21.6, dir: 'right', vel: 23, espera: [5, 10],
    rotas: [
      { pontos: [{ x: 22.2, y: 18, espera: [2, 5] }, { x: 27.8, y: 18, espera: [3, 6], dir: 'down' }, { x: 27.8, y: 21.6, espera: [2, 4], dir: 'left' }] },
      { pontos: [{ x: 22.2, y: 18, espera: [4, 8], dir: 'right' }] },
    ],
  },
  beto: {
    x: 20.2, y: 17, dir: 'down', vel: 38, espera: [2, 5],
    rotas: [
      { pontos: [{ x: 20.2, y: 23.4, espera: [1, 3] }, { x: 29.5, y: 23.4, espera: [2, 4], dir: 'up' }] },
      { prio: 1, cond: ['missao_concluida:poco_agua'], pontos: [{ x: 14.6, y: 17, espera: [5, 9], dir: 'left' }] },
    ],
  },
  antonio: {
    x: 24.4, y: 30, dir: 'down', vel: 19, espera: [4, 9],
    rotas: [
      { pontos: [{ x: 24.4, y: 34.8, espera: [1, 2] }, { x: 12.6, y: 34.8, espera: [5, 9], dir: 'up' }] },
      { pontos: [{ x: 24.4, y: 34.8, espera: [1, 2] }, { x: 34, y: 34.8, espera: [4, 8], dir: 'up' }] },
    ],
  },
  rafael: {
    x: 32, y: 15.6, dir: 'down', vel: 26, espera: [5, 10], aparece: ['melhoria:vila_iluminada'], horario: 'noite',
    rotas: [
      { pontos: [{ x: 32, y: 21.5, espera: [3, 6], dir: 'right' }, { x: 32, y: 26, espera: [4, 7], dir: 'down' }] },
      { pontos: [{ x: 32, y: 19, espera: [5, 9], dir: 'left' }] },
    ],
  },
  clara: {
    x: 14, y: 34.5, dir: 'left', vel: 18, espera: [6, 12],
    aparece: ['feito:escola_luz.concluir_helena'], horario: 'dia',
    rotas: [
      { pontos: [{ x: 18, y: 34.5, espera: [5, 9], dir: 'left' }] },
      { pontos: [{ x: 14, y: 34.5, espera: [8, 14], dir: 'up' }, { x: 11, y: 34.5, espera: [3, 6], dir: 'down' }] },
    ],
  },
};
