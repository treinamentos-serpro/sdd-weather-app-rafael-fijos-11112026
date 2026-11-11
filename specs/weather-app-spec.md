# Especificação de Produto — Weather App

**Status:** requisitos de produto definidos para o MVP. A Open-Meteo é a fonte candidata; o uso em produção depende dos gates de validação da seção 9.

## 1. Overview

O Weather App permite consultar uma localidade detectada pelo dispositivo ou pesquisar uma cidade, e ver seu clima atual e a previsão diária de cinco dias, com temperaturas em Celsius ou Fahrenheit. O MVP prioriza o planejamento semanal e também atende à consulta para deslocamento diário e à consulta pontual de destinos.

O produto será uma experiência web responsiva para mobile e desktop, em português do Brasil. A consulta depende de conexão com a internet. O escopo não inclui conta de usuário. A aplicação solicita acesso à localização ao abrir; a localização só é usada após concessão da permissão.

## 2. Functional Requirements

### RF1 — Buscar e selecionar uma cidade

- O usuário deve poder pesquisar uma cidade pelo nome e selecionar explicitamente um resultado. Antes do envio, remover espaços externos, normalizar Unicode para NFC e reduzir sequências de espaços internos a um espaço. Não enviar consulta vazia.
- Uma consulta com menos de dois caracteres Unicode após a normalização (percebidos pelo usuário), ou sem ao menos uma letra ou número, é inválida e não deve ser enviada. A interface deve orientar a correção sem apresentá-la como busca sem resultados ou erro do serviço.
- Cada resultado deve apresentar cidade, divisão administrativa e país quando esses dados estiverem disponíveis, para diferenciar localidades homônimas.
- A busca deve distinguir consulta sem correspondência de falha do serviço e permitir que o usuário corrija a consulta ou tente novamente.
- Se uma nova consulta for iniciada antes de a anterior terminar, resultados e erros da consulta anterior devem ser descartados; somente resultados da consulta mais recente podem ser exibidos ou selecionados.
- Ao abrir a aplicação, solicitar a localização do dispositivo. Se a permissão já estiver concedida, tentar obter as coordenadas sem nova solicitação; se estiver negada, não repetir o pedido automaticamente. Se concedida, consultar as coordenadas detectadas e identificar a localidade como “Minha localização”.
- A tentativa de localização termina após oito segundos. Se for negada, indisponível ou exceder o prazo, restaurar a última cidade explicitamente selecionada e salva, se válida. Caso contrário, apresentar busca e a lista fixa nesta ordem: Tóquio, Nova Délhi, Seul, Daca, Cairo, Cidade do México, Pequim, Kinshasa, Buenos Aires e Manila. A composição não depende de busca nem de atualização de ranking.
- A lista de capitais é fixa, mas os dados meteorológicos não são mockados: condição e temperatura só podem ser mostradas após resposta real da fonte. A lista aparece sem aguardar essas respostas; cada cidade é atualizada independentemente e, após oito segundos sem resposta, seus dados são marcados como indisponíveis. Falha de um card não oculta as demais cidades. Selecionar um card consulta a previsão de cinco dias da cidade correspondente.
- A busca manual por cidade permanece disponível independentemente da permissão de localização.

### RF2 — Consultar o clima atual

- Para a localidade selecionada, exibir condição meteorológica, temperatura, sensação térmica e mínima/máxima do dia local, cada qual com unidade e valor próprios quando disponíveis. Campo ausente deve aparecer como “Indisponível”; não substituir por zero, estimativa própria ou dado de outro campo.
- Exibir nome da localidade e horário da condição atual no fuso horário da localidade. O horário deve ser derivado do timestamp da fonte e de seu fuso; não usar o fuso do dispositivo como substituto. Sem timestamp ou fuso válido, não apresentar o dado como atual e identificar a informação temporal como indisponível.
- A idade do dado é calculada em relação ao instante de recebimento da resposta. Timestamp futuro ou inválido não pode ser tratado como atual. Timestamp com idade de até três horas, inclusive, pode ser apresentado como atual; acima de três horas, identificar como desatualizado e mostrar o horário da fonte.
- Identificar dados originados de modelo como “Estimativa”. Só identificar uma condição como observação se a fonte declarar explicitamente que se trata de observação; ausência dessa declaração nunca autoriza o rótulo “Observado”.
- Dados ausentes devem ser identificados campo a campo. Uma resposta parcial deve exibir os campos válidos junto de um aviso de dados parciais, sem ser apresentada como completa.
- A Open-Meteo só pode ser usada se seus termos permitirem o uso previsto no MVP. A atribuição exigida deve aparecer no rodapé global, no formato necessário para cumprir os termos.

