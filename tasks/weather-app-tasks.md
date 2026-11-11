# Backlog de Tarefas — Weather App

Este backlog deriva de `plans/weather-app-plan.md` e rastreia os requisitos de
`specs/weather-app-spec.md`. Os caminhos são prováveis e podem ser ajustados à
estrutura existente durante a implementação. A Open-Meteo permanece candidata:
as tarefas de integração não aprovam seu uso em produção, que depende dos quatro
gates de `RF2`, `RF3` e seção 9 da spec.

Tarefas com subtarefas são agrupadoras: concluir o ID-pai significa concluir
todas as subtarefas; dependências de outras tarefas que citam o pai aguardam o
conjunto inteiro.

## Prioridade e tamanho

Prioridades indicam ordem de trabalho, não escopo: **P0** desbloqueia a primeira
fatia utilizável ou é bloqueador de release; **P1** completa e valida o MVP após
o fluxo principal; **P2** pode vir depois do fluxo principal, mas continua no
escopo e precisa ser concluído antes do aceite final. Tamanhos são relativos:
**P** é pequeno e focado, **M** envolve uma camada/domínio com integração
moderada, **G** tem várias camadas, estados concorrentes ou validação ampla. O
tamanho do ID-pai é agregado às suas subtarefas.

| Prioridade | Tarefa | Tamanho |
| --- | --- | --- |
| P0 | T-01 | M |
| P0 | T-02 | M |
| P0 | T-03 | P |
| P0 | T-04 | P |
| P0 | T-06 | M |
| P0 | T-07 | M |
| P0 | T-08 | M |
| P0 | T-09 | M |
| P0 | T-10 | G |
| P0 | T-11 | G |
| P0 | T-12 | G |
| P0 | T-12.1 | M |
| P0 | T-12.2 | M |
| P0 | T-14 | G |
| P0 | T-15 | M |
| P0 | T-16 | G |
| P0 | T-19 | P |
| P0 | T-21 | M |
| P0 | T-22 | P |
| P0 | T-23 | M |
| P0 | T-25 | M |
| P0 | T-27 | M |
| P0 | T-31 | G |
| P0 | T-32 | M |
| P1 | T-05 | P |
| P1 | T-17 | G |
| P1 | T-17.1 | M |
| P1 | T-17.2 | P |
| P1 | T-17.3 | M |
| P1 | T-18 | G |
| P1 | T-18.1 | M |
| P1 | T-18.2 | P |
| P1 | T-18.3 | P |
| P1 | T-18.4 | P |
| P1 | T-18.5 | P |
| P1 | T-20 | P |
| P1 | T-24 | G |
| P1 | T-28 | M |
| P1 | T-29 | G |
| P1 | T-30 | M |
| P2 | T-13 | G |
| P2 | T-13.1 | M |
| P2 | T-13.2 | M |
| P2 | T-26 | P |

## Entrega 1 — Base da aplicação e contratos

### T-01 — Definir os tipos de domínio e estados assíncronos

- **Rastreabilidade:** RF1–RF6; US1–US5.
- **Dependências:** nenhuma.
- **Arquivos prováveis:** `src/types/location.ts`, `src/types/weather.ts`, `src/types/preferences.ts`.
- **Critérios de aceite:**
  - Existem tipos para `Location`, condições atuais, dia da previsão, snapshot, unidade e preferências conforme os contratos do plano. (Spec: RF1–RF5; US1–US5.)
  - Estados assíncronos representam loading, sucesso, vazio, erro, parcial e indisponível sem sobrecarregar erro de validação. (Spec: RF1, RF2, RF3, RF6; US1-CA07–CA10, US2-CA08–CA09, US5-CA01–CA03.)
  - Campos que podem faltar são tipados como `null` ou indisponíveis; nenhum tipo exige inventar um valor substituto. (Spec: RF2, RF3; US2-CA04, US3-CA05.)

### T-02 — Montar o shell acessível da aplicação

- **Rastreabilidade:** RF1, RF6; US1-CA02, US5-CA01; RNF1–RNF3, RNF5.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/SourceAttribution.tsx`, `src/components/states/`, estilos existentes.
- **Critérios de aceite:**
  - A tela inicial apresenta a área de busca, um ponto de montagem para conteúdo e estados inicial/carregando/erro sem exigir localidade selecionada. (Spec: RF1, RF6; US1-CA02, US5-CA01.)
  - O rodapé global apresenta a atribuição somente com o texto e link aprovados no gate de termos; até a aprovação, o conteúdo permanece explicitamente pendente e não afirma conformidade. (Spec: RF2, seção 9, gate 1.)
  - Regiões, controles e mensagens têm semântica e nomes acessíveis; o layout não causa rolagem horizontal em 360, 768, 1024 e 1440 CSS px. (Spec: RNF1, RNF3.)

### T-03 — Implementar formatação pt-BR para valores exibidos

- **Rastreabilidade:** RF2–RF4; US2-CA02, US3-CA02; RNF5.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/format.ts`, `tests/unit/format.test.ts`.
- **Critérios de aceite:**
  - Datas e números são formatados em pt-BR sem alterar os valores de domínio. (Spec: RF2, RF3, RNF5; US2-CA02, US3-CA02.)
  - Campos ausentes podem ser apresentados como “Indisponível” sem conversão implícita para zero. (Spec: RF2, RF3; US2-CA04, US3-CA05.)
  - Testes cobrem formatos de data/número e entradas ausentes ou inválidas. (Spec: RNF5; US2-CA02, US3-CA02, US2-CA04, US3-CA05.)

