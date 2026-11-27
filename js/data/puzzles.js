/* Desafios educativos orientados por dados. Cada desafio tem uma variante por nível (1 Iniciante, 2 Intermediário, 3 Avançado).
   tipo: circuito | ordenar | medida | conectar (componentes em js/systems/puzzles.js). */
AM.Data.puzzles = {
  /* ───────── LÓGICA · circuito ───────── */
  circuito: {
    area: 'logica', tipo: 'circuito', titulo: 'Quadro de energia',
    tempoEsperado: { 1: 60, 2: 100, 3: 160 },
    variantes: {
      1: {
        enunciado: 'Os fios do quadro estão fora do lugar. Toque nas peças para girá-las até a corrente sair da bateria e acender a lâmpada.',
        grade: ['S1 I1 L2', 'L* I* I0', 'I* L* B0'],
        dicas: ['Comece pela bateria: ela só tem uma saída. Para onde ela aponta?', 'O caminho desce pelo lado direito. Procure as peças retas e as curvas que levam até a lâmpada.', 'A peça curva do canto superior direito deve ligar o fio da esquerda ao fio de baixo.'],
        explicacao: ['Um circuito elétrico só funciona se estiver fechado: a corrente precisa de um caminho contínuo entre a fonte e a lâmpada. Basta uma peça fora do lugar para o caminho se romper.'],
        reforco: 'Dica de estudo: siga o fio com o dedo, da bateria até a lâmpada. Onde o fio "quebra", a peça precisa girar.',
      },
      2: {
        enunciado: 'Agora há duas lâmpadas. Gire as peças até as duas acenderem ao mesmo tempo.',
        grade: ['S1 I1 T2 B3', 'L* I* I0 L*', 'I* L* B0 I*'],
        dicas: ['A peça em T divide o caminho em dois. Ela precisa apontar para as duas lâmpadas.', 'Uma lâmpada fica à direita do T e a outra, duas casas abaixo dele.', 'O T deve ficar com a "ponta" faltando virada para cima.'],
        explicacao: ['Quando o fio se divide em um ponto (a peça em T), a corrente segue por dois caminhos ao mesmo tempo. É uma ligação em paralelo, por isso as duas lâmpadas acendem juntas.'],
        reforco: 'Dica de estudo: uma peça em T tem três saídas. Pense em qual delas fica sem fio e gire até que ela aponte para um lugar vazio.',
      },
      3: {
        enunciado: 'O quadro completo tem três lâmpadas e vários desvios. Planeje o caminho e acenda todas.',
        grade: ['S2 L* B2 I* L*', 'T1 I1 L3 I* I*', 'I0 L* B2 I* L*', 'L0 I1 T0 B3 I*'],
        dicas: ['Faça o raciocínio de trás para frente: de cada lâmpada, siga o fio de volta até a bateria.', 'A coluna da esquerda carrega a corrente para baixo. Os T distribuem para a direita.', 'Há peças que não fazem parte do caminho: não precisa usar todas.'],
        explicacao: ['Em circuitos maiores, é útil pensar do final para o começo: de cada lâmpada, siga o fio de volta até a fonte. Esse tipo de raciocínio (dedução e planejamento) também é usado em programação e em engenharia.'],
        reforco: 'Dica de estudo: resolva uma lâmpada de cada vez. Quando uma estiver acesa, vá para a próxima sem desfazer o caminho da anterior.',
      },
    },
  },

  /* ───────── CONHECIMENTOS GERAIS · conectar ───────── */
  energia: {
    area: 'conhecimentos', tipo: 'conectar', titulo: 'Fontes de energia',
    tempoEsperado: { 1: 50, 2: 80, 3: 110 },
    variantes: {
      1: {
        enunciado: 'Escolha um item da esquerda e depois o item da direita que transforma essa fonte em eletricidade.',
        esquerda: [{ id: 'sol', texto: 'Luz do Sol' }, { id: 'vento', texto: 'Vento' }, { id: 'agua', texto: 'Queda de água do rio' }],
        direita: [{ id: 'hidro', texto: 'Usina hidrelétrica' }, { id: 'painel', texto: 'Painel solar' }, { id: 'eolica', texto: 'Aerogerador (cata-vento gigante)' }],
        pares: { sol: 'painel', vento: 'eolica', agua: 'hidro' },
        dicas: ['Pense no nome: "hidro" vem da palavra grega para água.', 'Os aerogeradores têm hélices enormes. O que faz as hélices girarem?', 'Painéis solares ficam virados para o céu, onde bate a luz.'],
        explicacao: ['Fontes renováveis, como Sol, vento e água, se refazem naturalmente. Painéis solares transformam luz em eletricidade, aerogeradores usam a força do vento e hidrelétricas usam a água em queda.', 'No Brasil, a maior parte da eletricidade vem de fontes renováveis, principalmente das hidrelétricas.'],
        reforco: 'Dica de estudo: associe cada fonte ao movimento que ela produz. Vento e água em queda movimentam hélices e turbinas.',
      },
      2: {
        enunciado: 'Ligue cada tecnologia ao exemplo que existe no Brasil.',
        esquerda: [{ id: 'painel', texto: 'Painel solar' }, { id: 'eolica', texto: 'Aerogerador' }, { id: 'hidro', texto: 'Usina hidrelétrica' }, { id: 'bio', texto: 'Usina de biomassa' }],
        direita: [{ id: 'ex_hidro', texto: 'Itaipu (rio Paraná) e Belo Monte (rio Xingu)' }, { id: 'ex_bio', texto: 'Bagaço de cana-de-açúcar queimado em usinas' }, { id: 'ex_sol', texto: 'Grandes usinas solares no Nordeste e em Minas Gerais' }, { id: 'ex_eol', texto: 'Parques eólicos do Nordeste' }],
        pares: { painel: 'ex_sol', eolica: 'ex_eol', hidro: 'ex_hidro', bio: 'ex_bio' },
        dicas: ['Itaipu e Belo Monte ficam em rios grandes. Que tipo de usina é essa?', 'Biomassa é matéria de origem vegetal. O que sobra depois de moer a cana?', 'O vento é forte e constante em partes do litoral e do interior do Nordeste.'],
        explicacao: ['O Brasil tem muito sol, vento e rios. A energia eólica é forte no Nordeste, Itaipu e Belo Monte são hidrelétricas e o bagaço de cana vira energia em muitas usinas.', 'Diversificar as fontes torna o sistema elétrico mais seguro e menos dependente de uma só condição, como a chuva.'],
        reforco: 'Dica de estudo: monte um "mapa mental": rios, hidrelétricas, vento, Nordeste, cana, biomassa. Cada palavra puxa a seguinte.',
      },
      3: {
        enunciado: 'Classifique cada fonte de energia: ela é renovável ou não renovável? Mais de uma fonte pode ir para o mesmo grupo.',
        esquerda: [{ id: 'sol', texto: 'Luz do Sol' }, { id: 'carvao', texto: 'Carvão mineral' }, { id: 'vento', texto: 'Vento' }, { id: 'petroleo', texto: 'Petróleo' }, { id: 'agua', texto: 'Água dos rios' }, { id: 'cana', texto: 'Bagaço de cana (biomassa)' }],
        direita: [{ id: 'ren', texto: 'Renovável' }, { id: 'nren', texto: 'Não renovável' }],
        multi: true,
        pares: { sol: 'ren', carvao: 'nren', vento: 'ren', petroleo: 'nren', agua: 'ren', cana: 'ren' },
        dicas: ['Pergunte: essa fonte se refaz em pouco tempo, na natureza?', 'Carvão e petróleo levam milhões de anos para se formar.', 'A biomassa vem de plantas, que podem ser plantadas de novo.'],
        explicacao: ['Fontes renováveis se renovam em escala humana: Sol, vento, água e biomassa. Carvão e petróleo levam milhões de anos para se formar e, ao serem queimados, liberam muito gás carbônico, que agrava o aquecimento global.', 'Escolher fontes renováveis protege o meio ambiente e pode gerar energia mais barata e local para a comunidade.'],
        reforco: 'Dica de estudo: "renovável" significa que o recurso volta sozinho em pouco tempo. Se levou milhões de anos, não é renovável.',
      },
    },
  },

  /* ───────── MATEMÁTICA · medida (montar o cabo) ───────── */
  cabos: {
    area: 'matematica', tipo: 'medida', titulo: 'O cabo certo',
    tempoEsperado: { 1: 60, 2: 120, 3: 180 },
    variantes: {
      1: {
        enunciado: 'A lâmpada fica a 4,5 m do quadro. Monte um cabo com exatamente 4,5 m usando os pedaços disponíveis (toque num pedaço para colocá-lo; toque no cabo para tirá-lo).',
        alvoCm: 450, mostrarAlvo: true, dicaDirecao: true,
        pecas: [{ cm: 200, qtd: 2 }, { cm: 150, qtd: 1 }, { cm: 100, qtd: 2 }, { cm: 50, qtd: 2 }],
        dicas: ['Some os pedaços aos poucos. Dois pedaços de 2 m já formam 4 m.', 'Depois dos 4 m, falta só meio metro: existe um pedaço de 0,5 m?', 'Há mais de uma resposta certa. Por exemplo, 2 + 1,5 + 1 também dá 4,5.'],
        explicacao: ['Somar números decimais é como somar dinheiro: 2 + 2 + 0,5 = 4,5. Há mais de um jeito de chegar lá, por exemplo 2 + 1,5 + 1 = 4,5.', 'Medir com precisão evita desperdício de material, algo muito importante quando os recursos da comunidade são poucos.'],
        reforco: 'Dica de estudo: transforme metros em centímetros. 4,5 m = 450 cm. Fica mais fácil somar 200 + 200 + 50.',
      },
      2: {
        enunciado: 'Serão 3 lâmpadas. Cada uma precisa de 1,25 m de cabo, mais 20 cm de sobra para a emenda. Calcule o total e monte o cabo.',
        alvoCm: 435, mostrarAlvo: false, dicaDirecao: false,
        pecas: [{ cm: 200, qtd: 2 }, { cm: 100, qtd: 2 }, { cm: 50, qtd: 2 }, { cm: 25, qtd: 2 }, { cm: 10, qtd: 2 }, { cm: 5, qtd: 2 }],
        dicas: ['Primeiro calcule quanto cabo cada lâmpada usa: 1,25 m + 0,20 m.', 'Cada lâmpada usa 1,45 m. Agora multiplique por 3.', 'O total é 4,35 m. Monte com os pedaços, por exemplo 2 + 2 + 0,25 + 0,10.'],
        explicacao: ['3 × 1,25 = 3,75 m e 3 × 0,20 = 0,60 m. Somando: 3,75 + 0,60 = 4,35 m.', 'Transformar tudo em centímetros também ajuda: cada lâmpada usa 125 + 20 = 145 cm, e 3 × 145 = 435 cm.'],
        reforco: 'Dica de estudo: quando há várias partes iguais, calcule uma parte (1,25 + 0,20) e multiplique pelo número de partes.',
      },
      3: {
        enunciado: 'O trecho do painel solar até o quadro mede 12 m. Por segurança, o cabo deve ter 15% a mais. Calcule o comprimento e monte o cabo.',
        alvoCm: 1380, mostrarAlvo: false, dicaDirecao: false,
        pecas: [{ cm: 500, qtd: 2 }, { cm: 200, qtd: 2 }, { cm: 100, qtd: 2 }, { cm: 50, qtd: 2 }, { cm: 20, qtd: 3 }, { cm: 10, qtd: 2 }],
        dicas: ['15% = 10% + 5%. Quanto é 10% de 12 m?', '10% de 12 m é 1,2 m e 5% é a metade disso: 0,6 m. O acréscimo é 1,8 m.', 'O total é 12 + 1,8 = 13,8 m. Dá para montar com 5 + 5 + 2 + 1 + 0,5 + 0,2 + 0,1.'],
        explicacao: ['15% de 12 m é 12 × 0,15 = 1,8 m. O total é 12 + 1,8 = 13,8 m.', 'Também dá para multiplicar direto por 1,15: 12 × 1,15 = 13,8. Porcentagens aparecem em preços, descontos, receitas e margens de segurança.'],
        reforco: 'Dica de estudo: 10% de qualquer número é só andar a vírgula uma casa para a esquerda. 5% é a metade de 10%.',
      },
    },
  },

  /* ───────── PORTUGUÊS · ordenar (bilhete) ───────── */
  bilhete: {
    area: 'portugues', tipo: 'ordenar', titulo: 'O bilhete da Lia',
    tempoEsperado: { 1: 45, 2: 70, 3: 110 },
    variantes: {
      1: {
        enunciado: 'As frases do bilhete se misturaram. Arraste as cartas (ou use as setas) para colocá-las na ordem certa.',
        cartas: ['Queridos vizinhos,', 'Nossa escola está sem energia há meses.', 'Neste sábado, às 9h, vamos instalar painéis solares na praça da escola.', 'Contamos com vocês! Lia'],
        intrusos: [],
        dicas: ['Todo bilhete começa cumprimentando quem vai ler.', 'Depois vem o motivo e, em seguida, o convite com dia e hora.', 'O final traz a despedida e a assinatura.'],
        explicacao: ['Um bilhete tem partes bem definidas: saudação, motivo, convite com data, hora e local, e despedida com assinatura. Organizar as ideias nessa ordem ajuda quem lê a entender rápido.'],
        reforco: 'Dica de estudo: pergunte "quem?", "o quê?", "quando?" e "onde?". As respostas formam o convite.',
      },
      2: {
        enunciado: 'Organize o bilhete completo. Ele tem um pedido de ajuda, além do convite.',
        cartas: ['Queridos vizinhos,', 'Nossa escola está sem energia há meses e as aulas noturnas pararam.', 'Neste sábado, às 9h, vamos instalar painéis solares na praça da escola.', 'Quem puder, traga ferramentas, cabos ou apenas vontade de ajudar.', 'Contamos com vocês! Lia'],
        intrusos: [],
        dicas: ['O problema vem antes da solução.', 'O pedido de ajuda vem depois de dizer quando e onde será o mutirão.', 'A despedida é sempre a última carta.'],
        explicacao: ['Um texto bem organizado leva o leitor do problema (escola sem energia) à solução (mutirão) e ao pedido de ajuda. Datas, horários e locais precisam aparecer com clareza para que ninguém se perca.'],
        reforco: 'Dica de estudo: leia o bilhete em voz baixa, como se você fosse um vizinho. Se uma frase surgir "do nada", ela está fora do lugar.',
      },
      3: {
        enunciado: 'Organize o bilhete. Atenção: uma das frases não pertence ao texto. Descarte-a com o botão "Descartar".',
        cartas: ['Queridos vizinhos,', 'Nossa escola está sem energia há meses e as aulas noturnas pararam.', 'Por isso, vamos instalar painéis solares na praça da escola neste sábado, às 9h.', 'Quem puder, traga ferramentas, cabos ou apenas vontade de ajudar.', 'Haverá café e pão de queijo para todos no final do mutirão.', 'Contamos com vocês! Lia'],
        intrusos: ['Ontem choveu bastante e as ruas ficaram cheias de folhas.'],
        dicas: ['A palavra "Por isso" indica consequência: ela só faz sentido depois do problema que explica.', 'Uma das frases fala de um assunto que não tem relação com o mutirão.', 'O convite com café vem perto do final, antes da despedida.'],
        explicacao: ['"Por isso" é um conectivo de conclusão: ele retoma o problema anterior (escola sem energia) e apresenta a consequência (o mutirão).', 'A frase sobre a chuva foge do assunto. Em um texto, cada frase deve contribuir para a mesma ideia: isso se chama coerência.'],
        reforco: 'Dica de estudo: conectivos como "por isso", "mas" e "então" mostram a relação entre duas ideias. Procure o que vem antes deles.',
      },
    },
  },

  /* ───────── MATEMÁTICA · conectar (contas da feira) ───────── */
  feira: {
    area: 'matematica', tipo: 'conectar', titulo: 'Contas da feira',
    tempoEsperado: { 1: 40, 2: 70, 3: 100 },
    variantes: {
      1: {
        tag: 'operacoes',
        enunciado: 'Na feira da vila, cada conta tem um resultado. Escolha a conta à esquerda e ligue ao resultado certo.',
        esquerda: [{ id: 'a', texto: '3 × 4' }, { id: 'b', texto: '10 + 15' }, { id: 'c', texto: '20 − 7' }],
        direita: [{ id: 'r25', texto: '25' }, { id: 'r13', texto: '13' }, { id: 'r12', texto: '12' }],
        pares: { a: 'r12', b: 'r25', c: 'r13' },
        dicas: ['3 × 4 é o mesmo que somar 3 quatro vezes: 3 + 3 + 3 + 3.', '10 + 15: some as dezenas e depois as unidades.', 'Em 20 − 7, tire 7 de 20. Dá para tirar 10 e depois somar 3.'],
        explicacao: ['Multiplicar é somar parcelas iguais: 3 × 4 = 3 + 3 + 3 + 3 = 12. Somar 10 + 15 dá 25, e 20 − 7 dá 13.', 'Conferir contas de cabeça ajuda muito na hora de comprar e de vender, tanto na feira como na vida.'],
        reforco: 'Dica de estudo: quebre a conta em partes pequenas. 20 − 7 vira 20 − 10 = 10 e depois 10 + 3 = 13.',
      },
      2: {
        tag: 'fracoes',
        enunciado: 'Agora com frações e números decimais. Ligue cada conta ao resultado certo.',
        esquerda: [{ id: 'a', texto: '1/2 de 20' }, { id: 'b', texto: '0,5 + 0,25' }, { id: 'c', texto: '3/4 de 8' }, { id: 'd', texto: '2 × 1,5' }],
        direita: [{ id: 'r6', texto: '6' }, { id: 'r075', texto: '0,75' }, { id: 'r10', texto: '10' }, { id: 'r3', texto: '3' }],
        pares: { a: 'r10', b: 'r075', c: 'r6', d: 'r3' },
        dicas: ['"Metade de 20" é dividir 20 por 2.', '0,5 é metade e 0,25 é um quarto. Juntos, formam três quartos.', '3/4 de 8: divida 8 por 4 e multiplique por 3.'],
        explicacao: ['1/2 de 20 = 20 ÷ 2 = 10. Em 0,5 + 0,25 = 0,75, alinhe as vírgulas ao somar. 3/4 de 8: 8 ÷ 4 = 2 e 2 × 3 = 6. E 2 × 1,5 = 3.', 'Frações e decimais são formas diferentes de escrever a mesma ideia: 1/2 = 0,5 e 3/4 = 0,75.'],
        reforco: 'Dica de estudo: para achar "3/4 de 8", primeiro ache 1/4 (8 ÷ 4 = 2) e depois repita 3 vezes (2 × 3 = 6).',
      },
      3: {
        tag: 'porcentagem',
        enunciado: 'A feira fez promoções! Ligue cada cálculo de porcentagem ao valor correto.',
        esquerda: [{ id: 'a', texto: '20% de 80' }, { id: 'b', texto: '25% de 60' }, { id: 'c', texto: '10% de 350' }, { id: 'd', texto: '5% de 200' }, { id: 'e', texto: '150% de 20' }],
        direita: [{ id: 'r16', texto: '16' }, { id: 'r15', texto: '15' }, { id: 'r35', texto: '35' }, { id: 'r10', texto: '10' }, { id: 'r30', texto: '30' }],
        pares: { a: 'r16', b: 'r15', c: 'r35', d: 'r10', e: 'r30' },
        dicas: ['10% é dividir por 10. 20% é o dobro disso.', '25% é um quarto: divida 60 por 4.', '150% é o valor inteiro mais a metade dele.'],
        explicacao: ['20% de 80 = 80 × 0,20 = 16. 25% de 60 = 60 ÷ 4 = 15. 10% de 350 = 35. 5% de 200 = 10 (metade de 10%). 150% de 20 = 20 + 10 = 30.', 'Porcentagem é uma fração de 100. Ela aparece em descontos, juros, notas e resultados de pesquisas.'],
        reforco: 'Dica de estudo: use 10% como base. 20% = 2 × 10%, 5% = metade de 10%, 25% = um quarto do valor.',
      },
    },
  },

  /* ───────── PORTUGUÊS · ordenar (história do poço) ───────── */
  historia: {
    area: 'portugues', tipo: 'ordenar', titulo: 'A história do poço',
    tempoEsperado: { 1: 45, 2: 80, 3: 120 },
    variantes: {
      1: {
        tag: 'sequencia',
        enunciado: 'As frases desta história se misturaram. Coloque-as na ordem certa: começo, meio e fim.',
        cartas: ['Era uma vez uma vila onde o poço secou.', 'Os moradores se reuniram para decidir o que fazer.', 'Juntos, eles cavaram e consertaram a bomba, e a água voltou.', 'Desde então, todos cuidam do poço com carinho.'],
        intrusos: [],
        dicas: ['Toda história começa apresentando o lugar e o problema.', 'Depois do problema, as pessoas decidem agir.', 'O final mostra como as coisas ficaram.'],
        explicacao: ['Uma narrativa tem começo (apresenta o problema), meio (as ações) e fim (a solução e suas consequências). Na ordem certa, a história faz sentido.'],
        reforco: 'Dica de estudo: pergunte "o que aconteceu primeiro?" e "o que mudou no final?". O problema vem antes da solução.',
      },
      2: {
        tag: 'sequencia',
        enunciado: 'Organize a história completa. Procure palavras que mostram o tempo, como "um dia", "no mesmo dia" e "desde então".',
        cartas: ['Era uma vez uma vila onde o poço secou, e as crianças tinham de buscar água longe.', 'Um dia, uma menina teve uma ideia: pedir ajuda a quem entendia de bombas.', 'No mesmo dia, o inventor da vila e vários vizinhos se juntaram ao redor do poço.', 'Depois de muito trabalho, a água voltou a jorrar.', 'Desde então, todos cuidam do poço com carinho.'],
        intrusos: [],
        dicas: ['"Era uma vez" abre a história.', '"Um dia" marca o momento em que algo muda.', '"Desde então" só pode aparecer depois de a solução acontecer.'],
        explicacao: ['Expressões de tempo como "um dia", "no mesmo dia", "depois" e "desde então" ajudam o leitor a seguir a ordem dos fatos.', 'Quando você escreve, usar esses marcadores deixa o texto mais claro e agradável de ler.'],
        reforco: 'Dica de estudo: sublinhe as expressões de tempo de cada frase. Elas funcionam como placas de sinalização da história.',
      },
      3: {
        tag: 'coerencia',
        enunciado: 'Organize a história. Atenção: uma frase não pertence ao texto. Descarte-a com o botão "Descartar".',
        cartas: ['Era uma vez uma vila onde o poço secou.', 'Primeiro, os moradores mediram a profundidade do poço com uma corda.', 'Em seguida, trocaram as peças quebradas da bomba.', 'Por fim, a água voltou e a vila inteira fez uma festa.', 'Desde então, ninguém desperdiça água.'],
        intrusos: ['A Lua é um satélite natural da Terra.'],
        dicas: ['Os conectivos "primeiro", "em seguida" e "por fim" têm uma ordem natural.', 'Uma das frases fala de um assunto que não tem relação com o poço.', 'O final mostra a consequência do que aconteceu antes.'],
        explicacao: ['"Primeiro", "em seguida" e "por fim" organizam os passos em sequência. A frase sobre a Lua foge do tema e quebra a coerência do texto.', 'Em um bom texto, todas as frases contribuem para a mesma ideia central.'],
        reforco: 'Dica de estudo: se tirar uma frase e a história continuar fazendo sentido, ela provavelmente está fora do assunto.',
      },
    },
  },

  /* ───────── LÓGICA · ordenar (algoritmos) ───────── */
  algoritmo: {
    area: 'logica', tipo: 'ordenar', titulo: 'Passos certos',
    tempoEsperado: { 1: 45, 2: 75, 3: 120 },
    variantes: {
      1: {
        tag: 'sequencia_passos',
        enunciado: 'O Gabriel precisa trocar uma lâmpada com segurança. Coloque os passos na ordem certa.',
        cartas: ['Desligar a chave de energia', 'Esperar a lâmpada esfriar', 'Tirar a lâmpada velha', 'Colocar a lâmpada nova', 'Ligar a chave de energia'],
        intrusos: [],
        dicas: ['Segurança em primeiro lugar: antes de mexer, a corrente precisa estar desligada.', 'Lâmpadas acesas esquentam. O que fazer antes de tocar nelas?', 'Só depois de tudo pronto a energia volta.'],
        explicacao: ['Um algoritmo é uma sequência de passos claros e na ordem certa. Aqui, desligar a energia vem primeiro, para evitar choques, e ligá-la de novo é o último passo.', 'Seguir passos na ordem certa é a base de receitas, instruções e programas de computador.'],
        reforco: 'Dica de estudo: imagine que você está explicando para alguém que nunca fez isso. Qual é o primeiro passo que não pode ser pulado?',
      },
      2: {
        tag: 'sequencia_passos',
        enunciado: 'A Lia empresta livros para a vizinhança e quer um jeito organizado. Coloque os passos do empréstimo na ordem.',
        cartas: ['Procurar o livro na estante', 'Anotar no caderno o nome de quem leva o livro', 'Entregar o livro e avisar a data de devolução', 'Receber o livro de volta no dia combinado', 'Riscar o nome do caderno'],
        intrusos: [],
        dicas: ['Primeiro é preciso achar o livro.', 'O registro no caderno acontece antes de entregar o livro.', 'Riscar o nome só faz sentido depois que o livro voltou.'],
        explicacao: ['Cada passo depende do anterior: não dá para riscar o nome antes de receber o livro de volta. Perceber essas dependências é um raciocínio central em programação.', 'Registrar quem pegou o livro também ajuda a comunidade a cuidar do que é de todos.'],
        reforco: 'Dica de estudo: pergunte, para cada passo, "o que precisa ter acontecido antes disso?".',
      },
      3: {
        tag: 'repeticao',
        enunciado: 'Um sensor vai acender a lâmpada da praça sozinho. Ordene o algoritmo e descarte o passo que não pertence a ele.',
        cartas: ['Ler o sensor de luz', 'Comparar o valor lido com o limite de escuro', 'Se for menor que o limite, acender a lâmpada', 'Esperar um minuto', 'Voltar ao primeiro passo para repetir'],
        intrusos: ['Pintar a lâmpada de azul'],
        dicas: ['Primeiro o sensor mede. Só depois dá para comparar.', 'A decisão ("se...") vem depois da comparação.', 'Um algoritmo que se repete sempre volta ao início no final.'],
        explicacao: ['Este algoritmo tem uma condição ("se for menor que o limite") e uma repetição ("voltar ao primeiro passo"). Programas usam esses dois recursos o tempo todo.', 'Pintar a lâmpada não ajuda a decidir quando acendê-la, então esse passo não pertence ao algoritmo.'],
        reforco: 'Dica de estudo: leia o algoritmo em voz alta como se fosse o sensor. Medir, comparar, decidir, esperar, repetir.',
      },
    },
  },

  /* ───────── CONHECIMENTOS GERAIS · conectar (coleta seletiva) ───────── */
  reciclagem: {
    area: 'conhecimentos', tipo: 'conectar', titulo: 'Coleta seletiva',
    tempoEsperado: { 1: 40, 2: 70, 3: 100 },
    variantes: {
      1: {
        tag: 'meio_ambiente',
        enunciado: 'A vila quer separar o lixo. Ligue cada item à lixeira certa.',
        esquerda: [{ id: 'jornal', texto: 'Jornal velho' }, { id: 'pet', texto: 'Garrafa PET' }, { id: 'banana', texto: 'Casca de banana' }],
        direita: [{ id: 'azul', texto: 'Lixeira azul (papel)' }, { id: 'verm', texto: 'Lixeira vermelha (plástico)' }, { id: 'marrom', texto: 'Lixeira marrom (orgânico)' }],
        pares: { jornal: 'azul', pet: 'verm', banana: 'marrom' },
        dicas: ['A cor azul é a do papel.', 'PET é um tipo de plástico.', 'Cascas de frutas viram adubo: são lixo orgânico.'],
        explicacao: ['A coleta seletiva usa cores padronizadas: azul para papel, vermelho para plástico e marrom para resíduos orgânicos, como cascas e restos de comida.', 'Separar o lixo facilita a reciclagem e reduz o que vai parar nos aterros.'],
        reforco: 'Dica de estudo: associe cada cor a um material. Azul, papel. Vermelho, plástico. Marrom, resto de comida.',
      },
      2: {
        tag: 'meio_ambiente',
        enunciado: 'Mais materiais para separar. Ligue cada item à lixeira de cor correta.',
        esquerda: [{ id: 'vidro', texto: 'Garrafa de vidro' }, { id: 'lata', texto: 'Lata de alumínio' }, { id: 'caixa', texto: 'Caixa de papelão' }, { id: 'iogurte', texto: 'Pote de iogurte (plástico)' }],
        direita: [{ id: 'verde', texto: 'Lixeira verde (vidro)' }, { id: 'amarela', texto: 'Lixeira amarela (metal)' }, { id: 'azul', texto: 'Lixeira azul (papel)' }, { id: 'verm', texto: 'Lixeira vermelha (plástico)' }],
        pares: { vidro: 'verde', lata: 'amarela', caixa: 'azul', iogurte: 'verm' },
        dicas: ['Verde é a cor do vidro.', 'Alumínio é um metal.', 'Papelão é feito de papel.'],
        explicacao: ['O padrão de cores é: azul (papel), vermelho (plástico), verde (vidro) e amarelo (metal). O alumínio e o vidro podem ser reciclados várias vezes.', 'Reciclar economiza energia e matéria-prima, e gera renda para cooperativas de catadores.'],
        reforco: 'Dica de estudo: crie uma frase para decorar, como "Azul-papel, Verde-vidro, Amarelo-metal, Vermelho-plástico".',
      },
      3: {
        tag: 'meio_ambiente',
        enunciado: 'Classifique cada item: reciclável, orgânico ou perigoso (precisa de ponto de coleta especial). Mais de um item pode ir para o mesmo grupo.',
        esquerda: [{ id: 'pilha', texto: 'Pilha usada' }, { id: 'cafe', texto: 'Borra de café' }, { id: 'refri', texto: 'Lata de refrigerante' }, { id: 'bateria', texto: 'Bateria de celular' }, { id: 'folhas', texto: 'Folhas secas' }, { id: 'caderno', texto: 'Caderno velho' }],
        direita: [{ id: 'rec', texto: 'Reciclável' }, { id: 'org', texto: 'Orgânico' }, { id: 'per', texto: 'Perigoso' }],
        multi: true,
        pares: { pilha: 'per', cafe: 'org', refri: 'rec', bateria: 'per', folhas: 'org', caderno: 'rec' },
        dicas: ['Pilhas e baterias têm metais que contaminam o solo e a água.', 'Restos de plantas e de alimentos viram adubo na compostagem.', 'Latas e papel vão para a reciclagem.'],
        explicacao: ['Pilhas e baterias contêm metais pesados e devem ser levadas a pontos de coleta específicos, nunca ao lixo comum. Borra de café e folhas secas são orgânicos e podem virar adubo. Latas e papel são recicláveis.', 'Compostagem é o processo que transforma resíduos orgânicos em adubo natural.'],
        reforco: 'Dica de estudo: pergunte "isso veio de planta ou de comida?" (orgânico), "tem substância tóxica?" (perigoso) ou "pode virar um novo objeto?" (reciclável).',
      },
    },
  },

  /* ───────── PORTUGUÊS · catalogar (biblioteca) ───────── */
  catalogo: {
    area: 'portugues', tipo: 'classificar', titulo: 'Catálogo da biblioteca',
    tempoEsperado: { 1: 55, 2: 90, 3: 130 },
    variantes: {
      1: {
        tag: 'catalogacao',
        enunciado: 'Dona Clara separou os livros por assunto. Escolha um livro e depois a prateleira onde ele deve ficar.',
        livros: [
          { id: 'conto', texto: 'Contos e lendas da vila', prateleira: 'historias' },
          { id: 'atlas', texto: 'Atlas de mapas do Brasil', prateleira: 'mapas' },
          { id: 'plantas', texto: 'Guia de plantas e sementes', prateleira: 'ciencias' },
        ],
        prateleiras: [{ id: 'historias', nome: 'Histórias' }, { id: 'mapas', nome: 'Mapas' }, { id: 'ciencias', nome: 'Ciências' }],
        dicas: ['Observe o assunto indicado no título de cada livro.', 'Um atlas ajuda a localizar lugares.', 'Contos e lendas são narrativas; plantas pertencem às ciências naturais.'],
        explicacao: ['Um catálogo organiza livros por assunto para que qualquer pessoa encontre o que procura. Histórias, mapas e ciências são formas diferentes de conhecimento.', 'Uma biblioteca acessível não guarda apenas livros: ela ajuda a comunidade a compartilhar ideias e descobrir novos temas.'],
        reforco: 'Dica de estudo: procure as palavras-chave do título. “Atlas” fala de mapas; “plantas” é ciência; “contos” contam histórias.',
      },
      2: {
        tag: 'catalogacao',
        enunciado: 'A biblioteca recebeu mais livros. Organize cada título na prateleira do assunto correspondente.',
        livros: [
          { id: 'conto', texto: 'Contos e lendas da vila', prateleira: 'historias' },
          { id: 'teatro', texto: 'Peças de teatro para crianças', prateleira: 'historias' },
          { id: 'atlas', texto: 'Atlas de mapas do Brasil', prateleira: 'mapas' },
          { id: 'ceu', texto: 'Guia ilustrado do céu', prateleira: 'ciencias' },
          { id: 'plantas', texto: 'Guia de plantas e sementes', prateleira: 'ciencias' },
        ],
        prateleiras: [{ id: 'historias', nome: 'Histórias' }, { id: 'mapas', nome: 'Mapas' }, { id: 'ciencias', nome: 'Ciências' }],
        dicas: ['Peças de teatro contam histórias por meio de falas e cenas.', 'O céu pode ser estudado pela astronomia.', 'O atlas continua sendo o livro de mapas.'],
        explicacao: ['Os títulos podem dar pistas sobre o campo de estudo: teatro e lendas são literatura, atlas é cartografia e astronomia é ciência.', 'Livros de assuntos próximos podem compartilhar uma prateleira temática, mesmo quando seus formatos são diferentes.'],
        reforco: 'Dica de estudo: teatro e lendas são histórias; astronomia e plantas são ciências; atlas reúne mapas.',
      },
      3: {
        tag: 'catalogacao',
        enunciado: 'O último lote veio sem etiquetas. Classifique os livros pelo tema principal, não pelo formato.',
        livros: [
          { id: 'conto', texto: 'Contos e lendas da vila', prateleira: 'historias' },
          { id: 'teatro', texto: 'Peças de teatro para crianças', prateleira: 'historias' },
          { id: 'poemas', texto: 'Poemas de autores brasileiros', prateleira: 'historias' },
          { id: 'atlas', texto: 'Atlas de mapas do Brasil', prateleira: 'mapas' },
          { id: 'mapa', texto: 'Mapas e caminhos da região', prateleira: 'mapas' },
          { id: 'ceu', texto: 'Guia ilustrado do céu', prateleira: 'ciencias' },
          { id: 'plantas', texto: 'Guia de plantas e sementes', prateleira: 'ciencias' },
          { id: 'agua', texto: 'Experiências sobre a água', prateleira: 'ciencias' },
        ],
        prateleiras: [{ id: 'historias', nome: 'Histórias' }, { id: 'mapas', nome: 'Mapas' }, { id: 'ciencias', nome: 'Ciências' }],
        dicas: ['Poemas, peças e lendas são formas de literatura.', 'Um mapa da região continua sendo um recurso de cartografia.', 'Experiências com água e estudos do céu pertencem às ciências.'],
        explicacao: ['Catalogar significa agrupar por assunto para facilitar a busca. Um poema continua sendo literatura; mapas são cartografia; experiências e observações da natureza são ciências.', 'Na biblioteca reaberta, leitores diferentes poderão encontrar caminhos para novos conhecimentos.'],
        reforco: 'Dica de estudo: ignore o formato (guia, poema ou atlas) e pergunte qual assunto principal o livro ensina.',
      },
    },
  },
};
