# Especificação de Produto — Weather App

**Status:** especificação inicial consolidada com as decisões de produto respondidas; validação técnica da fonte e cobertura permanece pendente.

## 1. Overview

O Weather App permite consultar uma localidade detectada pelo dispositivo ou pesquisar uma cidade, e ver seu clima atual e a previsão diária de cinco dias, com temperaturas em Celsius ou Fahrenheit. O MVP prioriza o planejamento semanal e também atende à consulta para deslocamento diário e à consulta pontual de destinos.

O produto será uma experiência web responsiva para mobile e desktop, em português do Brasil. A consulta depende de conexão com a internet. O escopo não inclui conta de usuário. A aplicação solicita acesso à localização ao abrir; a localização só é usada após concessão da permissão.

## 2. Functional Requirements

### RF1 — Buscar e selecionar uma cidade

- O usuário deve poder pesquisar uma cidade pelo nome e selecionar explicitamente um resultado. Uma consulta vazia não deve ser enviada; espaços no início e no fim devem ser desconsiderados.
- Consultas inválidas ou curtas demais para serem processadas devem receber orientação para correção, e não ser apresentadas como busca sem resultados ou erro do serviço.
- Cada resultado deve apresentar cidade, divisão administrativa e país quando esses dados estiverem disponíveis, para diferenciar localidades homônimas.
- A busca deve distinguir consulta sem correspondência de falha do serviço e permitir que o usuário corrija a consulta ou tente novamente.
- Se uma nova consulta for iniciada antes de a anterior terminar, somente resultados correspondentes à consulta mais recente podem ser exibidos ou selecionados.
- Ao abrir a aplicação, deve ser solicitada permissão para obter a localização do dispositivo. Se concedida, a previsão deve usar as coordenadas detectadas e identificá-las na interface como “Minha localização”.
- Se a localização for negada, indisponível ou não obtida em oito segundos, a aplicação deve restaurar a última cidade salva, se houver. Se não houver cidade salva, deve exibir a busca e cards das dez capitais nacionais mais populosas por aglomeração urbana, conforme a edição mais recente disponível do World Urbanization Prospects da ONU, mantendo a lista fixa durante cada versão do produto.
- Cada card deve apresentar cidade, condição e temperatura atual quando disponíveis. Ao selecioná-lo, a aplicação deve abrir a previsão de cinco dias daquela cidade.
- A busca manual por cidade permanece disponível independentemente da permissão de localização.

### RF2 — Consultar o clima atual

- Para a cidade selecionada, a aplicação deve exibir condição meteorológica, temperatura, sensação térmica e temperaturas mínima e máxima do dia local, quando fornecidas pela fonte.
- A aplicação deve exibir a localidade consultada e o horário informado pela fonte, convertido para o fuso horário da cidade. Se a fonte não fornecer horário, a interface deve indicar que ele está indisponível.
- Dados ausentes devem ser identificados individualmente, sem inventar valores. Uma resposta parcial não deve ser apresentada como completa.
- Dados atuais só podem ser apresentados como atuais quando a fonte fornecer um indicador explícito de atualidade e esse indicador não os classificar como desatualizados. Sem esse indicador, os dados meteorológicos devem ser identificados como indisponíveis para consulta atual; o horário informado pela fonte deve continuar visível quando existir.
- A apresentação deve deixar claro se a condição atual fornecida representa observação ou estimativa/modelo, conforme a natureza da fonte. A fonte só pode ser adotada após a validação de seus termos; atribuição exigida deve ser apresentada na aplicação.

### RF3 — Consultar a previsão diária

- A previsão deve reservar cinco posições para datas locais: hoje e os quatro dias seguintes, mesmo quando a fonte não retornar dados para uma dessas datas.
- Cada dia deve apresentar condição meteorológica, temperaturas mínima e máxima, precipitação acumulada e probabilidade máxima de precipitação, umidade relativa média e velocidade máxima do vento, quando fornecidas pela fonte.
- A precipitação deve ser apresentada em milímetros, a probabilidade de precipitação e a umidade relativa em porcentagem, e a velocidade do vento em quilômetros por hora.
- As datas devem respeitar o calendário e o fuso horário da cidade selecionada.
- Campos ausentes e datas sem dados devem ser identificados como indisponíveis, sem deslocar os dados de um dia para outro.
- Previsão por hora não faz parte do MVP.

### RF4 — Alternar unidade de temperatura

- Celsius deve ser a unidade inicial.
- O usuário deve poder alternar para Fahrenheit.
- A unidade selecionada deve ser aplicada a todas as temperaturas do clima atual e da previsão. A conversão deve usar $F = (C \times 9/5) + 32$ e $C = (F - 32) \times 5/9$; os valores exibidos devem ser arredondados ao inteiro mais próximo, com empates arredondados para longe de zero.