## Entrega 2 — Domínio e preferências

### T-04 — Normalizar e validar consultas de cidade

- **Rastreabilidade:** RF1; US1-CA08, US1-CA09.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/query.ts`, `tests/unit/query.test.ts`.
- **Critérios de aceite:**
  - A normalização remove espaços externos, aplica NFC e reduz espaços internos consecutivos. (Spec: RF1; US1-CA09.)
  - A validação exige ao menos dois clusters Unicode e uma letra ou número; entrada inválida retorna mensagem de validação sem produzir consulta. (Spec: RF1; US1-CA08–CA09.)
  - Testes cobrem vazio, espaços, NFC, caracteres combinantes, emoji e consultas sem letras/números. (Spec: RF1; US1-CA08–CA09.)

### T-05 — Implementar conversão e arredondamento de temperatura

- **Rastreabilidade:** RF4; US4-CA01–US4-CA05.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/temperature.ts`, `tests/unit/temperature.test.ts`.
- **Critérios de aceite:**
  - A conversão parte sempre de Celsius não arredondado e implementa as fórmulas de RF4. (Spec: RF4; US4-CA02–CA03, US4-CA05.)
  - A exibição arredonda para inteiro mais próximo e empates para longe de zero, inclusive valores negativos. (Spec: RF4; US4-CA05.)
  - Testes demonstram que alternar repetidamente entre unidades não acumula erro. (Spec: RF4; US4-CA05.)

### T-06 — Calcular datas e atualidade no fuso da localidade

- **Rastreabilidade:** RF2, RF3; US2-CA02, US2-CA03, US2-CA05, US3-CA01, US3-CA04.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/lib/localDates.ts`, `src/lib/weatherCodes.ts`, `tests/unit/localDates.test.ts`.
- **Critérios de aceite:**
  - São produzidas cinco datas de calendário local a partir do fuso IANA, sem fallback ao fuso do dispositivo. (Spec: RF3; US3-CA01, US3-CA04.)
  - Fuso inválido torna a previsão indisponível; lacunas não deslocam posições. (Spec: RF3; US3-CA05.)
  - A classificação de timestamp trata como atual apenas timestamp válido, não futuro e com idade de até três horas inclusive; ausência/invalidez não é atual. (Spec: RF2; US2-CA05.)
  - Testes usam relógio controlado e cobrem virada de dia, fusos distintos, fuso inválido, limite de três horas e timestamp futuro/inválido. (Spec: RF2, RF3; US2-CA05, US3-CA04–CA05.)

### T-07 — Implementar armazenamento tolerante a falhas

- **Rastreabilidade:** RF5; US4-CA04, US5-CA05, US5-CA06, US5-CA08; RNF7.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/services/preferencesStorage.ts`, `tests/unit/preferencesStorage.test.ts`.
- **Critérios de aceite:**
  - Preferências são versionadas e validam unidade, localidade e coordenadas antes de uso. (Spec: RF5.)
  - JSON inválido, schema desconhecido, coordenadas inválidas ou exceções de acesso resultam em Celsius e sem localidade salva, sem bloquear a inicialização. (Spec: RF5; US5-CA06.)
  - Só são persistidos unidade e dados necessários para reconsultar uma localidade explicitamente selecionada; não são armazenados clima nem coordenadas de dispositivo. (Spec: RF5, RNF7; US5-CA05, US5-CA08.)
  - Testes cobrem leitura, escrita, versão incompatível e falhas do armazenamento. (Spec: RF5; US4-CA04, US5-CA05–CA06, US5-CA08.)

## Entrega 3 — Serviços de dados

### T-08 — Criar serviço de geocoding com timeout e normalização

- **Rastreabilidade:** RF1, RF6; US1-CA01, US1-CA07, US1-CA10; RNF4.
- **Dependências:** T-01, T-04.
- **Arquivos prováveis:** `src/services/geocodingService.ts`, `tests/unit/geocodingService.test.ts`.
- **Critérios de aceite:**
  - A busca usa a consulta normalizada e codificada como parâmetro de URL e limita resultados a cinco em português. (Spec: RF1; US1-CA09.)
  - Resultados são validados e mapeados para localidades, preservando divisão administrativa/país ausentes como `null` e rejeitando coordenadas inválidas. (Spec: RF1; US1-CA01, US1-CA06.)
  - Resultado vazio é distinto de erro HTTP, 429, JSON inválido, timeout e cancelamento; a tentativa expira em oito segundos. (Spec: RF1, RF6, RNF4; US1-CA07, US1-CA10.)
  - Testes usam `fetch` controlado e cobrem sucesso, vazio, resposta inválida, erro, timeout e cancelamento. (Spec: RF1, RF6; US1-CA07, US1-CA10–CA11.)

