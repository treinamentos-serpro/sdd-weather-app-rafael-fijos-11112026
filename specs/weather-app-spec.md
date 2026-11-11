# Especificação de Produto — Weather App

**Status:** rascunho derivado do discovery; decisões marcadas como propostas dependem de validação do responsável pelo produto.

## 1. Overview

O Weather App permite pesquisar uma cidade e consultar seu clima atual e a previsão diária de cinco dias, com temperaturas em Celsius ou Fahrenheit. O MVP prioriza a pessoa que consulta o tempo para se preparar para o deslocamento diário e também atende ao planejamento semanal e à consulta pontual de destinos.

O produto será uma experiência web responsiva para mobile e desktop, em português do Brasil. A consulta depende de conexão com a internet. O escopo não inclui conta de usuário.

## 2. Functional Requirements

### RF1 — Buscar e selecionar uma cidade

- O usuário deve poder pesquisar uma cidade pelo nome e selecionar um resultado.
- Cada resultado deve apresentar cidade, divisão administrativa e país quando esses dados estiverem disponíveis, para diferenciar localidades homônimas.
- A busca deve distinguir consulta sem correspondência de falha do serviço e permitir que o usuário corrija a consulta ou tente novamente.
- O MVP não solicitará geolocalização automática.

### RF2 — Consultar o clima atual

- Para a cidade selecionada, a aplicação deve exibir condição meteorológica, temperatura, sensação térmica e temperaturas mínima e máxima do dia local, quando fornecidas pela fonte.
- A aplicação deve exibir a localidade consultada e o horário associado aos dados retornados.
- Dados ausentes ou identificados como desatualizados não devem ser apresentados como completos ou atuais; a interface deve indicar a indisponibilidade.

### RF3 — Consultar a previsão diária

- A previsão deve cobrir cinco datas locais: hoje e os quatro dias seguintes.
- Cada dia deve apresentar a condição meteorológica e temperaturas mínima e máxima, quando fornecidas pela fonte.
- As datas devem respeitar o calendário e o fuso horário da cidade selecionada.
- Previsão por hora não faz parte do MVP.

### RF4 — Alternar unidade de temperatura

- Celsius deve ser a unidade inicial.
- O usuário deve poder alternar para Fahrenheit.
- A unidade selecionada deve ser aplicada a todas as temperaturas do clima atual e da previsão, usando regra consistente de conversão e arredondamento.

### RF5 — Manter preferências locais

- A aplicação deve manter no dispositivo a unidade escolhida e a última cidade consultada, sem exigir conta.
- Ao retornar, a cidade e a unidade podem ser restauradas; os dados meteorológicos devem ser atualizados pela fonte antes de serem tratados como atuais.

### RF6 — Informar estados da consulta e permitir recuperação

- Ao iniciar uma consulta, a aplicação deve apresentar feedback de carregamento.
- A interface deve apresentar estados distintos para carregamento, consulta sem resultados, erro de serviço e dados indisponíveis ou parciais.
- Em caso de erro, o usuário deve poder tentar novamente.
- Uma resposta anterior mantida durante uma falha deve continuar identificada pela cidade e pelo horário da última atualização, sem ser confundida com dados atuais.
- Uma requisição deve expirar após oito segundos e então apresentar erro e opção de nova tentativa.

## 3. User Stories

### US1 — Encontrar a cidade

Como pessoa que consulta o tempo para o deslocamento ou uma viagem, quero pesquisar e selecionar uma cidade para ver dados do local correto.

**Critérios de aceite**

- Dada uma consulta com resultados, quando o usuário os visualizar, então cada opção apresenta nome da cidade e informações geográficas disponíveis para diferenciá-la.
- Dada uma consulta com cidades homônimas, quando o usuário selecionar uma opção, então a consulta meteorológica corresponde à localidade selecionada.
- Dada uma consulta sem correspondência, quando os resultados forem apresentados, então a interface informa que não encontrou a cidade e permite alterar a busca.
- Dada uma falha no serviço de busca, quando a requisição falhar, então a interface informa o erro e oferece nova tentativa, sem apresentá-lo como ausência de resultados.
- Todos os resultados podem ser acessados e selecionados por teclado, com nomes identificáveis por tecnologia assistiva.

