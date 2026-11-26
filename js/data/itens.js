/* Dados da Etapa 2: itens e recursos, registro de conhecimentos, locais do mapa e regiões do mundo. Só dados, sem lógica. */
AM.Data.categorias = {
  livro: 'Livros', material: 'Materiais', ferramenta: 'Ferramentas', equipamento: 'Equipamentos', comunitario: 'Recursos da comunidade',
};

/* cat: categoria · uso: 'ler' (livro dá pontos de conhecimento na área) | 'equipar' (efeito passivo) | 'missao' (usado em missões)
   unico: só pode ter 1 · icone: forma e cor do ícone gerado por código */
AM.Data.itens = {
  livro_contos: { nome: 'Contos da Vila', cat: 'livro', area: 'portugues', uso: 'ler', unico: true, icone: { f: 'livro', c: '#d94b4b' }, desc: 'Histórias que os moradores contavam à noite, reunidas num caderno encapado.' },
  livro_atlas: { nome: 'Atlas Ilustrado', cat: 'livro', area: 'conhecimentos', uso: 'ler', unico: true, icone: { f: 'livro', c: '#4a7bb0' }, desc: 'Mapas, bandeiras e paisagens de lugares que ninguém da vila visitou ainda.' },
  livro_ciencias: { nome: 'Manual de Energia Solar', cat: 'livro', area: 'logica', uso: 'ler', unico: true, icone: { f: 'livro', c: '#f5b942' }, desc: 'Esquemas de circuitos e painéis solares, com margens cheias de anotações.' },
  livro_matematica: { nome: 'Matemática no Dia a Dia', cat: 'livro', area: 'matematica', uso: 'ler', unico: true, icone: { f: 'livro', c: '#4cc3b0' }, desc: 'Contas de feira, receitas e medidas explicadas com exemplos da vida real.' },
  madeira: { nome: 'Tábuas de madeira', cat: 'material', uso: 'missao', icone: { f: 'tabua', c: '#a8773f' }, desc: 'Tábuas firmes, boas para reforçar a estrutura do poço.' },
  parafusos: { nome: 'Parafusos', cat: 'material', uso: 'missao', icone: { f: 'parafuso', c: '#aab2bd' }, desc: 'Um punhado de parafusos de tamanhos variados.' },
  corda: { nome: 'Corda resistente', cat: 'material', uso: 'missao', icone: { f: 'corda', c: '#d9b873' }, desc: 'Corda trançada, ótima para o balde do poço.' },
  chave_inglesa: { nome: 'Chave inglesa', cat: 'ferramenta', uso: 'missao', unico: true, icone: { f: 'chave', c: '#8a919c' }, desc: 'Ferramenta do Gabriel. Necessária para consertar a bomba do poço.' },
  botas: { nome: 'Botas reforçadas', cat: 'equipamento', uso: 'equipar', unico: true, efeito: { vel: 1.12 }, icone: { f: 'bota', c: '#7a5530' }, desc: 'Feitas pelo Gabriel com sola de pneu. Você anda 12% mais rápido quando estão equipadas.' },
  apoio_comunidade: { nome: 'Apoio da comunidade', cat: 'comunitario', uso: 'missao', icone: { f: 'estrela', c: '#ef8383' }, desc: 'Vizinhos dispostos a ajudar. Melhorias maiores na vila consomem apoio.' },
};