### T-09 — Criar serviço de clima atual

- **Rastreabilidade:** RF2, RF6; US2-CA01, US2-CA03–US2-CA06, US2-CA09; US5-CA02, US5-CA09.
- **Dependências:** T-01, T-06.
- **Arquivos prováveis:** `src/services/weatherService.ts`, `src/types/weather.ts`, `tests/unit/weatherService.test.ts`.
- **Critérios de aceite:**
  - A consulta atual solicita condição, temperatura, sensação térmica e mínimas/máximas do dia local, com Celsius e fuso automático explicitados. (Spec: RF2; US2-CA01–CA03; seção 9, gate 2.)
  - Resposta é validada e normalizada para Celsius; campos ausentes permanecem indisponíveis e origem não declarada é `unclassified`. (Spec: RF2, RF4; US2-CA04, US2-CA06.)
  - Erros HTTP/429, JSON inválido, timeout e cancelamento são distinguíveis de resposta parcial. (Spec: RF2, RF6; US2-CA09, US5-CA02, US5-CA09.)
  - Testes verificam parâmetros, unidades, metadados, campos parciais e falhas. A semântica final dos campos fica sujeita ao gate de contrato dos dados atuais. (Spec: RF2; US2-CA01–CA06, US2-CA09; seção 9, gate 2.)

### T-10 — Criar serviço de previsão diária de cinco posições

- **Rastreabilidade:** RF3, RF6; US3-CA01–US3-CA06, US5-CA02, US5-CA09.
- **Dependências:** T-01, T-06.
- **Arquivos prováveis:** `src/services/weatherService.ts`, `src/lib/localDates.ts`, `tests/unit/forecastService.test.ts`.
- **Critérios de aceite:**
  - A previsão contém exatamente hoje e os quatro dias locais seguintes, preservando posição sem dados. (Spec: RF3; US3-CA01, US3-CA05.)
  - Condição, temperaturas, precipitação, probabilidade, umidade e vento são mapeados com unidades especificadas; umidade horária usa a média dos valores disponíveis quando necessária. (Spec: RF3; US3-CA02–CA03; seção 9, gate 3.)
  - Ausência de fuso válido torna a seção indisponível; nenhum valor de outra data é deslocado para preencher lacunas. (Spec: RF3; US3-CA04–CA05.)
  - Testes cobrem cinco posições, agregações, campos ausentes, datas faltantes, fuso inválido e falhas. A equivalência semântica dos agregados depende do gate de previsão. (Spec: RF3, RF6; US3-CA01–CA05; seção 9, gate 3.)

## Entrega 4 — Orquestração, localização e seleção

### T-11 — Orquestrar inicialização, preferências e localização

- **Rastreabilidade:** RF1, RF5; US1-CA02–US1-CA04, US1-CA14, US5-CA05, US5-CA06, US5-CA08.
- **Dependências:** T-07, T-09, T-10.
- **Arquivos prováveis:** `src/hooks/useGeolocation.ts`, `src/hooks/useWeatherApp.ts`, `tests/unit/useWeatherApp.test.tsx`.
- **Critérios de aceite:**
  - Na abertura, unidade e cidade explícita são lidas de forma tolerante a falhas; a geolocalização solicita permissão conforme estado disponível e termina em oito segundos. (Spec: RF1, RF5, RNF4; US1-CA02–CA04, US5-CA05–CA06.)
  - Localização válida obtida a tempo prevalece sobre a cidade salva e não é persistida como cidade explícita. (Spec: RF1, RF5, RNF7; US1-CA03, US5-CA05, US5-CA08.)
  - Em negação, indisponibilidade ou timeout, restaura-se a cidade salva válida; sem ela, a aplicação permanece pronta para busca e capitais. (Spec: RF1, RF5; US1-CA04, US1-CA13, US5-CA05.)
  - Resposta tardia ou posterior a uma seleção concorrente é ignorada; testes cobrem precedência, timeout, erro e ausência de persistência de coordenadas do dispositivo. (Spec: RF1, RF5, RF6; US1-CA14, US5-CA08.)

### T-12 — Implementar busca concorrente e seleção explícita

- **Rastreabilidade:** RF1, RF5, RF6; US1-CA01, US1-CA06–US1-CA12, US5-CA08.
- **Dependências externas:** T-04, T-07, T-08, T-11.

#### T-12.1 — Orquestrar busca e seleção no hook

- **Dependências:** T-04, T-07, T-08, T-11.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Critérios de aceite:**
  - Consulta inválida não chama geocoding; estados de vazio, erro e carregamento permanecem distintos no estado da aplicação. (Spec: RF1, RF6; US1-CA07–CA10, US5-CA01–CA03.)
  - Somente a busca mais recente pode publicar resultado, erro ou timeout. (Spec: RF1, RF6; US1-CA11.)
  - Selecionar resultado define a localidade ativa e persiste somente a cidade explicitamente selecionada; resultado tardio não altera estado nem armazenamento. (Spec: RF1, RF5, RF6; US1-CA06, US1-CA11, US5-CA08.)