### US2 — Consultar o clima atual

Como pessoa que planeja o deslocamento diário, quero consultar as condições atuais da cidade selecionada para me preparar para o dia.

**Critérios de aceite**

- Dada uma cidade selecionada e uma resposta válida, quando os dados forem carregados, então a interface apresenta condição, temperatura, sensação térmica, máxima e mínima do dia quando disponíveis.
- A cidade e o horário dos dados são apresentados junto às informações meteorológicas.
- Dado um ou mais campos ausentes, quando os dados forem exibidos, então a interface identifica a indisponibilidade sem inventar valores nem ocultar que a resposta está incompleta.
- Dada uma consulta em andamento, quando os dados ainda não estiverem disponíveis, então a interface apresenta estado de carregamento.

### US3 — Planejar os próximos dias

Como pessoa que organiza atividades da semana, quero consultar a previsão diária para escolher uma data adequada.

**Critérios de aceite**

- Dada uma cidade selecionada, quando a previsão for apresentada, então ela contém cinco datas locais: hoje e os quatro dias seguintes.
- Cada data identifica o dia e apresenta condição meteorológica e mínima/máxima quando disponíveis.
- As datas correspondem ao calendário local da cidade, inclusive em consultas próximas à mudança de dia.
- Se a fonte não fornecer previsão completa para um dos dias, a interface identifica os dados ausentes sem substituir o dia por uma data de outro fuso.
- O MVP não apresenta previsão horária.

### US4 — Alternar entre Celsius e Fahrenheit

Como usuário, quero alternar a unidade para interpretar as temperaturas conforme minha preferência.

**Critérios de aceite**

- Dado que a aplicação foi iniciada sem preferência salva, quando os dados forem exibidos, então as temperaturas aparecem em Celsius.
- Quando o usuário selecionar Fahrenheit, então todos os valores de temperatura visíveis no clima atual e nos cinco dias são atualizados e identificados em Fahrenheit.
- Quando o usuário retornar a Celsius, então todos os valores são atualizados e identificados em Celsius.
- Ao recarregar ou retornar à aplicação no mesmo dispositivo, a última unidade selecionada é restaurada.

### US5 — Recuperar uma consulta com falha

Como usuário, quero entender quando a consulta não pode ser concluída e tentar novamente para obter uma previsão utilizável.

**Critérios de aceite**

- Ao iniciar uma consulta, a interface apresenta feedback de carregamento.
- Se a requisição não terminar em oito segundos ou retornar erro, a interface informa que não conseguiu atualizar os dados e oferece uma ação de nova tentativa.
- Uma consulta sem correspondência é apresentada como estado vazio, não como erro de serviço.
- Se houver dados anteriores disponíveis, eles permanecem associados à cidade e ao horário de atualização correspondentes e são identificados como anteriores.
- A mensagem de erro e a ação de nova tentativa são acessíveis por teclado e tecnologia assistiva.

## 4. Non-Functional Requirements

- **Responsividade:** os fluxos principais devem funcionar sem rolagem horizontal em larguras a partir de 360 px para mobile e a partir de 1024 px para desktop; larguras intermediárias também devem adaptar o layout.
- **Compatibilidade:** como baseline proposto, suportar versões atuais e imediatamente anteriores dos navegadores móveis e desktop de maior uso pelo público. A lista exata de navegadores permanece pendente de validação.
- **Acessibilidade:** adotar WCAG 2.2 nível AA como alvo proposto para o MVP. Busca, seleção, unidade, estados e recuperação devem ser operáveis por teclado; controles e informações devem ter nomes acessíveis, foco visível e contraste adequado.
- **Desempenho percebido:** apresentar feedback de carregamento assim que uma consulta for iniciada. O timeout de oito segundos limita a espera da requisição, mas não representa garantia de que a fonte responderá nesse prazo.
- **Idioma e formatos:** usar português do Brasil para interface e formatos numéricos; apresentar datas de acordo com o calendário local da cidade consultada.
- **Disponibilidade:** não há meta de SLA para o MVP, pois a consulta depende de uma fonte externa. Falhas devem ser comunicadas e permitir nova tentativa.
- **Privacidade:** não solicitar permissão de localização nem exigir conta no MVP. Preferências e última cidade ficam restritas ao dispositivo.