### RF5 — Manter preferências locais

- A aplicação deve manter no dispositivo a unidade escolhida e a última cidade pesquisada ou selecionada, sem exigir conta. Ao reabrir, deve restaurar a unidade; deve restaurar a última cidade somente se a localização atual não for obtida.
- Ao restaurar uma cidade, a aplicação deve buscar dados meteorológicos novos antes de apresentá-los como atuais. A indisponibilidade ou invalidez do armazenamento local deve usar Celsius e permitir uma nova consulta, sem impedir o uso da aplicação.
- Dados meteorológicos anteriores podem ser mantidos apenas durante a sessão atual para recuperação de falha; não há requisito de persistência de dados meteorológicos entre sessões nem de uso offline.

### RF6 — Informar estados da consulta e permitir recuperação

- Ao iniciar uma consulta, a aplicação deve apresentar feedback de carregamento.
- Antes da primeira cidade ser selecionada, a interface deve apresentar um estado inicial que permita iniciar uma busca.
- A interface deve apresentar estados distintos para carregamento, consulta sem resultados, erro de serviço e dados indisponíveis ou parciais. Falha de uma parte dos dados meteorológicos não deve ocultar partes que foram carregadas com sucesso.
- Em caso de erro, o usuário deve poder tentar novamente para a mesma consulta/cidade.
- Durante uma atualização, dados anteriores só podem ser mantidos se forem da mesma cidade; devem permanecer identificados pela cidade e pelo horário da última atualização, sem serem confundidos com dados atuais. Dados de outra cidade não podem ser associados à seleção atual.
- A busca geográfica deve expirar após oito segundos por tentativa. A atualização meteorológica, incluindo clima atual e previsão, deve expirar após oito segundos a partir da seleção da cidade. Após o timeout, a interface deve informar a falha e oferecer nova tentativa.
- Respostas de consultas substituídas por uma busca ou seleção mais recente devem ser descartadas e não podem sobrescrever a interface atual.

## 3. User Stories

### US1 — Encontrar a cidade

**Requisitos relacionados:** RF1, RF6.

Como pessoa que consulta uma cidade antes de uma visita ou viagem, quero pesquisar e selecionar o destino correto para me preparar com base nas condições meteorológicas daquele local.

**Critérios de aceite**

- Dada uma consulta com resultados, quando o usuário os visualizar, então cada opção apresenta nome da cidade e informações geográficas disponíveis para diferenciá-la.
- Dada a aplicação sem localidade detectada ou selecionada, quando for aberta, então a interface apresenta a busca e o estado de obtenção da localização; uma consulta meteorológica só começa após obter coordenadas ou selecionar uma cidade.
- Dada a aplicação aberta, quando a permissão de localização for concedida e as coordenadas forem obtidas em até oito segundos, então a consulta meteorológica usa essa localização e a identifica como “Minha localização”.
- Dada a permissão negada, a localização indisponível ou o timeout, quando houver uma última cidade salva, então essa cidade é restaurada; sem cidade salva, a busca e os dez cards de capitais são apresentados.
- Dada a lista de capitais apresentada, quando um card for selecionado, então a aplicação abre a previsão de cinco dias da cidade correspondente.
- Dada uma consulta com cidades homônimas, quando o usuário selecionar uma opção, então a consulta meteorológica corresponde à localidade selecionada.
- Dada uma consulta sem correspondência, quando os resultados forem apresentados, então a interface informa que não encontrou a cidade e permite alterar a busca.
- Dada uma consulta vazia, inválida ou curta demais, quando o usuário tentar pesquisar, então a interface orienta a corrigir a entrada sem apresentá-la como ausência de resultados.
- Dada uma falha no serviço de busca, quando a requisição falhar, então a interface informa o erro e oferece nova tentativa, sem apresentá-lo como ausência de resultados.
- Todos os resultados podem ser acessados e selecionados por teclado, com nomes identificáveis por tecnologia assistiva.

### US2 — Consultar o clima atual

**Requisitos relacionados:** RF2, RF6.

Como pessoa que planeja o deslocamento diário, quero consultar as condições atuais da cidade selecionada para me preparar adequadamente para o dia.

**Critérios de aceite**