### RF3 — Consultar a previsão diária

- A previsão deve conter exatamente cinco posições, para a data local de hoje e os quatro dias locais seguintes. Determinar as datas pelo fuso IANA da localidade, nunca pelo fuso do dispositivo. Reservar a posição mesmo quando não houver dados para a data.
- Se não houver fuso IANA válido para a localidade, não derivar datas pelo fuso do dispositivo; manter a seção de previsão como indisponível e permitir nova tentativa, sem deslocar datas.
- Cada posição deve apresentar condição meteorológica, mínima/máxima, precipitação acumulada diária, probabilidade máxima de precipitação no dia, umidade relativa média diária e velocidade máxima do vento no dia, quando fornecidas pela fonte. A probabilidade máxima é o maior valor do dia; a umidade média é a média dos valores disponíveis no dia; a velocidade máxima é o maior valor do dia. Usar agregados diários da fonte quando semanticamente equivalentes.
- A precipitação deve ser apresentada em milímetros, a probabilidade de precipitação e a umidade relativa em porcentagem, e a velocidade do vento em quilômetros por hora.
- As datas devem respeitar o calendário e o fuso horário da cidade selecionada.
- Campos ausentes devem ser identificados individualmente como “Indisponível”. Para uma data sem registro, manter a data e marcar todos os campos como indisponíveis; nunca deslocar valores de outra data.
- Previsão por hora não faz parte do MVP.

### RF4 — Alternar unidade de temperatura

- Celsius deve ser a unidade inicial.
- O usuário deve poder alternar para Fahrenheit.
- A unidade selecionada deve ser aplicada a todas as temperaturas do clima atual, dos cards e da previsão. Normalizar os valores recebidos para Celsius antes da apresentação e converter a partir desse valor não arredondado, evitando conversões sucessivas entre unidades. Usar $F = (C \times 9/5) + 32$ e $C = (F - 32) \times 5/9$. Exibir inteiro mais próximo; em empate exato, arredondar para longe de zero. O sufixo da unidade deve acompanhar cada valor.

### RF5 — Manter preferências locais

- A aplicação deve manter no dispositivo a unidade escolhida e a última cidade explicitamente selecionada (resultado de busca ou card), sem exigir conta. Restaurar a unidade ao reabrir. Restaurar a cidade somente se uma localização atual não for obtida. Uma localização obtida pelo dispositivo não deve ser persistida como coordenadas da última cidade.
- Salvar apenas identificador/localidade e coordenadas necessárias para reconsultar uma cidade explicitamente selecionada; não salvar respostas meteorológicas nem histórico. Ao restaurar a cidade, buscar dados novos antes de tratá-los como atuais. Armazenamento ausente, inválido ou inacessível deve resultar em Celsius e estado inicial utilizável, sem bloquear uma nova busca.
- Dados meteorológicos anteriores podem ser mantidos apenas durante a sessão atual para recuperação de falha; não há requisito de persistência de dados meteorológicos entre sessões nem de uso offline.

### RF6 — Informar estados da consulta e permitir recuperação