/* Registro de conhecimentos: cada entrada é liberada por uma origem ("puzzle:id" ou "livro:id"). */
AM.Data.conhecimentos = [
  { id: 'k_circuito', area: 'logica', titulo: 'Circuito fechado', origem: 'puzzle:circuito', texto: 'Para a corrente elétrica fluir, o caminho entre a fonte e a lâmpada precisa estar completo. Uma única peça fora do lugar interrompe o circuito.' },
  { id: 'k_algoritmo', area: 'logica', titulo: 'O que é um algoritmo', origem: 'puzzle:algoritmo', texto: 'Algoritmo é uma sequência finita de passos claros para resolver um problema. Pode ter condições ("se estiver escuro...") e repetições ("volte ao primeiro passo").' },
  { id: 'k_energia', area: 'conhecimentos', titulo: 'Fontes renováveis', origem: 'puzzle:energia', texto: 'Sol, vento, água e biomassa se renovam em pouco tempo. Carvão e petróleo levam milhões de anos para se formar e, ao queimar, liberam gás carbônico.' },
  { id: 'k_reciclagem', area: 'conhecimentos', titulo: 'Coleta seletiva', origem: 'puzzle:reciclagem', texto: 'As cores das lixeiras seguem um padrão: azul (papel), vermelho (plástico), verde (vidro), amarelo (metal) e marrom (orgânico). Pilhas e baterias vão para pontos de coleta específicos.' },
  { id: 'k_cabos', area: 'matematica', titulo: 'Medidas e porcentagem', origem: 'puzzle:cabos', texto: 'Para somar medidas, converta tudo para a mesma unidade. 10% de um número é ele dividido por 10; 5% é a metade disso.' },
  { id: 'k_feira', area: 'matematica', titulo: 'Fração, decimal e porcentagem', origem: 'puzzle:feira', texto: '1/2 = 0,5 = 50%. Calcular uma porcentagem de um valor é multiplicar: 25% de 60 = 60 × 0,25 = 15.' },
  { id: 'k_bilhete', area: 'portugues', titulo: 'Estrutura do bilhete', origem: 'puzzle:bilhete', texto: 'Um bilhete tem saudação, motivo, convite (quem, o quê, quando e onde) e despedida com assinatura.' },
  { id: 'k_historia', area: 'portugues', titulo: 'Começo, meio e fim', origem: 'puzzle:historia', texto: 'Uma narrativa organiza o tempo com marcadores como "primeiro", "em seguida" e "por fim". Frases fora do assunto quebram a coerência do texto.' },
  { id: 'k_contos', area: 'portugues', titulo: 'Contar histórias', origem: 'livro:livro_contos', texto: 'Histórias de tradição oral ajudam a preservar a memória e a língua de uma comunidade e passam saberes de uma geração para outra.' },
  { id: 'k_atlas', area: 'conhecimentos', titulo: 'Ler um mapa', origem: 'livro:livro_atlas', texto: 'Um mapa usa legenda, escala e pontos cardeais. A escala diz quantas vezes o lugar real foi reduzido para caber no papel.' },
  { id: 'k_solar', area: 'logica', titulo: 'Energia do Sol', origem: 'livro:livro_ciencias', texto: 'Painéis solares transformam luz em eletricidade. Eles funcionam também em dias nublados, mas produzem menos do que sob sol forte.' },
  { id: 'k_proporcao', area: 'matematica', titulo: 'Proporção no dia a dia', origem: 'livro:livro_matematica', texto: 'Receitas, mapas e plantas usam proporção: se você dobra um ingrediente, dobre todos os outros para manter o resultado.' },
];

/* Níveis de domínio por área (pontos de conhecimento necessários). */
AM.Data.dominio = { limites: [0, 30, 80], nomes: { 1: 'Iniciante', 2: 'Intermediário', 3: 'Avançado' }, pontosLeitura: 8, pontosRepeticao: 3 };

/* Locais que o jogador descobre ao chegar perto (posições em tiles). */
AM.Data.locais = [
  { id: 'praca', nome: 'Praça da Fonte', x: 25, y: 19.5, r: 8 },
  { id: 'escola', nome: 'Escola', x: 38.5, y: 10, r: 8 },
  { id: 'oficina', nome: 'Oficina do Gabriel', x: 10, y: 11, r: 7 },
  { id: 'casa_lia', nome: 'Casa da Lia', x: 37, y: 30, r: 7 },
  { id: 'biblioteca', nome: 'Biblioteca fechada', x: 10.5, y: 30, r: 7 },
  { id: 'poco', nome: 'Poço da vila', x: 13, y: 16.5, r: 4 },
  { id: 'quadro', nome: 'Quadro de energia', x: 30, y: 10.5, r: 4 },
  { id: 'portao', nome: 'Portão do muro', x: 25, y: 4.5, r: 5 },
];

/* Regiões do mundo. "pista" é uma flag que revela uma dica sobre a região ainda não descoberta. */
AM.Data.regioes = [
  { id: 'vila', nome: 'Vila Esperança', mx: 50, my: 62, cor: '#5fae5b', desc: 'Onde tudo começa. Uma vila cercada por um muro antigo, com moradores que querem aprender.' },
  { id: 'biblioteca', nome: 'Biblioteca Esquecida', mx: 22, my: 82, cor: '#7a5fb0', pista: 'pista_biblioteca', dica: 'Fechada para reforma pela Dona Clara. Fica ao sul da vila, e há muitos livros lá dentro.' },
  { id: 'caminhos', nome: 'Escola dos Caminhos', mx: 80, my: 78, cor: '#4a7bb0', dica: 'Ninguém na vila sabe ao certo onde fica.' },
  { id: 'tecnologico', nome: 'Distrito Tecnológico', mx: 82, my: 36, cor: '#4cc3b0', dica: 'Dizem que lá as máquinas falam entre si.' },
  { id: 'jardim', nome: 'Jardim do Conhecimento', mx: 20, my: 38, cor: '#e0a24a', dica: 'Uma história antiga fala de um jardim onde as ideias florescem.' },
  { id: 'alem', nome: 'Além dos Muros', mx: 50, my: 14, cor: '#c0a8e0', pista: 'pista_portao', dica: 'O portão norte continua trancado. Do outro lado, só vento.' },
];

/* Nomes amigáveis dos assuntos (tags dos desafios) para a tela de progresso. */
AM.Data.assuntos = {
  operacoes: 'contas básicas', fracoes: 'frações e decimais', porcentagem: 'porcentagem', medidas: 'medidas',
  sequencia: 'ordem dos fatos', coerencia: 'coerência do texto', estrutura: 'estrutura de textos',
  sequencia_passos: 'sequência de passos', repeticao: 'condições e repetição', circuitos: 'circuitos',
  meio_ambiente: 'meio ambiente', energia: 'fontes de energia',
};