- Dada uma cidade selecionada e uma resposta válida, quando os dados forem carregados, então a interface apresenta condição, temperatura, sensação térmica, máxima e mínima do dia quando disponíveis.
- A cidade e o horário dos dados são apresentados junto às informações meteorológicas.
- O horário é apresentado no fuso da cidade; se estiver ausente na resposta, a interface identifica essa indisponibilidade.
- Dado um ou mais campos ausentes, quando os dados forem exibidos, então a interface identifica cada indisponibilidade sem inventar valores nem ocultar que a resposta está incompleta.
- Se a fonte não fornecer indicador explícito de atualidade, quando os dados forem recebidos, então a interface não os apresenta como clima atual.
- Dada uma falha ao consultar uma cidade diferente da anterior, quando a falha for apresentada, então nenhum dado da cidade anterior é identificado como pertencente à cidade selecionada.
- Dada uma consulta em andamento, quando os dados ainda não estiverem disponíveis, então a interface apresenta estado de carregamento.

### US3 — Planejar os próximos dias

**Requisitos relacionados:** RF3, RF6.

Como pessoa que organiza atividades da semana, quero consultar a previsão diária dos próximos cinco dias para escolher uma data adequada para meus compromissos ao ar livre.

**Critérios de aceite**

- Dada uma cidade selecionada, quando a previsão for apresentada, então ela contém cinco posições identificadas por datas locais: hoje e os quatro dias seguintes.
- Cada data identifica o dia e apresenta condição meteorológica, mínima/máxima, precipitação acumulada, probabilidade máxima de precipitação, umidade relativa média e velocidade máxima do vento quando disponíveis, com as unidades definidas em RF3.
- As datas correspondem ao calendário local da cidade, inclusive em consultas próximas à mudança de dia.
- Se a fonte não fornecer previsão completa para um dos dias, a interface identifica os campos ou a data sem dados, sem substituir o dia por uma data de outro fuso nem deslocar dados entre dias.
- O MVP não apresenta previsão horária.

### US4 — Alternar entre Celsius e Fahrenheit

**Requisitos relacionados:** RF4, RF5.

Como pessoa que planeja o deslocamento diário, quero alternar entre Celsius e Fahrenheit para interpretar as temperaturas na unidade que prefiro.

**Critérios de aceite**

- Dado que a aplicação foi iniciada sem preferência salva, quando os dados forem exibidos, então as temperaturas aparecem em Celsius.
- Quando o usuário selecionar Fahrenheit, então todos os valores de temperatura disponíveis no clima atual e nos cinco dias são convertidos pela regra definida em RF4 e identificados em Fahrenheit.
- Quando o usuário retornar a Celsius, então todos os valores disponíveis são convertidos pela mesma regra e identificados em Celsius.
- Ao recarregar ou retornar à aplicação no mesmo dispositivo, a última unidade selecionada é restaurada.

### US5 — Recuperar uma consulta com falha

**Requisitos relacionados:** RF1, RF2, RF3, RF5, RF6.

Como pessoa que organiza atividades da semana, quero entender quando a consulta falha e tentar novamente para planejar meus compromissos com informações meteorológicas disponíveis.

**Critérios de aceite**

- Ao iniciar uma consulta, a interface apresenta feedback de carregamento.
- Se a requisição não terminar em oito segundos ou retornar erro, a interface informa que não conseguiu atualizar os dados e oferece uma ação de nova tentativa.
- Uma consulta sem correspondência é apresentada como estado vazio, não como erro de serviço.
- Se houver dados anteriores da mesma cidade disponíveis na sessão, eles permanecem associados à cidade e ao horário de atualização correspondentes e são identificados como anteriores; dados de outra cidade não são exibidos como pertencentes à seleção atual.
- Ao reabrir a aplicação, a unidade é restaurada. Se a localização atual não for obtida, a última cidade salva é restaurada e atualizada pela fonte antes de os dados serem tratados como atuais; se a localização for obtida, ela prevalece sobre a cidade salva.
- Se o armazenamento local estiver indisponível ou contiver uma preferência inválida, a aplicação usa Celsius e continua permitindo busca e seleção de cidade.
- A mensagem de erro e a ação de nova tentativa são acessíveis por teclado e tecnologia assistiva.

## 4. Non-Functional Requirements

- **Responsividade:** os fluxos principais devem funcionar sem rolagem horizontal em larguras a partir de 360 px para mobile e a partir de 1024 px para desktop; larguras intermediárias também devem adaptar o layout.
- **Compatibilidade:** suportar versões atuais e imediatamente anteriores de Chrome, Edge, Firefox e Safari em desktop, e Chrome para Android e Safari para iOS.
- **Acessibilidade:** adotar WCAG 2.2 nível AA como alvo do MVP. Busca, seleção, localização, cards, unidade, estados e recuperação devem ser operáveis por teclado; controles e informações devem ter nomes acessíveis, foco visível e contraste adequado.
- **Desempenho percebido:** apresentar feedback de carregamento assim que uma consulta for iniciada. A obtenção de localização expira em oito segundos; a busca geográfica expira em oito segundos por tentativa; a atualização meteorológica completa (clima atual e previsão) expira em oito segundos desde a seleção da localidade. Esses limites não garantem que a fonte responderá nesse prazo.
- **Idioma e formatos:** usar português do Brasil para interface e formatos numéricos; apresentar datas de acordo com o calendário local da cidade consultada.
- **Disponibilidade:** não há meta de SLA para o MVP, pois a consulta depende de uma fonte externa. Falhas devem ser comunicadas e permitir nova tentativa.
- **Privacidade:** solicitar permissão de localização ao abrir e usar coordenadas somente se a permissão for concedida. Não exigir conta no MVP. Preferências e última cidade ficam restritas ao dispositivo.

