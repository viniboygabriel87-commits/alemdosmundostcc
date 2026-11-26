/* Diálogos orientados por dados. Cada chave é um "falante" ou objeto interativo; a primeira entrada cuja condição for verdadeira é usada.
   Condições (todas devem valer): "flag:x", "!flag:x", "feito:missao.passo", "!feito:missao.passo", "ativo:missao.passo", "missao_concluida:id".
   Nó: { quem, expr, texto, prox, opcoes:[{texto, prox, cond}], acoes:[...], puzzle, ok, cancelar }.
   Ações: {flag:'x'|valor}, {passo:'missao.passo'}, {pontos:n}, {sfx:'nome'}, {melhoria:'id'}.
   Texto aceita {mover} {interagir} {correr} {pausa} {diario} {objetivo}. */
AM.Data.dialogos = {
  prologo: [
    { id: 'prologo', inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'Depois de uma longa estrada, você enfim avista os telhados de Vila Esperança. Ao norte, um muro antigo cerca a vila, e um portão trancado guarda o que existe lá fora.', prox: 'b' },
      b: { quem: 'narrador', texto: 'Dizem que aqui as pessoas querem muito aprender, mas faltam livros, luz e oportunidades. Talvez você possa ajudar.', prox: 'c' },
      c: { quem: 'narrador', texto: 'Para andar, use {mover}. Para falar com alguém ou examinar algo, use {interagir}. Para correr, segure {correr}. O diário abre com {diario} e o menu com {pausa}.', prox: 'd' },
      d: { quem: 'narrador', texto: 'A Professora Helena costuma ficar na entrada da escola, no nordeste da vila. Comece por lá.', acoes: [{ flag: 'intro_vista' }] },
    } },
  ],

  /* ───── Professora Helena ───── */
  helena: [
    { id: 'h_carta', cond: ['ativo:carta_rafael.entregar'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'feliz', texto: 'Uma carta do Rafael? Deixe-me ver... Que texto bem organizado! Ele sempre disse que escrever era difícil, mas com a sua ajuda ficou ótimo.', acoes: [{ passo: 'carta_rafael.entregar' }, { sfx: 'passoMissao' }], prox: 'b' },
      b: { quem: 'helena', expr: 'pensativa', texto: 'A vila precisa de mais gente assim: quem escreve, lê e ensina. Diga ao Rafael que vou ler a carta para a turma da noite.' },
    } },
    { id: 'h_oferta', cond: ['feito:escola_luz.concluir_helena', '!flag:livros_oferecidos', '!flag:livros_adiado'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'pensativa', texto: 'Falando em leitura... o cantinho tem uma estante linda, mas quase sem livros. Vários se perderam pela vila nos últimos anos.', prox: 'b' },
      b: { quem: 'helena', expr: 'neutra', texto: 'Poderia procurá-los? Sei de três: um ao sul da praça, um a leste e um a oeste. Quando achar, guarde-os na estante do cantinho.',
        opcoes: [{ texto: 'Claro, vou procurar.', prox: 'c', acoes: [{ missao: 'livros_do_canto' }, { flag: 'livros_oferecidos' }] }, { texto: 'Mais tarde.', prox: 'd', acoes: [{ flag: 'livros_adiado' }] }] },
      c: { quem: 'helena', expr: 'feliz', texto: 'Obrigada! Cada livro devolvido é uma porta aberta para alguém.' },
      d: { quem: 'helena', expr: 'neutra', texto: 'Sem problema. Quando mudar de ideia, é só me avisar.' },
    } },
    { id: 'h_livros', cond: ['missao_iniciada:livros_do_canto', '!missao_concluida:livros_do_canto'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'neutra', texto: 'Os livros ainda estão por aí. Procure por onde as crianças costumam brincar e guarde tudo na estante do cantinho de leitura.' },
    } },
    { id: 'h_conclusao', cond: ['feito:escola_luz.ativar_energia', '!feito:escola_luz.concluir_helena'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'feliz', texto: 'Eu vi as luzes de longe e precisei vir correndo! A escola está acesa de novo!', prox: 'b' },
      b: { quem: 'helena', expr: 'feliz', texto: 'Sabe o que mais me emociona? Ninguém aqui esperou ajuda de fora. O Gabriel desenhou o sistema, a Lia chamou a vizinhança e cada morador trouxe o que tinha. Você ajudou a juntar as peças.', prox: 'c' },
      c: { quem: 'helena', expr: 'pensativa', texto: 'Agora preciso decidir como usar essa luz. Para você, qual deve ser a prioridade?',
        opcoes: [
          { texto: 'Aulas à noite para quem trabalha de dia.', prox: 'd1' },
          { texto: 'Biblioteca e leitura abertas à noite.', prox: 'd2' },
        ] },
      d1: { quem: 'helena', expr: 'feliz', texto: 'Faz todo sentido. Muita gente aqui só consegue estudar depois do trabalho. Vamos abrir turmas à noite já na próxima semana!', acoes: [{ flag: 'decisao_noite' }], prox: 'z' },
      d2: { quem: 'helena', expr: 'feliz', texto: 'Boa ideia. Um lugar quieto, com livros e boa luz, muda uma vida. Vou conversar com a Dona Clara, nossa bibliotecária de sempre.', acoes: [{ flag: 'decisao_leitura' }], prox: 'z' },
      z: { quem: 'helena', expr: 'feliz', texto: 'Obrigada, de coração. A vila inteira vai se lembrar disso.', acoes: [{ passo: 'escola_luz.concluir_helena' }] },
    } },
    { id: 'h_pronto', cond: ['feito:escola_luz.calcular_cabos', 'feito:escola_luz.bilhete_comunidade', '!feito:escola_luz.ativar_energia'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'feliz', texto: 'Cabos medidos e vizinhos avisados? Então só falta ligar o sistema! O quadro de energia, ao lado da escola, está esperando por você.' },
    } },
    { id: 'h_energia', cond: ['feito:escola_luz.falar_gabriel', '!feito:escola_luz.ativar_energia'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'neutra', texto: 'O Gabriel e a Lia já estão se mexendo, estou sabendo! Quando tudo estiver pronto, volte ao quadro de energia para ligar o sistema.' },
    } },
    { id: 'h_fiacao', cond: ['feito:escola_luz.inspecionar_quadro', '!feito:escola_luz.falar_gabriel'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'feliz', texto: 'Então a fiação ainda serve? Que ótima notícia! Agora procure o Gabriel na oficina, a oeste. Ele é teimoso, mas é um gênio.' },
    } },
    { id: 'h_lembrete', cond: ['feito:escola_luz.falar_helena', '!feito:escola_luz.inspecionar_quadro'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'neutra', texto: 'Já olhou o quadro de energia? Fica ao lado da escola, no canto esquerdo. Veja se a fiação ainda aproveita.' },
    } },
    { id: 'h_primeira', cond: ['!feito:escola_luz.falar_helena'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'feliz', texto: 'Olá! Que bom ver um rosto novo por aqui. Eu sou a Professora Helena, e esta é a nossa escola.', prox: 'b' },
      b: { quem: 'helena', expr: 'preocupada', texto: 'Ela já foi cheia de vozes, mas há meses está às escuras. Sem energia, não temos aulas à noite, e é quando a maioria dos adultos finalmente pode estudar.',
        opcoes: [
          { texto: 'Por que a escola ficou sem energia?', prox: 'c' },
          { texto: 'Como posso ajudar?', prox: 'd' },
        ] },
      c: { quem: 'helena', expr: 'preocupada', texto: 'A rede antiga queimou numa tempestade. A cidade diz que não há verba. Mas aqui ninguém ficou esperando: o Gabriel, nosso inventor, tem ideias, e a Lia vive lendo sobre energia.', prox: 'd' },
      d: { quem: 'helena', expr: 'neutra', texto: 'Primeiro, olhe o quadro de energia, ao lado da escola. Preciso saber se ainda dá para aproveitar a fiação. Depois fale com o Gabriel, na oficina a oeste.', prox: 'e' },
      e: { quem: 'voce', expr: 'neutra', texto: 'Pode deixar, Professora. Vou ver o quadro.', acoes: [{ passo: 'escola_luz.falar_helena' }, { sfx: 'passoMissao' }] },
    } },
    { id: 'h_pos_noite', cond: ['feito:escola_luz.concluir_helena', 'flag:decisao_noite'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'feliz', texto: 'As turmas da noite já têm lista de espera! Tem gente que não pisava numa sala de aula há vinte anos.', prox: 'b' },
      b: { quem: 'helena', expr: 'pensativa', texto: 'Se a vila já fez isto com um quadro de energia, imagine o que a biblioteca fechada, ao sul, poderia virar.',
        opcoes: [{ texto: 'Quero ajudar com os livros do cantinho.', prox: 'c', cond: ['flag:livros_adiado', '!missao_iniciada:livros_do_canto'], acoes: [{ missao: 'livros_do_canto' }, { flag: 'livros_oferecidos' }] }, { texto: 'Até logo.' }] },
      c: { quem: 'helena', expr: 'feliz', texto: 'Que bom! Procure um livro ao sul da praça, outro a leste e outro a oeste.' },
    } },
    { id: 'h_pos_leitura', cond: ['feito:escola_luz.concluir_helena', 'flag:decisao_leitura'], inicio: 'a', nos: {
      a: { quem: 'helena', expr: 'feliz', texto: 'O cantinho de leitura nunca esteve vazio. Até as crianças pedem para ficar mais um pouquinho!', prox: 'b' },
      b: { quem: 'helena', expr: 'pensativa', texto: 'A Dona Clara quer reabrir a biblioteca, ao sul. Quando chegar a hora, vamos precisar de você.',
        opcoes: [{ texto: 'Quero ajudar com os livros do cantinho.', prox: 'c', cond: ['flag:livros_adiado', '!missao_iniciada:livros_do_canto'], acoes: [{ missao: 'livros_do_canto' }, { flag: 'livros_oferecidos' }] }, { texto: 'Até logo.' }] },
      c: { quem: 'helena', expr: 'feliz', texto: 'Que bom! Procure um livro ao sul da praça, outro a leste e outro a oeste.' },
    } },
  ],

  /* ───── Gabriel ───── */
  gabriel: [
    { id: 'g_poco_calc', cond: ['ativo:poco_agua.calcular_corda'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'pensativo', texto: 'Estou no poço desde cedo. A bomba usa cabo e corda, e eu quero cortar sem sobrar nem faltar. Me ajuda com a conta?',
        opcoes: [{ texto: 'Vamos calcular.', prox: 'p' }, { texto: 'Já volto.', prox: 'adiar' }] },
      p: { puzzle: 'auto:matematica', ok: 'ok', cancelar: 'adiar' },
      ok: { quem: 'gabriel', expr: 'feliz', texto: 'É isso mesmo! Com a conta certa, nada vai ser desperdiçado. Agora é só juntar as peças e consertar a bomba comigo.', acoes: [{ passo: 'poco_agua.calcular_corda' }, { sfx: 'passoMissao' }] },
      adiar: { quem: 'gabriel', expr: 'neutro', texto: 'Sem pressa. Eu fico por aqui, mexendo na bomba.' },
    } },
    { id: 'g_poco_fix', cond: ['ativo:poco_agua.consertar'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'neutro', texto: 'Tudo pronto para consertar a bomba? Preciso dos materiais, da chave inglesa e de um apoio da comunidade para chamar os vizinhos.',
        opcoes: [{ texto: 'Consertar agora.', prox: 'b', cond: ['tem:madeira', 'tem:parafusos', 'tem:corda', 'tem:chave_inglesa', 'tem:apoio_comunidade'] }, { texto: 'Acho que falta alguma coisa.', prox: 'falta' }] },
      b: { quem: 'narrador', texto: 'Vocês apertam parafusos, trocam as tábuas e firmam a corda. A bomba tosse, estala... e a água jorra!', acoes: [{ tirarVarios: { madeira: 1, parafusos: 1, corda: 1, apoio_comunidade: 1 } }, { sfx: 'luz' }], prox: 'c' },
      c: { quem: 'gabriel', expr: 'feliz', texto: 'Funcionou! Ninguém mais precisa carregar água de longe. E olha só: fiz estas botas para você, com sola de pneu.', acoes: [{ passo: 'poco_agua.consertar' }], prox: 'd' },
      d: { quem: 'gabriel', expr: 'feliz', texto: 'Equipe as botas na mochila. A vila anda mais rápido quando todo mundo ajuda.' },
      falta: { quem: 'gabriel', expr: 'neutro', texto: 'Confira a mochila: tábuas, parafusos, corda, chave inglesa e um apoio da comunidade. O apoio vem de missões concluídas e de subir de domínio numa área.' },
    } },
    { id: 'g_poco_mat', cond: ['ativo:poco_agua.materiais'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'neutro', texto: 'Para a bomba, preciso de tábuas (perto da oficina, a oeste), parafusos (perto da casa vizinha) e corda (sudoeste da vila). Os itens brilham no chão. Dê uma olhada no mapa.' },
    } },
    { id: 'g_poco_ok', cond: ['missao_concluida:poco_agua'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'feliz', texto: 'O poço virou ponto de encontro! As crianças vêm brincar e a vizinhança aproveita para conversar.', prox: 'b' },
      b: { quem: 'gabriel', expr: 'pensativo', texto: 'Agora quero ensinar circuitos para a criançada depois da aula. Um dia, quero montar um laboratório de verdade.' },
    } },
    { id: 'g_poco_oferta', cond: ['feito:escola_luz.concluir_helena', '!flag:poco_oferecido', '!flag:poco_adiado'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'pensativo', texto: 'Você viu o poço? A bomba quebrou há meses. Todo dia o Beto e a Dona Marta carregam balde ladeira acima.', prox: 'b' },
      b: { quem: 'gabriel', expr: 'feliz', texto: 'Dá para consertar. Preciso de tábuas, parafusos e corda, de uma conta bem feita e do apoio da vizinhança. Topa ajudar?',
        opcoes: [{ texto: 'Topo!', prox: 'c', acoes: [{ missao: 'poco_agua' }, { flag: 'poco_oferecido' }, { item: 'chave_inglesa' }] }, { texto: 'Agora não.', prox: 'd', acoes: [{ flag: 'poco_adiado' }] }] },
      c: { quem: 'gabriel', expr: 'feliz', texto: 'Ótimo! Aqui está a minha chave inglesa. Junte o material, e eu te espero perto do poço.' },
      d: { quem: 'gabriel', expr: 'neutro', texto: 'Tudo bem. Se mudar de ideia, é só falar comigo.' },
    } },
    { id: 'g_pos', cond: ['feito:escola_luz.concluir_helena'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'feliz', texto: 'Agora ensino circuitos para a criançada depois da aula. Sabe o que é bom? Ver o brilho nos olhos de quem acende a primeira lâmpada.', prox: 'b' },
      b: { quem: 'gabriel', expr: 'pensativo', texto: 'Tenho caderno cheio de outras invenções. Um dia, quero montar um laboratório de verdade.',
        opcoes: [{ texto: 'Vamos consertar o poço?', prox: 'c', cond: ['flag:poco_adiado', '!flag:poco_oferecido'], acoes: [{ missao: 'poco_agua' }, { flag: 'poco_oferecido' }, { item: 'chave_inglesa' }] }, { texto: 'Até logo.' }] },
      c: { quem: 'gabriel', expr: 'feliz', texto: 'Esse é o espírito! Aqui está a minha chave inglesa. Junte tábuas, parafusos e corda, e me procure perto do poço.' },
    } },
    { id: 'g_luz', cond: ['feito:escola_luz.ativar_energia', '!feito:escola_luz.concluir_helena'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'feliz', texto: 'Ficou lindo, não ficou? Mas o melhor é que ninguém fez sozinho. Vá falar com a Professora Helena, ela está louca para te abraçar.' },
    } },
    { id: 'g_pronto', cond: ['feito:escola_luz.calcular_cabos', 'feito:escola_luz.bilhete_comunidade', '!feito:escola_luz.ativar_energia'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'feliz', texto: 'Os vizinhos já chegaram com tijolos, escadas e até garrafas de café! O quadro de energia está pronto para você ligar.' },
    } },
    { id: 'g_apos_cabos', cond: ['feito:escola_luz.calcular_cabos', '!feito:escola_luz.ativar_energia'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'neutro', texto: 'O cabo está medido, falta gente! A Lia é ótima para reunir a vizinhança. Ela deve estar na praça.' },
    } },
    { id: 'g_cabos', cond: ['feito:escola_luz.falar_gabriel', '!feito:escola_luz.calcular_cabos'], inicio: 'f', nos: {
      f: { quem: 'gabriel', expr: 'pensativo', texto: 'Preciso levar a energia dos painéis até o quadro, e cabo é caro. Me ajude a calcular o comprimento certo, sem desperdício?',
        opcoes: [{ texto: 'Vamos calcular.', prox: 'g' }, { texto: 'Preciso de um tempinho.', prox: 'adiar' }] },
      g: { puzzle: 'cabos', ok: 'h', cancelar: 'adiar' },
      h: { quem: 'gabriel', expr: 'feliz', texto: 'Perfeito! Com essa medida, o cabo sai do tamanho exato. Agora falta gente para ajudar na instalação. A Lia é ótima para reunir a vizinhança.', acoes: [{ passo: 'escola_luz.calcular_cabos' }, { sfx: 'passoMissao' }] },
      adiar: { quem: 'gabriel', expr: 'neutro', texto: 'Sem pressa. Quando quiser, é só voltar.' },
    } },
    { id: 'g_primeira', cond: ['feito:escola_luz.inspecionar_quadro', '!feito:escola_luz.falar_gabriel'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'surpreso', texto: 'Então o circuito do quadro fecha? Isso muda tudo! Eu estava desenhando um sistema solar para a escola em cadernos velhos.', prox: 'b' },
      b: { quem: 'gabriel', expr: 'pensativo', texto: 'Só falta decidir de onde tirar a energia. E eu quero que a vila entenda as opções, afinal quem decide somos todos nós.',
        opcoes: [{ texto: 'Quais são as opções?', prox: 'c' }, { texto: 'Volto mais tarde.', prox: 'adiar' }] },
      c: { quem: 'gabriel', expr: 'feliz', texto: 'Monte comigo: ligue cada fonte de energia ao que a transforma em eletricidade.', prox: 'd' },
      d: { puzzle: 'energia', ok: 'e', cancelar: 'adiar' },
      e: { quem: 'gabriel', expr: 'feliz', texto: 'Isso! Aqui o sol bate o ano todo, então painéis solares fazem muito sentido para a escola. O rio fica longe demais.', acoes: [{ passo: 'escola_luz.falar_gabriel' }, { sfx: 'passoMissao' }], prox: 'f' },
      f: { quem: 'gabriel', expr: 'pensativo', texto: 'Falta o cabo, que leva a energia dos painéis até o quadro. Cabo é caro, então não pode sobrar nem faltar. Me ajuda a calcular?',
        opcoes: [{ texto: 'Vamos calcular.', prox: 'g' }, { texto: 'Preciso de um tempinho.', prox: 'adiar' }] },
      g: { puzzle: 'cabos', ok: 'h', cancelar: 'adiar' },
      h: { quem: 'gabriel', expr: 'feliz', texto: 'Perfeito! Agora falta gente para a instalação. A Lia é ótima para reunir a vizinhança. Ela costuma ficar na praça.', acoes: [{ passo: 'escola_luz.calcular_cabos' }, { sfx: 'passoMissao' }] },
      adiar: { quem: 'gabriel', expr: 'neutro', texto: 'Sem pressa. Quando quiser, é só voltar.' },
    } },
    { id: 'g_cedo', cond: ['!feito:escola_luz.inspecionar_quadro'], inicio: 'a', nos: {
      a: { quem: 'gabriel', expr: 'feliz', texto: 'Opa, visita! Eu sou o Gabriel. Estou no meio de um circuito aqui, mas fale!', prox: 'b' },
      b: { quem: 'gabriel', expr: 'pensativo', texto: 'Se a Helena te mandou, dê uma olhada primeiro no quadro de energia da escola. Preciso saber em que pé está a fiação antes de qualquer plano.' },
    } },
  ],

  /* ───── Lia ───── */
  lia: [
    { id: 'l_livros', cond: ['ativo:livros_do_canto.achar_livros'], inicio: 'a', nos: {
      a: { quem: 'lia', expr: 'feliz', texto: 'Procurando os livros do cantinho? Vi um deles perto das flores, ao sul da praça. Os outros... acho que as crianças esconderam durante uma brincadeira!' },
    } },
    { id: 'l_pos', cond: ['feito:escola_luz.concluir_helena'], inicio: 'a', nos: {
      a: { quem: 'lia', expr: 'feliz', texto: 'Eu li três vezes o manual do painel solar. Agora ensino o que aprendi para a turma da noite!', prox: 'b' },
      b: { quem: 'lia', expr: 'pensativa', texto: 'Um dia quero ter um microscópio para ver o que tem numa gota d’água do rio. Mas por enquanto, a escola acesa já é um sonho realizado.' },
    } },
    { id: 'l_luz', cond: ['feito:escola_luz.ativar_energia', '!feito:escola_luz.concluir_helena'], inicio: 'a', nos: {
      a: { quem: 'lia', expr: 'feliz', texto: 'Você viu? A escola inteira acesa! Pedi para todo mundo que apareceu no mutirão assinar a lista. Foram mais de trinta pessoas!' },
    } },
    { id: 'l_depois', cond: ['feito:escola_luz.bilhete_comunidade', '!feito:escola_luz.ativar_energia'], inicio: 'a', nos: {
      a: { quem: 'lia', expr: 'feliz', texto: 'Já passei de porta em porta. O seu Antônio vai trazer a escada, e a Dona Marta prometeu café para a turma toda. Falta só você ligar o sistema!' },
    } },
    { id: 'l_bilhete', cond: ['feito:escola_luz.falar_gabriel', '!feito:escola_luz.bilhete_comunidade'], inicio: 'a', nos: {
      a: { quem: 'lia', expr: 'surpresa', texto: 'O Gabriel me contou do plano solar! Quero chamar a vizinhança toda para um mutirão no sábado, mas o meu bilhete ficou uma bagunça: as frases se misturaram na mochila.',
        opcoes: [{ texto: 'Eu ajudo você a organizar.', prox: 'b' }, { texto: 'Já volto.', prox: 'adiar' }] },
      b: { puzzle: 'bilhete', ok: 'c', cancelar: 'adiar' },
      c: { quem: 'lia', expr: 'feliz', texto: 'Agora sim! Vou passar de porta em porta. O seu Antônio tem escadas, a Dona Marta vai fazer café, e eu vou pedir que cada um traga o que puder.', acoes: [{ passo: 'escola_luz.bilhete_comunidade' }, { sfx: 'passoMissao' }] },
      adiar: { quem: 'lia', expr: 'neutra', texto: 'Tudo bem, eu espero aqui. Mas não demore, o sábado está chegando!' },
    } },
    { id: 'l_primeira', cond: ['!feito:escola_luz.falar_gabriel'], inicio: 'a', nos: {
      a: { quem: 'lia', expr: 'feliz', texto: 'Oi! Eu sou a Lia. Sabia que a água de um rio pode virar eletricidade? Eu desenho tudo no caderno, porque não tenho nenhum equipamento de ciências.', prox: 'b' },
      b: { quem: 'lia', expr: 'pensativa', texto: 'Se for ajudar a escola, converse com o Gabriel, o inventor da oficina. Ele está sempre com ideias novas.' },
    } },
  ],

  /* ───── Rafael ───── */
  rafael: [
    { id: 'r_pos', cond: ['missao_concluida:carta_rafael'], inicio: 'a', nos: {
      a: { quem: 'rafael', expr: 'feliz', texto: 'A Professora Helena leu a carta em voz alta para a turma da noite! Nunca vi tanta gente sorrindo por causa de um papel.', prox: 'b' },
      b: { quem: 'rafael', expr: 'pensativo', texto: 'Dizem que a Dona Clara guardava cartas na biblioteca fechada, ao sul. Quem sabe um dia alguém abre aquela porta.' },
    } },
    { id: 'r_entregar', cond: ['feito:carta_rafael.organizar_carta', '!missao_concluida:carta_rafael'], inicio: 'a', nos: {
      a: { quem: 'rafael', expr: 'neutro', texto: 'Leve a carta à Professora Helena, por favor. Ela costuma andar entre a escola e a estrada principal.' },
    } },
    { id: 'r_retomar', cond: ['missao_iniciada:carta_rafael', '!feito:carta_rafael.organizar_carta'], inicio: 'a', nos: {
      a: { quem: 'rafael', expr: 'feliz', texto: 'Voltou! Vamos arrumar a carta?', opcoes: [{ texto: 'Vamos.', prox: 'p' }, { texto: 'Depois.', prox: 'x' }] },
      p: { puzzle: 'auto:portugues', ok: 'd', cancelar: 'x' },
      d: { quem: 'rafael', expr: 'feliz', texto: 'Ficou perfeita! Agora é só entregar para a Professora Helena.', acoes: [{ passo: 'carta_rafael.organizar_carta' }, { sfx: 'passoMissao' }] },
      x: { quem: 'rafael', expr: 'neutro', texto: 'Sem pressa. Eu passo por aqui toda noite.' },
    } },
    { id: 'r_primeira', cond: ['!missao_iniciada:carta_rafael'], inicio: 'a', nos: {
      a: { quem: 'rafael', expr: 'surpreso', texto: 'Opa, gente na praça de noite! Eu sou o Rafael. Entrego cartas e recados quando as luzes acendem. Antes dos postes, eu nem conseguia ler os endereços.', prox: 'b' },
      b: { quem: 'rafael', expr: 'pensativo', texto: 'Tenho uma carta importante para a Professora Helena, mas as frases se misturaram na mochila. Pode me ajudar a organizar?',
        opcoes: [{ texto: 'Posso ajudar.', prox: 'p', acoes: [{ missao: 'carta_rafael' }] }, { texto: 'Agora não.', prox: 'x' }] },
      p: { puzzle: 'auto:portugues', ok: 'd', cancelar: 'x' },
      d: { quem: 'rafael', expr: 'feliz', texto: 'Ficou perfeita! Agora é só entregar para a Professora Helena.', acoes: [{ passo: 'carta_rafael.organizar_carta' }, { sfx: 'passoMissao' }] },
      x: { quem: 'rafael', expr: 'neutro', texto: 'Sem pressa. Eu passo por aqui toda noite.' },
    } },
  ],

  /* ───── moradores da vila (conversas curtas que mudam com a história) ───── */
  beto: [
    { id: 'b_poco', cond: ['missao_concluida:poco_agua'], inicio: 'a', nos: {
      a: { quem: 'beto', expr: 'feliz', texto: 'O poço voltou! Agora eu mesmo encho o balde. Ainda não alcanço a corda, mas o Gabriel prometeu fazer um banquinho.' },
    } },
    { id: 'b_luz', cond: ['feito:escola_luz.ativar_energia'], inicio: 'a', nos: {
      a: { quem: 'beto', expr: 'feliz', texto: 'Os postes acendem de noite! Agora dá para brincar de pique até mais tarde. A mamãe deixa, se eu fizer a lição.' },
    } },
    { id: 'b_0', inicio: 'a', nos: {
      a: { quem: 'beto', expr: 'neutro', texto: 'Você é novo aqui? Eu corro mais rápido que o vento. Quer apostar corrida?', prox: 'b' },
      b: { quem: 'beto', expr: 'feliz', texto: 'Brincadeira! A Professora diz que correr faz bem, só não vale na praça cheia.' },
    } },
  ],
  antonio: [
    { id: 'a_poco', cond: ['missao_concluida:poco_agua'], inicio: 'a', nos: {
      a: { quem: 'antonio', expr: 'feliz', texto: 'Minhas costas agradecem o poço consertado. Carreguei água por meses... Obrigado, jovem.' },
    } },
    { id: 'a_luz', cond: ['feito:escola_luz.bilhete_comunidade'], inicio: 'a', nos: {
      a: { quem: 'antonio', expr: 'feliz', texto: 'Levei a minha escada para o mutirão! Velha, mas firme. Assim como eu.' },
    } },
    { id: 'a_0', inicio: 'a', nos: {
      a: { quem: 'antonio', expr: 'neutro', texto: 'Bom dia. Faço a ronda pela vila todo dia: caminhar mantém o joelho no lugar e a prosa em dia.', prox: 'b' },
      b: { quem: 'antonio', expr: 'pensativo', texto: 'A biblioteca, ao sul, já foi cheia de gente. Meu neto aprendeu a ler lá.' },
    } },
  ],

  /* ───── Objetos interativos ───── */
  poco: [
    { id: 'po_ok', cond: ['missao_concluida:poco_agua'], inicio: 'a', nos: { a: { quem: 'narrador', texto: 'A bomba funciona e a água cai fresca no balde. Já tem fila de crianças curiosas.' } } },
    { id: 'po_andamento', cond: ['missao_iniciada:poco_agua'], inicio: 'a', nos: { a: { quem: 'narrador', texto: 'A bomba está emperrada e a corda se desfez. O Gabriel disse que consegue consertar com o material certo.' } } },
    { id: 'po_0', inicio: 'a', nos: { a: { quem: 'narrador', texto: 'Um poço antigo. A bomba está quebrada e o balde, preso por uma corda gasta. Talvez o Gabriel saiba consertar.' } } },
  ],
  quadro: [
    { id: 'q_antes', cond: ['!feito:escola_luz.falar_helena'], inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'Um quadro de energia antigo, cheio de poeira. Melhor conversar com a Professora Helena antes de mexer em algo.' },
    } },
    { id: 'q_ativar', cond: ['feito:escola_luz.calcular_cabos', 'feito:escola_luz.bilhete_comunidade', '!feito:escola_luz.ativar_energia'], inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'No sábado cedo, a vila inteira se reúne diante da escola. O Gabriel prende o último cabo, a Lia confere a lista de vizinhos e o seu Antônio segura a escada.', prox: 'b' },
      b: { quem: 'narrador', texto: 'Todos olham para você. É hora de ligar o sistema.',
        opcoes: [{ texto: 'Abaixar a alavanca.', prox: 'c' }, { texto: 'Ainda não.', prox: 'nao' }] },
      c: { quem: 'narrador', texto: 'Um zumbido baixo percorre os cabos. Aos poucos, a luz volta.', fimAcoes: [{ passo: 'escola_luz.ativar_energia' }, { melhoria: 'escola_energia' }] },
      nao: { quem: 'narrador', texto: 'Você respira fundo e solta a alavanca. Ainda dá tempo de conferir tudo.' },
    } },
    { id: 'q_depois', cond: ['feito:escola_luz.ativar_energia'], inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'O quadro zumbe baixinho. Pela primeira vez em meses, a escola tem energia.' },
    } },
    { id: 'q_espera_a', cond: ['feito:escola_luz.inspecionar_quadro', '!feito:escola_luz.falar_gabriel'], inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'O circuito do quadro está pronto, mas falta uma fonte de energia. Talvez o Gabriel, o inventor, tenha ideias.' },
    } },
    { id: 'q_espera_b', cond: ['feito:escola_luz.falar_gabriel', '!feito:escola_luz.calcular_cabos'], inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'Falta o cabo que ligará os painéis ao quadro. O Gabriel está calculando.' },
    } },
    { id: 'q_espera_c', cond: ['feito:escola_luz.calcular_cabos', '!feito:escola_luz.bilhete_comunidade'], inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'O cabo está medido, mas faltam mãos para a instalação. A Lia pode chamar a vizinhança.' },
    } },
    { id: 'q_inspecionar', cond: ['feito:escola_luz.falar_helena', '!feito:escola_luz.inspecionar_quadro'], inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'A caixa está aberta e os fios se cruzam sem ordem. Se você ligar tudo pelo caminho certo, a corrente volta a passar.', prox: 'b' },
      b: { puzzle: 'circuito', ok: 'c', cancelar: 'x' },
      c: { quem: 'narrador', texto: 'O circuito fecha e as lâmpadas de teste acendem por um instante! A fiação ainda serve. Mas sem uma fonte de energia, a luz se apaga logo em seguida.', acoes: [{ passo: 'escola_luz.inspecionar_quadro' }, { sfx: 'passoMissao' }] },
      x: { quem: 'narrador', texto: 'Você fecha a tampa do quadro. Dá para tentar de novo depois.' },
    } },
  ],

  porta_escola: [
    { id: 'pe_turma', cond: ['melhoria:escola_energia', 'feito:escola_luz.concluir_helena'], inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'Pela porta aberta, a turma da noite estuda sob a luz nova. Na lousa, a Professora deixou desafios para quem passar. Qual área você quer encarar?',
        opcoes: [{ texto: 'Matemática', prox: 'pm' }, { texto: 'Português', prox: 'pp' }, { texto: 'Lógica', prox: 'pl' }, { texto: 'Conhecimentos gerais', prox: 'pc' }, { texto: 'Agora não.', prox: 'x' }] },
      pm: { puzzle: 'auto:matematica', ok: 'fim', cancelar: 'x' }, pp: { puzzle: 'auto:portugues', ok: 'fim', cancelar: 'x' },
      pl: { puzzle: 'auto:logica', ok: 'fim', cancelar: 'x' }, pc: { puzzle: 'auto:conhecimentos', ok: 'fim', cancelar: 'x' },
      fim: { quem: 'narrador', texto: 'A turma aplaude baixinho. Aqui, quem aprende também ensina.' },
      x: { quem: 'narrador', texto: 'Você acena para a turma e continua o passeio.' },
    } },
    { id: 'pe_a', cond: ['feito:escola_luz.concluir_helena'], inicio: 'a', nos: { a: { quem: 'narrador', texto: 'A porta está aberta. Lá dentro, as salas ainda estão sendo arrumadas pela comunidade.' } } },
    { id: 'pe_b', cond: ['feito:escola_luz.ativar_energia'], inicio: 'a', nos: { a: { quem: 'narrador', texto: 'As luzes estão acesas! Antes de entrar, conte a novidade à Professora Helena.' } } },
    { id: 'pe_c', inicio: 'a', nos: { a: { quem: 'narrador', texto: 'A porta da escola está encostada e lá dentro não há luz nenhuma. Melhor esperar a energia voltar.' } } },
  ],
  porta_biblioteca: [
    { id: 'pb', inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'A porta da Biblioteca Esquecida está fechada com tábuas. Uma placa desbotada diz: “Fechada para reforma. Voltamos com mais livros. — Dona Clara”.', acoes: [{ flag: 'pista_biblioteca' }], prox: 'b' },
      b: { quem: 'narrador', texto: 'Pela fresta, você vê prateleiras cobertas de poeira e muitos livros esperando por leitores.' },
    } },
  ],
  portao: [
    { id: 'pt_a', cond: ['feito:escola_luz.concluir_helena'], inicio: 'a', nos: { a: { quem: 'narrador', acoes: [{ flag: 'pista_portao' }], texto: 'O portão continua trancado. Mas cada passo que a vila dá parece deixá-lo um pouco mais perto de se abrir.' } } },
    { id: 'pt_b', inicio: 'a', nos: { a: { quem: 'narrador', acoes: [{ flag: 'pista_portao' }], texto: 'O portão do muro norte está preso por uma corrente enferrujada. Do outro lado, só se ouve o vento. Ainda não é hora.' } } },
  ],
  placa_tutorial: [
    { id: 'pl', inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'Placa: “Bem-vindo a Vila Esperança. Aqui, quem aprende ensina.”', prox: 'b' },
      b: { quem: 'narrador', texto: 'Mover: {mover}. Interagir: {interagir}. Correr: {correr}. Diário: {diario}. Menu: {pausa}. O jogo salva sozinho, e você pode salvar manualmente no menu.' },
    } },
  ],
  mural: [
    { id: 'mu_a', cond: ['feito:escola_luz.concluir_helena'], inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'Mural: “Turmas da noite abertas!” e, no canto, um recado novo: “Biblioteca ao sul: procuram-se voluntários para a reforma.”' },
    } },
    { id: 'mu_b', inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'Mural da vila: “Mutirão pela luz! A escola precisa de todos nós.”', prox: 'b' },
      b: { quem: 'narrador', texto: 'Anotação no seu diário: {objetivo}' },
    } },
  ],
  canto_leitura: [
    { id: 'cl_guardar', cond: ['ativo:livros_do_canto.guardar_livros'], inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'Você encontra o espaço certo nas prateleiras e guarda os livros, um a um.', acoes: [{ tirarVarios: { livro_contos: 1, livro_atlas: 1, livro_ciencias: 1 } }, { sfx: 'ok' }, { passo: 'livros_do_canto.guardar_livros' }], prox: 'b' },
      b: { quem: 'narrador', texto: 'A estante ficou cheia de histórias. Quem passar por aqui vai querer ficar. Agora a leitura guiada tem mais áreas para escolher.' },
    } },
    { id: 'cl', inicio: 'a', nos: {
      a: { quem: 'narrador', texto: 'Uma estante e um banco confortável, feitos para ler. Aqui dá para fazer a leitura guiada: um desafio no seu nível, na área que você escolher.',
        opcoes: [
          { texto: 'Leitura guiada: Português', prox: 'pp' }, { texto: 'Leitura guiada: Conhecimentos gerais', prox: 'pc' },
          { texto: 'Leitura guiada: Matemática', prox: 'pm', cond: ['melhoria:estante_cheia'] }, { texto: 'Leitura guiada: Lógica', prox: 'pl', cond: ['melhoria:estante_cheia'] },
          { texto: 'Só olhar.', prox: 'x' }] },
      pp: { puzzle: 'auto:portugues', ok: 'fim', cancelar: 'x' }, pc: { puzzle: 'auto:conhecimentos', ok: 'fim', cancelar: 'x' },
      pm: { puzzle: 'auto:matematica', ok: 'fim', cancelar: 'x' }, pl: { puzzle: 'auto:logica', ok: 'fim', cancelar: 'x' },
      fim: { quem: 'narrador', texto: 'Boa leitura! Pensar junto com um livro é uma ótima forma de aprender.' },
      x: { quem: 'narrador', texto: 'Você respira o cheiro de livro e segue seu caminho.' },
    } },
  ],
};