#### T-12.2 — Construir a interface de busca e resultados

- **Dependências:** T-12.1.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`, `src/components/SearchResults.tsx`.
- **Critérios de aceite:**
  - O campo apresenta orientação de validação e estados de carregamento, vazio e erro sem confundi-los. (Spec: RF1, RF6; US1-CA07–CA10, US5-CA01–CA03.)
  - Resultados exibem informações geográficas disponíveis, têm nomes acessíveis e podem ser selecionados por teclado. (Spec: RF1, RNF3; US1-CA01, US1-CA06, US1-CA12.)

### T-13 — Implementar lista fixa de capitais e carregamento isolado

- **Rastreabilidade:** RF1, RF6; US1-CA04, US1-CA05, US1-CA13.
- **Dependências externas:** T-01, T-09, T-11.

#### T-13.1 — Orquestrar consultas isoladas para as capitais

- **Dependências:** T-01, T-09, T-11.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Critérios de aceite:**
  - O estado mantém dados e tentativas independentes para cada capital, com timeout de oito segundos por cartão. (Spec: RF1, RF6, RNF4; US1-CA13.)
  - Falha ou timeout de uma consulta não afeta os dados nem o estado das demais capitais. (Spec: RF1, RF6; US1-CA13.)
  - O estado não fornece condição ou temperatura fictícia quando não há resposta real. (Spec: RF1; US1-CA13.)

#### T-13.2 — Construir lista e cartões de capitais

- **Dependências:** T-13.1.
- **Arquivos prováveis:** `src/components/CapitalList.tsx`, `src/components/CapitalWeatherCard.tsx`.
- **Critérios de aceite:**
  - As dez capitais aparecem imediatamente e na ordem especificada, sem aguardar respostas meteorológicas. (Spec: RF1; US1-CA04, US1-CA13.)
  - Cada cartão apresenta seu estado independente e selecioná-lo inicia a consulta/previsão daquela cidade. (Spec: RF1; US1-CA05, US1-CA13.)
  - Condição e temperatura só aparecem após resposta real; sem resposta, o cartão identifica indisponibilidade. (Spec: RF1; US1-CA13.)

## Entrega 5 — Clima selecionado, previsão e recuperação

### T-14 — Coordenar consultas independentes de clima e previsão

- **Rastreabilidade:** RF2, RF3, RF6; US2-CA01, US2-CA08, US2-CA09, US3-CA01–US3-CA05, US5-CA01, US5-CA02.
- **Dependências:** T-09, T-10, T-11.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`, `src/services/weatherService.ts`, `tests/unit/useWeatherApp.test.tsx`.
- **Critérios de aceite:**
  - Selecionar uma localidade dispara clima atual e previsão em paralelo com prazo comum de oito segundos contado da seleção. (Spec: RF2, RF3, RF6, RNF4; US2-CA08, US3-CA01, US5-CA01–CA02.)
  - As seções mantêm status, tentativa e instante de recebimento independentes; sucesso de uma seção permanece visível se a outra falhar. (Spec: RF2, RF3, RF6; US2-CA09, US5-CA02.)
  - Snapshot e respostas são associados ao ID da localidade; dados anteriores só podem permanecer para a mesma localidade e são identificados como anteriores. (Spec: RF2, RF6; US2-CA07, US5-CA04.)
  - Nova seleção invalida tentativas anteriores; respostas, erros e timeouts obsoletos não alteram estado nem armazenamento. (Spec: RF1, RF2, RF6; US1-CA11, US1-CA14, US5-CA08.)
  - Testes cobrem conclusão fora de ordem, falha parcial, timeout comum e isolamento entre localidades. (Spec: RF2, RF3, RF6; US2-CA07, US2-CA09, US5-CA02, US5-CA04.)

### T-15 — Exibir clima atual com atualidade e dados parciais

- **Rastreabilidade:** RF2, RF6; US2-CA01–US2-CA09, US5-CA04.
- **Dependências:** T-03, T-06, T-14.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/states/`, `tests/unit/CurrentWeather.test.tsx`.
- **Critérios de aceite:**
  - A seção apresenta localidade, condição e cada temperatura disponível com unidade; ausências aparecem individualmente como “Indisponível”. (Spec: RF2; US2-CA01, US2-CA04.)
  - Horário de origem é formatado no fuso da cidade; sem timestamp ou fuso válido, o dado não é rotulado como atual. (Spec: RF2; US2-CA02–CA03, US2-CA05.)
  - Idade de até três horas pode ser “Atual”; idade maior é “Desatualizado”; classificação de origem só mostra “Estimativa” quando declarada e nunca presume “Observado”. (Spec: RF2; US2-CA05–CA06.)
  - Resposta parcial mantém campos válidos e anuncia estado parcial; loading, erro, indisponibilidade e retry são acessíveis. (Spec: RF2, RF6, RNF3; US2-CA08–CA09, US5-CA02, US5-CA07.)

### T-16 — Exibir previsão diária de cinco dias

- **Rastreabilidade:** RF3, RF6; US3-CA01–US3-CA06.
- **Dependências:** T-03, T-05, T-14.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`, `src/components/ForecastDay.tsx`, `tests/unit/ForecastList.test.tsx`.
- **Critérios de aceite:**
  - São renderizadas exatamente cinco posições, identificadas por datas locais da cidade. (Spec: RF3; US3-CA01, US3-CA04.)
  - Cada posição apresenta condição e campos disponíveis com unidades corretas; campos ou dias ausentes permanecem visíveis como indisponíveis. (Spec: RF3; US3-CA02, US3-CA05.)
  - Não há apresentação de previsão horária nem deslocamento de valores entre datas. (Spec: RF3; US3-CA05–CA06.)
  - Testes verificam cinco posições, dados parciais, data sem registro, unidades e ausência de conteúdo horário. (Spec: RF3, RF6; US3-CA01–CA06.)