## 5. Edge Cases

- Busca vazia ou curta demais, entrada inválida, nenhum resultado e cidades com nomes iguais.
- Permissão de localização concedida, negada, indisponível ou sem resposta dentro do timeout; localização detectada diferente da última cidade salva.
- Nenhuma cidade salva disponível quando a localização falha; lista fixa de capitais para a versão do produto e dados meteorológicos indisponíveis para um ou mais cards.
- Resultado de busca sem divisão administrativa ou país disponível.
- Falha, demora, limite de requisições ou indisponibilidade da busca ou da previsão.
- Resposta parcial, campo meteorológico ausente ou dado antigo.
- Falha ao consultar uma cidade diferente após uma consulta bem-sucedida; dados anteriores não podem ser atribuídos à nova cidade.
- Mudança de dia ou de fuso horário entre a cidade do usuário e a cidade consultada.
- Alternância de unidade enquanto os dados estão carregando ou após dados parciais.
- Preferência local ausente, inválida ou inacessível; nesse caso, usar Celsius e permitir nova seleção.
- Viewport estreito, navegação apenas por teclado e uso de leitor de tela.

## 6. Assumptions

- As personas, frequências e plataformas são hipóteses derivadas do discovery e ainda não foram validadas com pesquisa.
- A pessoa que planeja atividades semanais é o público prioritário; deslocamento diário e consulta de destinos são usos secundários.
- A Open-Meteo é a fonte proposta para geocodificação e dados meteorológicos, incluindo condições atuais e previsão, condicionada à validação de cobertura, indicador explícito de atualidade, natureza dos dados atuais, limites de uso e atribuição.
- “Cinco dias” significa hoje e os quatro dias seguintes, em granularidade diária.
- A localização detectada prevalece sobre a cidade salva. Se não houver localização nem cidade salva, a tela inicial apresenta busca e cards das dez capitais nacionais mais populosas por aglomeração urbana, usando a edição mais recente disponível do World Urbanization Prospects da ONU.
- A previsão diária inclui, além de condição e temperaturas, precipitação acumulada em mm, probabilidade máxima de precipitação em %, umidade relativa média em % e velocidade máxima do vento em km/h, quando disponíveis.
- Celsius é a unidade inicial; Fahrenheit também é suportado.
- A aplicação requer conexão para buscar dados atuais; não oferece suporte offline no MVP.
- Não há contas de usuário nem sincronização de preferências no MVP.
- A interface e os formatos iniciais são pt-BR.

## 7. Risks

| Risco | Probabilidade | Impacto | Mitigação prevista |
| --- | --- | --- | --- |
| Seleção de cidade homônima ou incorreta | Média | Alto | Apresentar dados geográficos de desambiguação e exigir seleção explícita; validar buscas homônimas. |
| Fonte externa indisponível, lenta ou limitada | Média | Alto | Aplicar timeout, estados de erro e nova tentativa; validar limites e disponibilidade antes de confirmar a fonte. |
| Cobertura insuficiente ou ausência de indicador de atualidade | Média | Alto | Validar cidades representativas; identificar dados ausentes, mostrar o horário e não apresentar dados atuais sem indicador explícito da fonte. |
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

## 9. Open Questions

As decisões de produto desta versão foram respondidas. Antes de confirmar a fonte e a cobertura do MVP, ainda é necessário validar:

1. A Open-Meteo oferece um indicador explícito de atualidade para os dados atuais, além da cobertura, atribuição e limites de uso necessários?
2. A edição mais recente do World Urbanization Prospects da ONU permite identificar de forma consistente as dez capitais nacionais mais populosas por aglomeração urbana?
3. A fonte oferece precipitação acumulada, probabilidade máxima de precipitação, umidade relativa média e velocidade máxima do vento para os dias e localidades esperados?
4. A busca por nome e a consulta pelas coordenadas do dispositivo atendem às localidades desejadas, inclusive em casos de homônimos e de baixa cobertura?