- Ao iniciar uma consulta, a aplicação deve apresentar feedback de carregamento.
- Antes da primeira cidade ser selecionada, a interface deve apresentar um estado inicial que permita iniciar uma busca.
- A interface deve distinguir: entrada inválida; busca sem resultados; erro/timeout da busca; carregamento meteorológico; erro/timeout meteorológico; resposta parcial; data ou campo indisponível. Falha de uma parte dos dados meteorológicos não deve ocultar partes carregadas com sucesso.
- Em caso de erro, o usuário deve poder tentar novamente para a mesma consulta/cidade.
- Durante uma atualização, manter dados anteriores somente se pertencerem à mesma localidade; identificá-los como anteriores e informar o horário de sua atualização. Nunca rotular cache anterior como atual nem associar dados de outra localidade à seleção.
- Cada tentativa de busca geográfica expira em oito segundos. A atualização meteorológica completa (condições atuais e previsão) expira em oito segundos contados da seleção da localidade. Timeout ou falha deve oferecer nova tentativa para a mesma consulta/localidade. Resposta parcial dentro do prazo permanece visível; uma falha de uma seção não invalida a seção carregada com sucesso.
- Respostas de busca ou clima substituídas por consulta ou seleção mais recente devem ser descartadas, inclusive erros e timeouts tardios, e não podem alterar a interface ou a cidade salva.
- Para HTTP 429 ou indisponibilidade temporária, comunicar que o serviço está temporariamente indisponível e permitir nova tentativa iniciada pelo usuário; não repetir automaticamente de modo ilimitado.

## 3. User Stories

### US1 — Encontrar a cidade

**Requisitos relacionados:** RF1, RF6.

Como pessoa que consulta uma cidade antes de uma visita ou viagem, quero pesquisar e selecionar o destino correto para me preparar com base nas condições meteorológicas daquele local.

**Critérios de aceite**

- **US1-CA01:** Dada uma consulta com resultados, quando o usuário os visualizar, então cada opção apresenta nome da cidade e informações geográficas disponíveis para diferenciá-la.
- **US1-CA02:** Dada a aplicação sem localidade detectada ou selecionada, quando for aberta, então a interface apresenta a busca e o estado de obtenção da localização; uma consulta meteorológica só começa após obter coordenadas ou selecionar uma cidade.
- **US1-CA03:** Dada a aplicação aberta, quando a permissão de localização for concedida e as coordenadas forem obtidas em até oito segundos, então a consulta meteorológica usa essa localização e a identifica como “Minha localização”.
- **US1-CA04:** Dada a permissão negada, a localização indisponível ou o timeout, quando houver uma última cidade salva, então essa cidade é restaurada; sem cidade salva, a busca e os dez cards de capitais são apresentados.
- **US1-CA05:** Dada a lista de capitais apresentada, quando um card for selecionado, então a aplicação abre a previsão de cinco dias da cidade correspondente.
- **US1-CA06:** Dada uma consulta com cidades homônimas, quando o usuário selecionar uma opção, então a consulta meteorológica corresponde à localidade selecionada.
- **US1-CA07:** Dada uma consulta sem correspondência, quando os resultados forem apresentados, então a interface informa que não encontrou a cidade e permite alterar a busca.
- **US1-CA08:** Dada uma consulta vazia, inválida ou curta demais, quando o usuário tentar pesquisar, então a interface orienta a corrigir a entrada sem apresentá-la como ausência de resultados.
- **US1-CA09:** Dada uma consulta com menos de dois caracteres Unicode após normalização ou sem letras/números, então nenhuma requisição é enviada; consulta válida tem espaços externos removidos, Unicode NFC e espaços internos consecutivos reduzidos.
- **US1-CA10:** Dada uma falha no serviço de busca, quando a requisição falhar, então a interface informa o erro e oferece nova tentativa, sem apresentá-lo como ausência de resultados.
- **US1-CA11:** Dadas duas buscas em sequência, se a primeira terminar depois da segunda, então seus resultados e erros não aparecem nem podem ser selecionados.
- **US1-CA12:** Todos os resultados podem ser acessados e selecionados por teclado, com nomes identificáveis por tecnologia assistiva.
- **US1-CA13:** Dada a falha de localização, então a cidade salva é restaurada antes da lista fixa; sem cidade salva válida, aparecem as dez capitais na ordem especificada. Dados dos cards nunca são inventados e uma falha meteorológica em um card não remove os demais.
- **US1-CA14:** Dada uma localização obtida depois do limite de oito segundos ou depois de outra cidade ser selecionada, então a resposta tardia é ignorada.

