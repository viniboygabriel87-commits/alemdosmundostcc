# PROGRESSO — ALÉM DOS MUROS (versão web)

**Versão:** 0.3.0 (Etapa 3 — primeiro incremento de conteúdo)
**Última etapa concluída:** Etapa 2; Etapa 3 iniciada
**Cena principal:** `index.html` (abrir por servidor local, ex.: `python3 -m http.server`, e acessar `http://localhost:8000`). Também publicado como artifact.
**Mudança de plataforma:** o prompt original era Godot 4.x; a pedido do usuário foi feito em web (JS puro). A divisão em etapas e os sistemas se mantêm.

## Estrutura
```
index.html            scripts em ordem de dependência
css/style.css         tema, HUD, painéis, puzzles, toque, mochila, mapa
js/core/              config (AM.Config, Bus, util, Modal, Settings), input, audio, estado (GameState + SaveSystem v2)
js/data/              personagens, mapa (+coletaveis), missoes (+melhorias), puzzles (9), dialogos, itens (itens, conhecimentos, locais, regioes, dominio), rotas (NPCs) — SÓ dados
js/gfx/sprites.js     pixel art procedural (personagens, retratos, tiles, prédios, árvores, ícones de itens)
js/systems/           adaptativo, missoes, puzzles, dialogo, inventario, conhecimento
js/world/mundo.js     mapa, colisão, câmera, interação, cutscenes, NPCs que andam, coletáveis
js/ui/                ui (HUD, pausa, config), telas (diário, mochila, mapa, conhecimentos, progresso), menu (Router + Menu)
js/main.js            laço principal, roteamento de ações, autosave
tests/                smoke.js, jogada.js (Etapa 1) · etapa2_a..f.js (NPCs, missões, telas, puzzles, migração, mobile)
```

## Sistemas prontos (Etapa 1 + 2)
**Etapa 1:** menu, jogador animado, entrada unificada (teclado/gamepad/toque, remapeamento), diálogos, missões data-driven, 4 puzzles, adaptativo inicial, melhoria visível do cenário, save/load com checksum e backup, acessibilidade, áudio sintetizado.

**Etapa 2 (novo):**
- **NPCs que andam:** rotas de ida e volta a partir da casa, pausas com olhares aleatórios, aceleração/desaceleração suaves, animação de caminhada (Beto corre), colisão com cenário, com o jogador e entre NPCs (esperam e desviam), param e olham para o jogador quando ele pode conversar, congelam em diálogo. Rotas condicionais (ex.: Gabriel espera no poço durante a missão; Beto visita o poço depois do reparo). Marcadores de objetivo seguem o NPC. NPCs podem aparecer por condição (Rafael, após os postes acesos) com fade.
- **Inventário e recursos:** 5 categorias (livros, materiais, ferramentas, equipamentos, recursos da comunidade). Livros dão pontos de conhecimento ao serem lidos; botas dão +12% de velocidade; "apoio da comunidade" é gasto em melhorias. Itens coletáveis brilham no mundo.
- **Missões:** principal, 2 secundárias (Livros para o cantinho; O poço parou) e 1 opcional (A carta do Rafael). Passos com conclusão automática por condição ("tem:madeira"), recompensas (pontos, itens, conhecimento) e consequências (melhorias, flags, mudança de diálogos).
- **Melhorias com benefício real:** escola (turma da noite: desafios na porta), postes (Rafael aparece), cantinho (leitura guiada), estante cheia (libera Matemática e Lógica), poço (moradores visitam).
- **Progressão de conhecimento por área:** domínio de 3 níveis (0/30/80 pontos), subir de nível rende apoio da comunidade.
- **Registro de conhecimentos:** 12 entradas liberadas por desafios e livros.
- **Mapa:** mapa da vila (locais descobertos ao chegar perto, objetivos e posição) e mapa do mundo (6 regiões; pistas reveladas por portas e portões).
- **Adaptativo completo:** banco de 2 desafios por área x 3 níveis; escolha por assuntos fracos (erros/dicas), não dominados e variedade; tempo é só bônus; nível manual; treino por área.
- **Save v2:** migração v1→v2, validação, fallback.

