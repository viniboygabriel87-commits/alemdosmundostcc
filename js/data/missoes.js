/* Missões orientadas por dados.
   tipo: 'principal' | 'secundaria' | 'opcional'
   passos[]: { id, texto, apos:[ids], alvo:'marca no mundo', auto:[condições] }
     - um passo fica ativo quando todos os passos de "apos" estão feitos;
     - "auto": o passo é concluído sozinho quando todas as condições forem verdadeiras (ex.: "tem:madeira").
   iniciaNoNovoJogo / iniciaQuando:[cond]: como a missão começa (senão, começa por ação de diálogo {missao:'id'}).
   recompensa: { pontos, itens:{id:qtd}, conhecimento:{area:pontos} }
   aoConcluir: ações executadas ao concluir (consequências: melhorias, flags, novas missões). */
AM.Data.missoes = {
  escola_luz: {
    titulo: 'A escola precisa de luz',
    tipo: 'principal',
    resumo: 'A escola de Vila Esperança está sem energia desde a última tempestade. Moradores e visitante vão juntos devolver a luz ao lugar onde todos aprendem.',
    iniciaNoNovoJogo: true,
    passos: [
      { id: 'falar_helena', texto: 'Converse com a Professora Helena, na entrada da escola (nordeste da vila).', apos: [], alvo: 'helena' },
      { id: 'inspecionar_quadro', texto: 'Investigue o quadro de energia, ao lado da escola.', apos: ['falar_helena'], alvo: 'quadro' },
      { id: 'falar_gabriel', texto: 'Fale com o inventor Gabriel, na oficina (oeste) e decida como gerar energia.', apos: ['inspecionar_quadro'], alvo: 'gabriel' },
      { id: 'calcular_cabos', texto: 'Ajude o Gabriel a calcular o cabo da instalação.', apos: ['falar_gabriel'], alvo: 'gabriel' },
      { id: 'bilhete_comunidade', texto: 'Ajude a Lia (na praça) a organizar o bilhete que chamará a vizinhança para o mutirão.', apos: ['falar_gabriel'], alvo: 'lia' },
      { id: 'ativar_energia', texto: 'Ligue o sistema elétrico no quadro de energia da escola.', apos: ['calcular_cabos', 'bilhete_comunidade'], alvo: 'quadro' },
      { id: 'concluir_helena', texto: 'Conte à Professora Helena como foi o mutirão.', apos: ['ativar_energia'], alvo: 'helena' },
    ],
    recompensa: { pontos: 50, itens: { apoio_comunidade: 2 } },
    aoConcluir: [{ melhoria: 'vila_iluminada' }, { melhoria: 'canto_leitura' }],
  },

  livros_do_canto: {
    titulo: 'Livros para o cantinho',
    tipo: 'secundaria',
    resumo: 'O cantinho de leitura tem estante, mas poucos livros. Helena pediu ajuda para recuperar os que se perderam pela vila.',
    passos: [
      { id: 'achar_livros', texto: 'Encontre os 3 livros perdidos: um ao sul da praça, um a leste e um a oeste da vila.', apos: [], alvo: 'livros', auto: ['tem:livro_contos', 'tem:livro_atlas', 'tem:livro_ciencias'] },
      { id: 'guardar_livros', texto: 'Guarde os livros na estante do cantinho de leitura (ao lado da escola).', apos: ['achar_livros'], alvo: 'canto_leitura' },
    ],
    recompensa: { pontos: 30, itens: { livro_matematica: 1 }, conhecimento: { portugues: 10 } },
    aoConcluir: [{ melhoria: 'estante_cheia' }, { flag: 'estante_cheia' }],
  },

  poco_agua: {
    titulo: 'O poço parou',
    tipo: 'secundaria',
    resumo: 'A bomba do poço quebrou e os moradores carregam água de longe. O Gabriel sabe consertar, mas precisa de materiais, de uma conta bem feita e do apoio da comunidade.',
    passos: [
      { id: 'materiais', texto: 'Reúna tábuas, parafusos e corda: procure perto da oficina (oeste), da casa vizinha e no sudoeste da vila.', apos: [], alvo: 'materiais', auto: ['tem:madeira', 'tem:parafusos', 'tem:corda'] },
      { id: 'calcular_corda', texto: 'Ajude o Gabriel, no poço, a calcular quanto cabo e corda a bomba vai usar.', apos: ['materiais'], alvo: 'gabriel' },
      { id: 'consertar', texto: 'Conserte a bomba com o Gabriel (leve os materiais, a chave inglesa e 1 apoio da comunidade).', apos: ['calcular_corda'], alvo: 'gabriel' },
    ],
    recompensa: { pontos: 40, itens: { botas: 1 }, conhecimento: { matematica: 10 } },
    aoConcluir: [{ melhoria: 'poco_funcionando' }, { flag: 'poco_ok' }],
  },

  carta_rafael: {
    titulo: 'A carta do Rafael',
    tipo: 'opcional',
    resumo: 'Rafael entrega cartas à noite, mas a carta mais importante dele ficou desorganizada. Ele pediu ajuda para arrumar o texto e entregá-lo à Professora Helena.',
    passos: [
      { id: 'organizar_carta', texto: 'Ajude o Rafael (circula pela vila ao entardecer) a organizar a carta.', apos: [], alvo: 'rafael' },
      { id: 'entregar', texto: 'Entregue a carta à Professora Helena.', apos: ['organizar_carta'], alvo: 'helena' },
    ],
    recompensa: { pontos: 20, itens: { apoio_comunidade: 1 }, conhecimento: { portugues: 10 } },
    aoConcluir: [{ flag: 'rafael_amigo' }],
  },

  biblioteca_reabertura: {
    titulo: 'A Biblioteca Esquecida',
    tipo: 'secundaria',
    resumo: 'Dona Clara quer reabrir a biblioteca. Os livros precisam voltar às prateleiras certas antes que a porta possa ser aberta para a vila.',
    passos: [
      { id: 'falar_clara', texto: 'Converse com Dona Clara, perto da biblioteca ao sul da vila.', apos: [], alvo: 'clara' },
      { id: 'catalogar', texto: 'Ajude Dona Clara a catalogar os livros na porta da biblioteca.', apos: ['falar_clara'], alvo: 'porta_biblioteca' },
    ],
    recompensa: { pontos: 35, conhecimento: { portugues: 12 } },
    aoConcluir: [{ melhoria: 'biblioteca_reaberta' }],
  },
};