### T-17 — Implementar retry manual e dados anteriores

- **Rastreabilidade:** RF1, RF2, RF3, RF6; US1-CA10, US5-CA02, US5-CA04, US5-CA07, US5-CA09.
- **Dependências externas:** T-12, T-14, T-15, T-16.

#### T-17.1 — Orquestrar retry e retenção de dados anteriores

- **Dependências:** T-12.1, T-14.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Critérios de aceite:**
  - O estado permite repetir manualmente a mesma busca ou consulta meteorológica e não inicia retry automático ilimitado para HTTP 429 ou indisponibilidade. (Spec: RF1, RF2, RF3, RF6; US1-CA10, US5-CA02, US5-CA09.)
  - Dados anteriores são mantidos somente para a mesma localidade, com o instante de recebimento; dados de outra localidade são descartados. (Spec: RF2, RF6; US2-CA07, US5-CA04.)

#### T-17.2 — Exibir recuperação de erros da busca

- **Dependências:** T-12.2, T-17.1.
- **Arquivos prováveis:** `src/components/SearchBar.tsx`, `src/components/SearchResults.tsx`.
- **Critérios de aceite:**
  - Erro/timeout de busca informa a falha e oferece ação acessível para repetir a mesma consulta. (Spec: RF1, RF6, RNF3; US1-CA10, US5-CA02, US5-CA07.)

#### T-17.3 — Exibir recuperação de erros meteorológicos

- **Dependências:** T-15, T-16, T-17.1.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/ForecastList.tsx`.
- **Critérios de aceite:**
  - Falha/timeout meteorológico oferece retry para a mesma localidade; dados anteriores da mesma cidade são identificados com seu horário e estados de erro são anunciáveis e acessíveis por teclado. (Spec: RF2, RF3, RF6, RNF3; US2-CA07, US5-CA02, US5-CA04, US5-CA07.)

## Entrega 6 — Unidade e persistência integrada

### T-18 — Aplicar seletor de unidade a todos os valores

- **Rastreabilidade:** RF4, RF5; US4-CA01–US4-CA05.
- **Dependências externas:** T-05, T-07, T-13, T-15, T-16.

#### T-18.1 — Persistir e expor unidade no estado da aplicação

- **Dependências:** T-05, T-07.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Critérios de aceite:**
  - Celsius é usado sem preferência salva e a alteração de unidade persiste/restaura a preferência. (Spec: RF4, RF5; US4-CA01, US4-CA04.)
  - Alterar unidade não inicia uma consulta meteorológica; os valores de domínio permanecem em Celsius sem arredondamento acumulado. (Spec: RF4; US4-CA02–CA05.)

#### T-18.2 — Construir o controle acessível de unidade

- **Dependências:** T-18.1.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Critérios de aceite:**
  - O controle permite alternar Celsius/Fahrenheit e reflete a unidade ativa. (Spec: RF4; US4-CA01–CA03.)
  - O controle é operável por teclado e tem nome acessível. (Spec: RNF3; US5-CA07.)

#### T-18.3 — Aplicar unidade às temperaturas dos cartões

- **Dependências:** T-13.2, T-18.1.
- **Arquivos prováveis:** `src/components/CapitalWeatherCard.tsx`.
- **Critérios de aceite:**
  - Temperaturas disponíveis nos cartões são convertidas a partir de Celsius não arredondado e exibidas com o sufixo da unidade ativa. (Spec: RF4; US4-CA02–CA05.)

#### T-18.4 — Aplicar unidade ao clima atual

- **Dependências:** T-15, T-18.1.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Critérios de aceite:**
  - Todas as temperaturas disponíveis do clima atual são convertidas a partir de Celsius não arredondado e exibidas com o sufixo da unidade ativa. (Spec: RF4; US4-CA02–CA05.)

#### T-18.5 — Aplicar unidade à previsão diária

- **Dependências:** T-16, T-18.1.
- **Arquivos prováveis:** `src/components/ForecastDay.tsx`.
- **Critérios de aceite:**
  - As temperaturas disponíveis da previsão são convertidas a partir de Celsius não arredondado e exibidas com o sufixo da unidade ativa. (Spec: RF4; US4-CA02–CA05.)

## Entrega 7 — Testes integrados, acessibilidade e hardening

### T-19 — Testar normalização e validação de consultas

- **Rastreabilidade:** RF1; US1-CA08, US1-CA09.
- **Dependências:** T-04.
- **Arquivos prováveis:** `tests/unit/query.test.ts`.
- **Critérios de aceite:**
  - Testes cobrem vazio, espaços, NFC, caracteres combinantes, emoji e consultas sem letras/números. (Spec: RF1; US1-CA08–CA09.)
  - Consulta inválida não produz texto pronto para envio; consulta válida cumpre normalização e limite de clusters Unicode. (Spec: RF1; US1-CA08–CA09.)
  - A suíte passa isoladamente e não faz requisições de rede. (Spec: RF1; US1-CA09.)

### T-20 — Testar conversão, arredondamento e formatos numéricos

- **Rastreabilidade:** RF4; US4-CA01–US4-CA05; RNF5.
- **Dependências:** T-03, T-05.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`, `tests/unit/format.test.ts`.
- **Critérios de aceite:**
  - Testes verificam conversão C/F, empates para longe de zero e alternância repetida sem acumular erro. (Spec: RF4; US4-CA01–CA05.)
  - Formatos numéricos seguem pt-BR e valores ausentes não viram zero. (Spec: RF2–RF4, RNF5; US2-CA04, US3-CA02, US4-CA02–CA05.)
  - A suíte passa isoladamente e não faz requisições de rede. (Spec: RF4; US4-CA05.)