## 5. Edge Cases

- Busca vazia ou curta demais, entrada inválida, nenhum resultado e cidades com nomes iguais.
- Resultado de busca sem divisão administrativa ou país disponível.
- Falha, demora, limite de requisições ou indisponibilidade da busca ou da previsão.
- Resposta parcial, campo meteorológico ausente ou dado antigo.
- Falha ao consultar uma cidade diferente após uma consulta bem-sucedida; dados anteriores não podem ser atribuídos à nova cidade.
- Mudança de dia ou de fuso horário entre a cidade do usuário e a cidade consultada.
- Alternância de unidade enquanto os dados estão carregando ou após dados parciais.
- Preferência local ausente, inválida ou inacessível; nesse caso, usar Celsius e permitir nova seleção.
- Viewport estreito, navegação apenas por teclado e uso de leitor de tela.

## 6. Assumptions

- As personas, frequências, plataformas e prioridade de público são hipóteses derivadas do discovery e ainda não foram validadas com pesquisa.
- O baseline proposto prioriza a consulta para deslocamento diário e mantém o planejamento semanal e a consulta de destinos como usos secundários.
- A Open-Meteo é a fonte proposta para geocodificação e previsão, condicionada à validação de cobertura, atualidade, limites de uso e atribuição.
- “Cinco dias” significa hoje e os quatro dias seguintes, em granularidade diária.
- Celsius é a unidade inicial; Fahrenheit também é suportado.
- A aplicação requer conexão para buscar dados atuais; não oferece suporte offline no MVP.
- Não há contas de usuário, sincronização de preferências nem geolocalização automática no MVP.
- A interface e os formatos iniciais são pt-BR.

## 7. Risks

| Risco | Probabilidade | Impacto | Mitigação prevista |
| --- | --- | --- | --- |
| Seleção de cidade homônima ou incorreta | Média | Alto | Apresentar dados geográficos de desambiguação e exigir seleção explícita; validar buscas homônimas. |
| Fonte externa indisponível, lenta ou limitada | Média | Alto | Aplicar timeout, estados de erro e nova tentativa; validar limites e disponibilidade antes de confirmar a fonte. |
| Cobertura insuficiente ou dados incompletos/desatualizados | Média | Alto | Validar cidades representativas; identificar dados ausentes e mostrar horário da resposta. O limite de idade aceitável ainda precisa ser definido. |
| Interpretação divergente dos cinco dias ou datas incorretas | Média | Médio | Especificar hoje mais quatro dias e usar calendário/fuso da cidade selecionada; testar mudança de dia. |
| Temperaturas inconsistentes entre unidades | Baixa | Alto | Aplicar regra consistente de conversão e arredondamento e validar todas as temperaturas atuais e diárias. |
| Barreiras de uso em mobile ou para pessoas com deficiência | Média | Alto | Validar larguras definidas, teclado, leitor de tela, foco e contraste contra o alvo WCAG 2.2 AA. |

## 8. Out of Scope

- Previsão por hora.
- Geolocalização automática ou busca pela localização atual.
- Contas, sincronização de preferências entre dispositivos ou armazenamento em servidor.
- Experiência offline ou garantia de atualização sem conexão.
- Integração simultânea com múltiplas fontes meteorológicas.
- Idiomas além de pt-BR no MVP.
- Alertas meteorológicos, mapas ou histórico climático, não solicitados no discovery.

## 9. Open Questions

As decisões abaixo são propostas e precisam de validação do responsável pelo produto antes de serem tratadas como compromissos aprovados:

1. As personas hipotéticas e a prioridade da pessoa que planeja o deslocamento diário refletem o público real?
2. A Open-Meteo atende à cobertura, atualidade, atribuição e limites de uso necessários para as localidades esperadas?
3. Qual idade máxima dos dados permite apresentá-los como atuais, e qual regra identifica dados desatualizados?
4. O baseline de hoje mais quatro dias, com condição e mínima/máxima, atende ao significado esperado de previsão de cinco dias?
5. A busca limitada à cobertura da fonte e sem geolocalização atende às localidades desejadas, inclusive em casos de homônimos?

Também devem ser confirmados, antes de definir a matriz final de validação, os navegadores e versões suportados e o alvo WCAG 2.2 AA proposto.