/* Melhorias do cenário. Cada uma gera um benefício real (descrito em "beneficio" e implementado por diálogos, rotas ou sistemas):
   tipo: 'desafio' | 'atividade' | 'personagem' | 'caminho' */
AM.Data.melhorias = {
  escola_energia: { nome: 'Escola com energia solar', desc: 'As janelas da escola acendem e a porta fica aberta.',
    beneficio: { tipo: 'desafio', texto: 'A porta da escola leva à turma da noite: desafios de qualquer área, no seu nível.' } },
  vila_iluminada: { nome: 'Postes de luz acesos', desc: 'Os postes da vila acendem ao entardecer.',
    beneficio: { tipo: 'personagem', texto: 'Rafael, o carteiro da noite, passa a circular pela vila e traz uma missão opcional.' } },
  canto_leitura: { nome: 'Cantinho de leitura', desc: 'Um banco e uma estante de livros ao lado da escola.',
    beneficio: { tipo: 'atividade', texto: 'Leitura guiada: desafios de Português e Conhecimentos gerais no cantinho.', areas: ['portugues', 'conhecimentos'] } },
  estante_cheia: { nome: 'Estante cheia', desc: 'Os livros recuperados voltam à estante do cantinho.',
    beneficio: { tipo: 'atividade', texto: 'A leitura guiada passa a incluir Matemática e Lógica.', areas: ['matematica', 'logica'] } },
  poco_funcionando: { nome: 'Poço funcionando', desc: 'A bomba foi consertada e a água volta a jorrar.',
    beneficio: { tipo: 'personagem', texto: 'Moradores como o Beto passam a visitar o poço, e o Gabriel ganha tempo para ensinar.' } },
  biblioteca_reaberta: { nome: 'Biblioteca reaberta', desc: 'Dona Clara organizou os livros e abriu as portas para a comunidade.',
    beneficio: { tipo: 'atividade', texto: 'A Biblioteca Esquecida passa a fazer parte do mapa do mundo.', regiao: 'biblioteca' } },
};