### US2 — Consultar o clima atual

**Requisitos relacionados:** RF2, RF6.

Como pessoa que planeja o deslocamento diário, quero consultar as condições atuais da cidade selecionada para me preparar adequadamente para o dia.

**Critérios de aceite**

- **US2-CA01:** Dada uma cidade selecionada e uma resposta válida, quando os dados forem carregados, então a interface apresenta condição, temperatura, sensação térmica, máxima e mínima do dia quando disponíveis.
- **US2-CA02:** A cidade e o horário dos dados são apresentados junto às informações meteorológicas.
- **US2-CA03:** O horário é apresentado no fuso da cidade; se estiver ausente na resposta, a interface identifica essa indisponibilidade.
- **US2-CA04:** Dado um ou mais campos ausentes, quando os dados forem exibidos, então a interface identifica cada indisponibilidade sem inventar valores nem ocultar que a resposta está incompleta.
- **US2-CA05:** Com relógio de referência controlado, timestamp de exatamente três horas é elegível para o rótulo “Atual”; acima de três horas é “Desatualizado”; timestamp ausente, inválido ou futuro nunca é “Atual”. A interface mostra o timestamp convertido para o fuso da localidade.
- **US2-CA06:** Dados de modelo são rotulados “Estimativa”; “Observado” só pode ser usado quando a fonte declarar explicitamente observação. Sem classificação verificável, a interface não afirma que o dado é observado.
- **US2-CA07:** Dada uma falha ao consultar uma cidade diferente da anterior, quando a falha for apresentada, então nenhum dado da cidade anterior é identificado como pertencente à cidade selecionada.
- **US2-CA08:** Dada uma consulta em andamento, quando os dados ainda não estiverem disponíveis, então a interface apresenta estado de carregamento.
- **US2-CA09:** Dada uma falha parcial, então os campos e seções com resposta válida permanecem visíveis e os demais são identificados como indisponíveis/parciais.

### US3 — Planejar os próximos dias

**Requisitos relacionados:** RF3, RF6.

Como pessoa que organiza atividades da semana, quero consultar a previsão diária dos próximos cinco dias para escolher uma data adequada para meus compromissos ao ar livre.

**Critérios de aceite**

- **US3-CA01:** Dada uma cidade selecionada, quando a previsão for apresentada, então ela contém cinco posições identificadas por datas locais: hoje e os quatro dias seguintes.
- **US3-CA02:** Cada data identifica o dia e apresenta condição meteorológica, mínima/máxima, precipitação acumulada, probabilidade máxima de precipitação, umidade relativa média e velocidade máxima do vento quando disponíveis, com as unidades definidas em RF3.
- **US3-CA03:** Dado um conjunto de amostras intradiárias, então precipitação acumulada usa o total diário, probabilidade usa o máximo, umidade usa a média dos valores disponíveis e vento usa o máximo; se a fonte fornecer agregado diário equivalente, esse agregado pode ser usado.
- **US3-CA04:** As datas correspondem ao calendário local da cidade, inclusive em consultas próximas à mudança de dia.
- **US3-CA05:** Se a fonte não fornecer previsão completa para um dos dias, a interface identifica os campos ou a data sem dados, sem substituir o dia por uma data de outro fuso nem deslocar dados entre dias.
- **US3-CA06:** O MVP não apresenta previsão horária.

### US4 — Alternar entre Celsius e Fahrenheit

**Requisitos relacionados:** RF4, RF5.

Como pessoa que planeja o deslocamento diário, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.

**Critérios de aceite**