**Etapa 3 (incremento implementado):**
- **Ciclo dia/noite:** o relógio do jogo começa às 08:00 e completa um dia em 8 minutos de jogo; o HUD mostra horário e período. A luz ambiente muda gradualmente, postes e janelas acendem à noite, e o tempo para durante diálogos, desafios e menus.
- **Rotinas por horário:** Rafael circula à noite; Dona Clara aparece durante o dia depois que a missão principal termina. Ambos usam as rotas e o sistema de interação existentes.
- **Biblioteca Esquecida:** Dona Clara oferece a missão secundária “A Biblioteca Esquecida”. O jogador cataloga livros na porta usando um novo desafio de classificação com três níveis; concluir abre visualmente a porta, concede conhecimento e desbloqueia a região Biblioteca no mapa do mundo.
- **Novo registro de conhecimento:** “Como funciona um catálogo”, liberado pelo desafio da biblioteca. O progresso da região usa o campo já existente no save, sem exigir migração.
- **Objetivos integrados:** marcador da missão acompanha Dona Clara e depois a porta da biblioteca; a porta reaberta recebe iluminação noturna.

## Conteúdo pronto
- Vila Esperança com 7 NPCs (Helena, Gabriel, Lia, Beto, Seu Antônio, Rafael e Dona Clara).
- 5 missões (1 principal, 3 secundárias, 1 opcional), 6 melhorias, 10 itens, 6 coletáveis.
- 9 desafios: catálogo (classificação), cabos e feira (matemática), bilhete e história do poço (português), circuito e passos certos (lógica), energia e coleta seletiva (conhecimentos).

## Decisões de arquitetura
- Namespace global `window.AM`; scripts clássicos. Módulos se comunicam por `AM.Bus` (acao, passo, melhoria, inventario, conhecimento, dominio, missao:*).
- **Rotas de NPC** (`data/rotas.js`): lista de pontos em tiles, trechos retos por eixo, ida e volta; rota escolhida por `cond` e `prio`. Todas as rotas começam e terminam na casa do NPC.
- **Relógio de jogo**: `tempoJogo` salvo determina um ciclo de 480 segundos; horários de NPCs usam o período atual e o relógio pausa quando uma janela modal está aberta.
- **Condições** (diálogos, missões, rotas): `flag:`, `feito:`, `ativo:`, `missao_concluida:`, `missao_iniciada:`, `melhoria:`, `tem:item[:n]`, `dominio:area>=n`, `coletado:`; prefixo `!` nega.
- **Ações** de diálogo: `passo`, `missao`, `flag`, `melhoria`, `item`, `tirar`, `tirarVarios`, `conhecimento`, `pontos`, `sfx`. Nó de desafio: `puzzle: 'id'` ou `'auto:area'` (escolha adaptativa).
- Save: `{v, t, d}` com checksum FNV-1a; `VERSAO_SAVE = 2`; chaves `alem_dos_muros.save` e `.bak`. Campos novos: inventario, conhecimento, registro, coletados, descobertos, adaptativo.ultimo/fracos.
- Teclas novas: I (mochila), M (mapa); gamepad LB e Select.

## Bugs e pendências
- Posição dos NPCs não é salva (voltam para casa ao continuar).
- Só 2 desafios por área; os níveis reaproveitam a mesma mecânica.
- O desafio da biblioteca é acessado pela porta, mas ainda não existe uma sala interna caminhável; interiores da escola e das casas também ficam pendentes.
- Ainda faltam novas missões e regiões jogáveis além da Biblioteca Esquecida; as outras regiões do mapa do mundo continuam bloqueadas.
- Arrastar com ponteiro e joystick de toque testados só por emulação.
- Google Fonts precisam de internet (há fonte reserva).

## Próxima etapa
**Continuação da Etapa 3 — Expansão de conteúdo:** adicionar interiores caminháveis e novas regiões, ampliar missões e desafios por área, e testar controles de toque em dispositivos reais.