### T-21 — Testar datas locais, atualidade e códigos meteorológicos

- **Rastreabilidade:** RF2, RF3; US2-CA02–US2-CA06, US3-CA01, US3-CA03–US3-CA05.
- **Dependências:** T-06.
- **Arquivos prováveis:** `tests/unit/localDates.test.ts`, `tests/unit/weatherCodes.test.ts`.
- **Critérios de aceite:**
  - Relógio controlado cobre limite de três horas, timestamp futuro/inválido, fusos diferentes, fuso inválido e virada de dia. (Spec: RF2, RF3; US2-CA03–CA05, US3-CA04–CA05.)
  - Mapeamento de códigos conhecidos e desconhecidos não inventa condição para valor ausente ou não reconhecido. (Spec: RF2, RF3; US2-CA04, US3-CA02, US3-CA05.)
  - A suíte passa isoladamente e não faz requisições de rede. (Spec: RF2, RF3; US2-CA05, US3-CA04–CA05.)

### T-22 — Testar o adaptador de geocoding

- **Rastreabilidade:** RF1, RF6; US1-CA01, US1-CA07, US1-CA10; RNF4.
- **Dependências:** T-08.
- **Arquivos prováveis:** `tests/unit/geocodingService.test.ts`.
- **Critérios de aceite:**
  - `fetch` controlado verifica parâmetros, limite/idioma, mapeamento e lista vazia. (Spec: RF1; US1-CA01, US1-CA07, US1-CA09.)
  - Erros HTTP/429, JSON inválido, coordenadas inválidas, timeout e cancelamento são testados sem rede real. (Spec: RF1, RF6, RNF4; US1-CA10–CA11.)
  - A suíte passa isoladamente. (Spec: RF1, RF6; US1-CA07, US1-CA10–CA11.)

### T-23 — Testar os adaptadores de clima atual e previsão