- **US4-CA01:** Dado que a aplicação foi iniciada sem preferência salva, quando os dados forem exibidos, então as temperaturas aparecem em Celsius.
- **US4-CA02:** Quando o usuário selecionar Fahrenheit, então todos os valores de temperatura disponíveis no clima atual, nos cinco dias e nos cards são convertidos pela regra definida em RF4 e identificados em Fahrenheit.
- **US4-CA03:** Quando o usuário retornar a Celsius, então todos os valores disponíveis são convertidos pela mesma regra e identificados em Celsius.
- **US4-CA04:** Ao recarregar ou retornar à aplicação no mesmo dispositivo, a última unidade selecionada é restaurada.
- **US4-CA05:** Com arredondamento de empate controlado, $0,5$ é exibido como $1$ e $-0,5$ como $-1$; alternar unidades repetidamente não acumula erro de arredondamento.

### US5 — Recuperar uma consulta com falha

**Requisitos relacionados:** RF1, RF2, RF3, RF5, RF6.

Como pessoa que organiza atividades da semana, quero entender quando a consulta falha e tentar novamente para planejar meus compromissos com informações meteorológicas disponíveis.

**Critérios de aceite**

- **US5-CA01:** Ao iniciar uma consulta, a interface apresenta feedback de carregamento.
- **US5-CA02:** Se a requisição não terminar em oito segundos ou retornar erro, a interface informa que não conseguiu atualizar os dados e oferece uma ação de nova tentativa.
- **US5-CA03:** Uma consulta sem correspondência é apresentada como estado vazio, não como erro de serviço.
- **US5-CA04:** Se houver dados anteriores da mesma cidade disponíveis na sessão, eles permanecem associados à cidade e ao horário de atualização correspondentes e são identificados como anteriores; dados de outra cidade não são exibidos como pertencentes à seleção atual.
- **US5-CA05:** Ao reabrir a aplicação, a unidade é restaurada. Se a localização atual não for obtida, a última cidade salva é restaurada e atualizada pela fonte antes de os dados serem tratados como atuais; se a localização for obtida, ela prevalece sobre a cidade salva.
- **US5-CA06:** Se o armazenamento local estiver indisponível ou contiver uma preferência inválida, a aplicação usa Celsius e continua permitindo busca e seleção de cidade.
- **US5-CA07:** A mensagem de erro e a ação de nova tentativa são acessíveis por teclado e tecnologia assistiva.
- **US5-CA08:** Só uma localidade explicitamente selecionada substitui a cidade salva; coordenadas obtidas exclusivamente pela localização do dispositivo não são persistidas.
- **US5-CA09:** Dado um erro HTTP 429 ou indisponibilidade temporária, a interface informa falha recuperável, oferece tentativa manual e não inicia um ciclo ilimitado de tentativas automáticas.

## 4. Non-Functional Requirements

- **Responsividade:** os fluxos principais não devem produzir rolagem horizontal em viewports de 360, 768, 1024 e 1440 CSS px, nem nas larguras intermediárias entre eles.
- **RNF1 — Responsividade:** os fluxos principais não devem produzir rolagem horizontal em viewports de 360, 768, 1024 e 1440 CSS px, nem nas larguras intermediárias entre eles.
- **RNF2 — Compatibilidade:** suportar, na data de cada release, a versão estável atual e a major imediatamente anterior de Chrome, Edge, Firefox e Safari desktop, além de Chrome para Android e Safari para iOS nas versões ainda suportadas pelos fabricantes.
- **RNF3 — Acessibilidade:** alvo WCAG 2.2 AA. Todos os fluxos devem funcionar por teclado, com ordem de foco lógica, foco visível, nomes acessíveis e anúncio de estados assíncronos por tecnologia assistiva. Contraste mínimo: 4,5:1 para texto comum e 3:1 para texto grande e componentes/indicadores visuais relevantes. Respeitar a preferência do sistema por movimento reduzido.
- **RNF4 — Desempenho percebido:** mostrar feedback de carregamento na mesma interação que inicia a consulta. Localização expira em oito segundos; cada busca geográfica em oito segundos; consulta meteorológica completa em oito segundos desde a seleção. Ao expirar, encerrar a tentativa visível e apresentar recuperação, mesmo que a rede conclua depois.
- **RNF5 — Idioma e formatos:** interface e mensagens em pt-BR; números formatados com convenções pt-BR; temperaturas inteiras conforme RF4; precipitação em mm, probabilidade e umidade em %, vento em km/h; datas no calendário local da cidade.
- **RNF6 — Disponibilidade:** não há meta de SLA para o MVP, pois a consulta depende de uma fonte externa. Falhas devem ser comunicadas e permitir nova tentativa.
- **RNF7 — Privacidade:** coordenadas do dispositivo só podem ser usadas após concessão da permissão e durante a consulta da sessão; não persistir essas coordenadas. Não exigir conta. Preferências e cidade explicitamente selecionada permanecem no dispositivo e não são sincronizadas.

### Matriz de rastreabilidade

Os IDs dos critérios permitem derivar tarefas e casos de teste diretamente. Os RNFs listados são os que condicionam a implementação e a validação de cada story.

| User Story | Requisitos funcionais | Critérios de aceite | RNFs relevantes |
| --- | --- | --- | --- |
| US1 — Encontrar a cidade | RF1, RF6 | US1-CA01 a US1-CA14 | RNF1, RNF2, RNF3, RNF4, RNF5, RNF6, RNF7 |
| US2 — Consultar o clima atual | RF2, RF6 | US2-CA01 a US2-CA09 | RNF1, RNF2, RNF3, RNF4, RNF5, RNF6, RNF7 |
| US3 — Planejar os próximos dias | RF3, RF6 | US3-CA01 a US3-CA06 | RNF1, RNF2, RNF3, RNF4, RNF5, RNF6, RNF7 |
| US4 — Alternar entre Celsius e Fahrenheit | RF4, RF5 | US4-CA01 a US4-CA05 | RNF1, RNF2, RNF3, RNF5, RNF7 |
| US5 — Recuperar uma consulta com falha | RF1, RF2, RF3, RF5, RF6 | US5-CA01 a US5-CA09 | RNF1, RNF2, RNF3, RNF4, RNF5, RNF6, RNF7 |

## 5. Edge Cases

- Busca vazia, consulta com menos de dois caracteres Unicode, caracteres sem letras/números, nenhum resultado e cidades com nomes iguais.
- Permissão de localização concedida, previamente negada, indisponível, timeout, resposta tardia ou divergente da última cidade salva.
- Armazenamento local inacessível, corrompido, com schema antigo ou contendo cidade sem coordenadas válidas.
- Dados meteorológicos indisponíveis para um ou mais cards fixos, falha parcial ou respostas dos cards concluídas fora de ordem.
- Resultado de busca sem divisão administrativa ou país disponível.
- Falha, demora, HTTP 429, limite de requisições ou indisponibilidade da busca ou da previsão.
- Resposta parcial, campo meteorológico ausente, timestamp ausente/inválido/futuro, dado antigo ou metadado de observação/modelo não declarado.
- Falha ao consultar uma cidade diferente após uma consulta bem-sucedida; dados anteriores não podem ser atribuídos à nova cidade.
- Mudança de dia ou de fuso horário entre a cidade do usuário e a cidade consultada.
- Alternância de unidade enquanto os dados estão carregando ou após dados parciais.
- Preferência local ausente, inválida ou inacessível; nesse caso, usar Celsius e permitir nova seleção.
- Viewport estreito, navegação apenas por teclado, estado assíncrono com leitor de tela e preferência por movimento reduzido.

## 6. Assumptions