- **Rastreabilidade:** RF2, RF3, RF6; US2-CA09, US3-CA01–US3-CA05, US5-CA02, US5-CA09.
- **Dependências:** T-09, T-10.
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`, `tests/unit/forecastService.test.ts`.
- **Critérios de aceite:**
  - `fetch` controlado verifica parâmetros, unidades e mapeamento de respostas completas/parciais. (Spec: RF2, RF3; US2-CA01–CA04, US3-CA02–CA03.)
  - Erro HTTP/429, JSON inválido, timeout e cancelamento são testados sem depender da rede real. (Spec: RF2, RF3, RF6; US2-CA09, US3-CA05, US5-CA02, US5-CA09.)
  - Lacunas preservam cinco posições e campos ausentes não viram valores inventados. (Spec: RF2, RF3; US2-CA04, US3-CA01, US3-CA05.)

### T-24 — Testar orquestração, concorrência e persistência de estado

- **Rastreabilidade:** RF1, RF2, RF5, RF6; US1-CA03, US1-CA04, US1-CA11, US1-CA13, US1-CA14, US2-CA07, US5-CA04–US5-CA06, US5-CA08.
- **Dependências:** T-11–T-14, T-17, T-18.
- **Arquivos prováveis:** `tests/unit/useGeolocation.test.ts`, `tests/unit/useWeatherApp.test.tsx`.
- **Critérios de aceite:**
  - Testes cobrem precedência entre localização e cidade salva, timeout e descarte de geolocalização tardia. (Spec: RF1, RF5, RNF4; US1-CA03–CA04, US1-CA14, US5-CA05.)
  - Buscas e seleções fora de ordem não publicam resultados, erros ou timeouts obsoletos nem alteram a cidade salva. (Spec: RF1, RF5, RF6; US1-CA11, US1-CA14, US5-CA08.)
  - Clima atual e previsão mantêm estados independentes; dados anteriores só permanecem para a mesma localidade. (Spec: RF2, RF3, RF6; US2-CA07, US2-CA09, US5-CA04.)
  - A falha de um cartão de capital não afeta os demais e a unidade não dispara nova consulta. (Spec: RF1, RF4; US1-CA13, US4-CA02–CA03.)

### T-25 — Testar busca e resultados

- **Rastreabilidade:** RF1, RF6; US1-CA01, US1-CA06–US1-CA08, US1-CA12.
- **Dependências:** T-12.
- **Arquivos prováveis:** `tests/unit/SearchBar.test.tsx`, `tests/unit/SearchResults.test.tsx`.
- **Critérios de aceite:**
  - Testing Library verifica validação inline, estados de busca, desambiguação e seleção por teclado. (Spec: RF1, RF6; US1-CA01, US1-CA06–CA11.)
  - Nomes acessíveis identificam controles e resultados sem exigir interação por mouse. (Spec: RF1, RNF3; US1-CA12.)
  - A suíte passa isoladamente. (Spec: RF1, RF6; US1-CA08, US1-CA12.)

### T-26 — Testar cartões de capitais

- **Rastreabilidade:** RF1, RF6; US1-CA04, US1-CA05, US1-CA13.
- **Dependências:** T-13.
- **Arquivos prováveis:** `tests/unit/CapitalList.test.tsx`.
- **Critérios de aceite:**
  - Os dez cards são apresentados na ordem especificada e sem depender de respostas meteorológicas. (Spec: RF1; US1-CA04, US1-CA13.)
  - Estados de loading/indisponível e seleção de cartão são verificáveis; falha individual não oculta outros cards. (Spec: RF1, RF6, RNF4; US1-CA05, US1-CA13.)
  - Nenhum dado meteorológico é exibido antes de uma resposta real. (Spec: RF1; US1-CA13.)

### T-27 — Testar apresentação do clima atual e da previsão

- **Rastreabilidade:** RF2, RF3, RF6; US2-CA01–US2-CA06, US2-CA08, US2-CA09, US3-CA01–US3-CA06.
- **Dependências:** T-14–T-16.
- **Arquivos prováveis:** `tests/unit/CurrentWeather.test.tsx`, `tests/unit/ForecastList.test.tsx`.
- **Critérios de aceite:**
  - A seção atual cobre loading, parcial, campos indisponíveis, horário/fuso, idade e origem sem afirmar atualidade ou observação indevidas. (Spec: RF2, RF6; US2-CA01–CA09.)
  - A previsão apresenta cinco datas locais, unidades corretas e campos/dias indisponíveis sem deslocar valores. (Spec: RF3; US3-CA01–CA05.)
  - Testes confirmam que não há previsão horária e que falha de uma seção não oculta a outra. (Spec: RF2, RF3, RF6; US2-CA09, US3-CA06.)

### T-28 — Testar unidade e recuperação de erros

- **Rastreabilidade:** RF4–RF6; US4-CA01–US4-CA05, US5-CA01–US5-CA04, US5-CA07, US5-CA09.
- **Dependências:** T-17, T-18.
- **Arquivos prováveis:** `tests/unit/UnitToggle.test.tsx`, `tests/unit/states.test.tsx`.
- **Critérios de aceite:**
  - A alternância reflete-se em temperaturas atuais, diárias e dos cartões, inclusive durante loading e resposta parcial. (Spec: RF4, RF6; US4-CA02–CA03, US5-CA01.)
  - Estados de erro e retry informam recuperação, são operáveis por teclado e não iniciam repetição automática ilimitada para 429. (Spec: RF6, RNF3; US5-CA02, US5-CA07, US5-CA09.)
  - Dados anteriores são identificados com o horário correto e não aparecem associados a outra cidade. (Spec: RF2, RF6; US2-CA07, US5-CA04.)

### T-29 — Validar fluxos ponta a ponta e viewports

- **Rastreabilidade:** RF1–RF6; US1–US5; RNF1, RNF2, RNF4–RNF7.
- **Dependências:** T-19–T-28.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`.
- **Critérios de aceite:**
  - Playwright cobre busca, desambiguação, seleção, localização concedida/negada e fallback, capitais, clima/previsão, unidade persistida, erro/retry e descarte de resposta obsoleta. (Spec: RF1–RF6; US1–US5; RNF4, RNF6–RNF7.)
  - Endpoints são interceptados com respostas determinísticas, incluindo parcial, 429, timeout e conclusão fora de ordem. (Spec: RF1, RF2, RF3, RF6; US1-CA10–CA11, US2-CA09, US5-CA02, US5-CA09.)
  - Fluxos principais são verificados em 360, 768, 1024 e 1440 CSS px e larguras intermediárias relevantes, sem rolagem horizontal. (Spec: RNF1.)
  - Suíte executa em Chromium, Firefox e WebKit na CI. (Spec: RNF2.)

### T-30 — Verificar acessibilidade automatizada e manual