- As personas, frequências e plataformas são hipóteses derivadas do discovery e ainda não foram validadas com pesquisa.
- A pessoa que planeja atividades semanais é o público prioritário; deslocamento diário e consulta de destinos são usos secundários.
- A Open-Meteo é candidata, não uma dependência aprovada. Uso, campos, limites e atribuição precisam passar pelos gates da seção 9 antes da publicação.
- O timestamp da fonte é a referência de atualidade; a idade é medida no recebimento da resposta. Até três horas, inclusive, é elegível a “Atual”; timestamp ausente, inválido ou futuro não é atual.
- Dados de modelo são estimativas. Dados diários parciais são aceitos; cada campo ausente deve ser identificado sem ocultar campos válidos.
- Atribuição da fonte deve estar visível no rodapé global e cumprir integralmente os termos aprovados.
- “Cinco dias” significa hoje e os quatro dias seguintes, em granularidade diária.
- A localização detectada prevalece sobre a cidade salva. Se não houver localização nem cidade salva, a tela inicial apresenta busca e os dez cards mockados fixos definidos em RF1.
- A previsão diária inclui, além de condição e temperaturas, precipitação acumulada em mm, probabilidade máxima de precipitação em %, umidade relativa média em % e velocidade máxima do vento em km/h, quando disponíveis.
- Celsius é a unidade inicial; Fahrenheit também é suportado.
- A aplicação requer conexão para buscar dados atuais; não oferece suporte offline no MVP.
- Não há contas de usuário nem sincronização de preferências no MVP.
- A interface e os formatos iniciais são pt-BR.

## 7. Risks

| Risco | Probabilidade | Impacto | Mitigação prevista |
| --- | --- | --- | --- |
| Seleção de cidade homônima ou incorreta | Média | Alto | Apresentar dados geográficos de desambiguação e exigir seleção explícita; validar buscas homônimas. |
| Fonte externa indisponível, lenta, limitada ou incompatível com os termos do produto | Média | Alto | Gate de aprovação de termos, limites, atribuição e disponibilidade antes do release; timeout, estados de erro e nova tentativa. |
| Fonte sem timestamp ou metadados para classificar condições atuais | Média | Alto | Não rotular como atual/observado quando faltarem os metadados exigidos; validar contrato da fonte antes do release. |
| Ausência de campos meteorológicos em algumas localidades/datas | Média | Alto | Validar amostras representativas; exibir os campos válidos e identificar indisponibilidades por campo/data. |
| Interpretação divergente dos cinco dias ou datas incorretas | Média | Médio | Especificar hoje mais quatro dias e usar calendário/fuso da cidade selecionada; testar mudança de dia. |
| Temperaturas inconsistentes entre unidades | Baixa | Alto | Aplicar regra consistente de conversão e arredondamento e validar todas as temperaturas atuais e diárias. |
| Barreiras de uso em mobile ou para pessoas com deficiência | Média | Alto | Validar larguras definidas, teclado, leitor de tela, foco e contraste contra o alvo WCAG 2.2 AA. |

## 8. Out of Scope

- Previsão por hora.
- Contas, sincronização de preferências entre dispositivos ou armazenamento em servidor.
- Experiência offline ou garantia de atualização sem conexão.
- Integração simultânea com múltiplas fontes meteorológicas.
- Idiomas além de pt-BR no MVP.
- Alertas meteorológicos, mapas ou histórico climático, não solicitados no discovery.

## 9. Gates de validação antes do release

Estes gates são verificações externas, não decisões em aberto de experiência do usuário. O MVP não pode ser publicado usando a Open-Meteo até que todos sejam documentados como aprovados:

1. **Termos e atribuição:** confirmar que os termos permitem o uso previsto, estabelecer o texto/link de atribuição exigido e validar sua presença no rodapé global.
2. **Contrato dos dados atuais:** documentar os campos usados para valor, unidade, timestamp, fuso e classificação observação/modelo. Confirmar que os dados modelados podem ser identificados como estimativas. Se timestamp/fuso não estiver disponível, aplicar RF2 e não rotular como atual.
3. **Contrato da previsão:** mapear condição, mínima/máxima, precipitação diária, probabilidade máxima, umidade média e vento máximo para os campos e unidades da fonte; verificar semântica de cada agregado em localidades representativas. Campos não fornecidos permanecem parciais conforme RF3.
4. **Limites operacionais:** confirmar limites de requisição, comportamento em HTTP 429 e compatibilidade com atualização meteorológica de oito segundos, incluindo carregamento dos cards fixos. Implementação deve respeitar os limites do provedor.

Se qualquer gate falhar, não declarar conformidade nem publicar com essa fonte; revisar a decisão de provedor antes do release. A ausência de um campo opcional não bloqueia o MVP se a interface respeitar os estados parciais definidos.