- **Rastreabilidade:** RF1, RF6; US1-CA12, US5-CA07; RNF2, RNF3, RNF5.
- **Dependências:** T-29.
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`, `package.json`, `pnpm-lock.yaml`.
- **Critérios de aceite:**
  - `@axe-core/playwright` verifica WCAG 2.2 AA nas telas inicial, carregada e erro/parcial. (Spec: RNF3; US1-CA12, US5-CA07.)
  - Verificações cobrem navegação por teclado, ordem e visibilidade de foco, anúncios assíncronos, contraste e `prefers-reduced-motion`. (Spec: RNF3.)
  - Busca, seleção, alternância de unidade e retry são exercitáveis sem mouse; eventuais limitações são registradas como bloqueios de aceite. (Spec: RNF3; US1-CA12, US5-CA07.)

**Situação:** implementação parcial; aceite bloqueado pela T-29, pelos fluxos
ainda ausentes e pelas validações de navegador/manual pendentes. Cobertura,
evidências e roteiro manual em [Auditoria de acessibilidade](../docs/accessibility-audit.md).

### T-31 — Executar gates da fonte e smoke test da matriz de release

- **Rastreabilidade:** RF2, RF3; RNF2, RNF4, RNF6; gates 1–4 da seção 9 da spec.
- **Dependências:** T-08–T-10, T-13, T-29, T-30.
- **Arquivos prováveis:** `docs/source-validation.md`, documentação operacional de release.
- **Critérios de aceite:**
  - São documentadas aprovação de termos/atribuição, contrato dos dados atuais, contrato/semântica da previsão e limites operacionais/compatibilidade com prazos. (Spec: RF2, RF3; seção 9, gates 1–4.)
  - Gate reprovado ou pendente bloqueia declaração de conformidade e publicação com Open-Meteo; registra-se decisão de provedor revisada quando necessário. (Spec: RF2, RF3; seção 9, gates 1–4.)
  - Smoke test registra versões e cobre busca, seleção, consulta, erro/retry e unidade nas versões atuais/anterior de Chrome, Edge, Firefox e Safari desktop, além de Chrome para Android e Safari para iOS suportados. (Spec: RF1–RF6; RNF2, RNF4, RNF6.)

### T-32 — Rodar os gates de qualidade do repositório

- **Rastreabilidade:** RNF1–RNF5; critério de entrega de código.
- **Dependências:** T-19–T-30.
- **Arquivos prováveis:** `package.json`, arquivos alterados em `src/` e `tests/`.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build` e `pnpm test` concluem sem falhas relacionadas à entrega. (Spec: RNF1–RNF5; validação dos fluxos US1–US5.)
  - Erros encontrados são corrigidos ou documentados como bloqueio; a evidência do resultado fica disponível para revisão. (Spec: RNF1–RNF7; validação dos fluxos US1–US5.)

## Ordem de execução

As tarefas devem ser executadas na ordem dos IDs, respeitando as dependências
indicadas. T-31 é um gate de release, não uma aprovação presumida pelo sucesso
dos testes; T-32 é o gate final de qualidade da implementação.

## Sequência em fatias verticais

O caminho mais curto para valor visível é permitir uma busca real e mostrar
condições atuais antes de completar toda a experiência semanal. A preparação
técnica abaixo respeita as dependências atuais; o clima atual e a previsão são
consultados em paralelo, mas suas seções podem ser apresentadas
independentemente.

1. **Preparar contratos e acesso a dados:** T-01, T-03, T-04, T-06–T-11. Iniciar
  também a investigação dos gates externos de T-31 em paralelo, sobretudo
  termos, campos e limites; não tratar a Open-Meteo como aprovada enquanto os
  gates estiverem pendentes.
2. **Busca → cidade selecionada → clima atual visível:** T-02, T-12.1, T-12.2,
  T-14 e T-15. Entrega demonstrável: pesquisar uma cidade, selecioná-la e
  exibir as condições atuais reais, com carregamento e falha parcial
  identificáveis. Verificações focadas: T-19, T-21–T-23 e T-25.
3. **Completar o planejamento de cinco dias:** T-16 e T-27. A seção de clima
  atual da fatia anterior pode continuar visível enquanto a previsão carrega;
  esta fatia acrescenta as cinco datas locais e seus campos disponíveis.
4. **Recuperação e unidade:** T-05, T-17.1–T-17.3, T-18.1–T-18.2,
  T-18.4–T-18.5, T-20 e T-28. Entrega: retry manual e alternância Celsius /
  Fahrenheit no clima atual e na previsão. T-18 só fica concluída após sua
  integração com os cartões da fatia seguinte.
5. **Capitais e integração de estado:** T-13.1, T-13.2, T-18.3, T-24 e T-26.
  Entrega: lista fixa com dados meteorológicos carregados independentemente e
  seleção de capital; completa também a conversão de temperatura nesses
  cartões e a cobertura de concorrência/persistência integrada.
6. **Validar release:** T-29, T-30, conclusão dos gates em T-31 e T-32. Os gates
  externos devem ser investigados desde a primeira fatia; aprovação pendente ou
  reprovada bloqueia publicação com a fonte candidata.

Ao fim de cada fatia de código, executar os gates aplicáveis de lint, build e
testes, sem esperar a fatia final para descobrir regressões.