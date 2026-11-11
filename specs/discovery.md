# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa deseja uma aplicação de previsão do tempo que permita consultar as condições meteorológicas de cidades. O usuário deve conseguir buscar uma cidade, ver o clima atual e a previsão para cinco dias, além de alternar entre Celsius e Fahrenheit. A aplicação também deve funcionar em dispositivos móveis.

O briefing define as capacidades principais, mas não detalha quais dados meteorológicos exibir, como resolver cidades com nomes iguais ou quais critérios de desempenho e acessibilidade atender.

## Personas e Objetivos

As personas abaixo são hipóteses iniciais derivadas do escopo do briefing; frequência de acesso, critério de sucesso e plataforma são hipóteses a validar com usuários antes de orientar decisões definitivas de produto.

| Persona | Objetivo | Frequência de acesso | Critério de sucesso pessoal | Plataforma de uso |
| --- | --- | --- | --- | --- |
| Pessoa que planeja o deslocamento diário | Consultar o clima atual e os próximos dias da cidade onde está para se preparar para as condições do dia. | Diária: todos ou quase todos os dias. | Sair preparada para as condições do dia sem precisar consultar várias fontes. | Mobile, principalmente antes de sair ou durante o deslocamento. |
| Pessoa que organiza atividades da semana | Consultar a previsão diária para escolher quando realizar atividades ou compromissos ao ar livre. | Semanal: uma ou mais vezes por semana. | Escolher um dia adequado e organizar a atividade com confiança. | Desktop, principalmente durante o planejamento da semana. |
| Pessoa que consulta uma cidade antes de uma visita ou viagem | Buscar o destino correto e verificar as condições previstas para decidir o que levar ou como se preparar. | Eventual: quando surge uma necessidade pontual, como uma viagem. | Confirmar que consultou o destino pretendido e preparar-se adequadamente para o clima previsto. | Mobile ou desktop, conforme o momento e o dispositivo disponível. |

## Requisitos Funcionais

- **RF1 — Buscar cidades:** permitir que o usuário pesquise uma cidade pelo nome e selecione o local desejado.
- **RF2 — Exibir clima atual:** mostrar as condições meteorológicas atuais da cidade selecionada.
- **RF3 — Exibir previsão:** mostrar a previsão do tempo para os próximos cinco dias.
- **RF4 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit e atualizar os valores de temperatura do clima atual e da previsão.

## Requisitos Não-Funcionais

- **RNF1 — Compatibilidade:** a aplicação deve funcionar em navegadores modernos de dispositivos móveis.
- **RNF2 — Responsividade:** a interface deve adaptar seu layout a diferentes tamanhos de tela, incluindo dispositivos móveis e desktops.
- **RNF3 — Usabilidade:** busca, consulta da previsão e alternância de unidade devem ser compreensíveis e fáceis de acessar.
- **RNF4 — Acessibilidade:** controles e informações meteorológicas devem ser acessíveis por teclado e identificáveis por tecnologias assistivas.

## Riscos

As probabilidades abaixo são estimativas qualitativas preliminares e devem ser revistas após a definição do público, da fonte de dados e dos critérios de aceite.

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| A busca seleciona uma cidade homônima ou uma localidade diferente da pretendida | Média | Alto | Exibir cidade, região administrativa e país nos resultados; exigir seleção explícita e validar buscas com homônimos e sem resultados. |
| A fonte de dados fica indisponível, lenta ou limita requisições | Média | Alto | Definir timeout e estados de carregamento/erro, permitir nova tentativa e validar limites e disponibilidade da fonte antes da entrega. |
| A fonte não cobre a localidade ou retorna dados incompletos/desatualizados | Média | Alto | Validar a cobertura e a atualidade dos dados para localidades representativas; identificar dados ausentes ou antigos e não apresentá-los como completos/atuais. |
| O período ou as datas da previsão divergem da expectativa para “cinco dias” | Média | Médio | Definir se hoje está incluído e usar o fuso horário da localidade; exibir datas explícitas e testar limites entre dias. |
| Temperaturas ficam inconsistentes ao alternar entre Celsius e Fahrenheit | Baixa | Alto | Definir regra de conversão e arredondamento em um único ponto e testar valores do clima atual e da previsão nas duas unidades. |
| A experiência é incompatível com telas pequenas ou inacessível por teclado/leitor de tela | Média | Alto | Definir navegadores, larguras e critérios de acessibilidade suportados; validar os fluxos principais em dispositivos móveis e com testes de teclado e tecnologia assistiva. |

## Suposições (Assumptions)

- O usuário inicia a consulta pesquisando uma cidade; geolocalização automática não foi solicitada.
- “Cinco dias” representa um período de previsão diária, mas a inclusão do dia atual ainda precisa ser confirmada.
- Celsius e Fahrenheit são as únicas unidades de temperatura necessárias na primeira versão.
- O uso principal é informativo e não exige conta de usuário.
- A aplicação depende de conexão com a internet para buscar dados meteorológicos.
- O suporte a dispositivos móveis é obrigatório; a compatibilidade detalhada com navegadores e tamanhos de tela ainda precisa ser definida.
- As instruções do projeto indicam Open-Meteo como fonte de dados prevista, sem chave de API. Essa decisão deve ser confirmada como requisito da entrega.

## Perguntas em Aberto Prioritárias

Estas cinco perguntas preservam o histórico das decisões de maior impacto. As respostas recomendadas e seus trade-offs estão registradas ao final do documento; até serem aprovadas pelo responsável pelo produto, permanecem propostas.

1. **Quem é o público prioritário e qual necessidade principal a aplicação deve atender?** **Impacto:** sem essa prioridade, a equipe pode otimizar para fluxos incompatíveis e não terá um critério comum para avaliar o valor da entrega.
2. **A Open-Meteo será a fonte de dados e sua cobertura, atualidade, atribuição e limites atendem às localidades esperadas?** **Impacto:** uma escolha inadequada pode produzir previsões indisponíveis ou desatualizadas, violar condições de uso ou interromper consultas.
3. **Quais dados definem o clima atual e quanto tempo podem ter antes de serem identificados como desatualizados?** **Impacto:** dados antigos ou incompletos apresentados como atuais podem levar a decisões ruins e reduzir a confiança, especialmente para a persona de acesso diário.
4. **O período de cinco dias inclui hoje, quais informações diárias serão exibidas e haverá previsão por hora?** **Impacto:** intervalo, escopo de dados e interface podem divergir entre produto e implementação, prejudicando tanto a consulta diária quanto o planejamento semanal.
5. **Qual será o escopo da busca e como serão tratados lugares homônimos, localidades não encontradas e geolocalização?** **Impacto:** uma escolha incorreta pode mostrar o tempo do lugar errado; adicionar geolocalização sem necessidade também introduz permissões e preocupações de privacidade.

## Decisões de Produto e Trade-offs

As decisões abaixo são propostas de baseline para o MVP, não decisões aprovadas. Elas fecham as demais questões do discovery e oferecem respostas recomendadas às cinco perguntas prioritárias; o responsável pelo produto deve validá-las antes de serem tratadas como requisitos confirmados.

| Tema | Decisão proposta | Trade-off considerando personas e riscos |
| --- | --- | --- |
| Público e prioridade do MVP | Priorizar a pessoa que consulta o clima para o deslocamento diário; atender também ao planejamento semanal e à consulta pontual de destinos, sem funcionalidades específicas para esses segmentos no MVP. | Favorece o uso recorrente e a consulta rápida no mobile; limita a personalização para planejamento de viagem e atividades. |
| Fonte de dados | Usar Open-Meteo para geocodificação e previsão no MVP, após validar cobertura, atualidade, limites de uso e atribuição exigida. Não integrar uma segunda fonte inicialmente. | Evita credenciais e reduz custo e complexidade; mantém dependência de um único fornecedor, mitigada com estados de erro, nova tentativa e indicação de dados anteriores. |
| Clima atual | Exibir condição, temperatura, sensação térmica e máxima/mínima do dia local, acompanhadas do horário informado pela fonte. Indicar ausência ou desatualização em vez de preencher dados faltantes. | Ajuda a persona diária a se preparar e dá contexto à informação; exibe mais campos e depende de disponibilidade consistente na fonte. |
| Período e granularidade | Exibir hoje e os quatro dias seguintes, segundo o calendário e fuso horário da cidade selecionada; mostrar condição e temperaturas mínima/máxima por dia. Não incluir previsão horária no MVP. | Torna os “cinco dias” inequívocos e atende ao planejamento semanal com interface simples; reduz a precisão para decisões dentro de um mesmo dia. |
| Busca e localização | Permitir busca por nome e seleção explícita; identificar cada resultado por cidade, divisão administrativa disponível e país. Não solicitar geolocalização no MVP; exibir estado vazio quando não houver correspondência. | Reduz o risco de escolher cidade homônima e evita pedir permissão de localização; exige que o usuário saiba o nome do destino e não oferece consulta automática da localização atual. |
| Unidade e preferências | Usar Celsius por padrão, oferecer Fahrenheit e converter todos os campos de temperatura do clima atual e da previsão com arredondamento consistente. Guardar unidade e última cidade apenas no dispositivo, sem conta ou sincronização. | Atende ao uso recorrente e reduz repetição; usuários de dispositivos compartilhados podem encontrar preferências locais anteriores, e a preferência não acompanha o usuário entre aparelhos. |
| Idioma e formatos | Usar interface e formatos pt-BR como padrão; apresentar datas conforme o calendário local da cidade consultada. Manter busca de localidades limitada à cobertura da fonte. | Adequa a primeira versão ao idioma do discovery; usuários de outras regiões podem preferir idioma, convenções ou cobertura diferentes. |
| Falhas, atualização e offline | Exigir conexão para novas consultas; definir timeout, estados de carregamento/erro e ação de tentar novamente. Se houver resultado anterior na sessão, mantê-lo identificado com horário da última atualização. Não prometer suporte offline. | Mantém a experiência simples e evita apresentar dado antigo como novo; sem conexão, a consulta pode não ser atualizada, e o rótulo de horário é essencial para reduzir o risco de uso de dados vencidos. |
| Responsividade e compatibilidade | Validar os fluxos principais em mobile a partir de 360 px e desktop a partir de 1024 px, nas versões atuais e imediatamente anteriores dos navegadores móveis e desktop mais usados pelo público-alvo. | Cobre as plataformas das personas sem exigir suporte a navegadores legados; dispositivos e navegadores fora da matriz poderão ter experiência degradada. |
| Acessibilidade | Adotar WCAG 2.2 nível AA como alvo do MVP, incluindo operação por teclado, foco visível, nomes acessíveis e contraste adequado. | Reduz barreiras para usuários com deficiência e torna o requisito verificável; acrescenta esforço de design, implementação e validação que deve entrar no planejamento. |
| Desempenho e disponibilidade | Mostrar feedback de carregamento imediatamente após a busca e limitar cada requisição a 8 segundos antes de oferecer nova tentativa. Não estabelecer SLA de disponibilidade enquanto a aplicação depender de fonte externa sem controle operacional. | Evita deixar a persona diária sem resposta indefinidamente e define comportamento de espera; não garante tempo de resposta da fonte nem disponibilidade contínua. |
| Critérios de aceite e escopo | Considerar o MVP aceito quando for possível buscar e selecionar uma cidade, consultar clima atual e cinco dias, alternar unidades e operar os estados de carregamento, vazio e erro nos tamanhos e critérios de acessibilidade definidos. Excluir do MVP previsão horária, geolocalização automática, contas e suporte offline. | Mantém escopo testável e ligado aos requisitos centrais; funcionalidades excluídas podem ser necessárias para alguns usuários e deverão ser reavaliadas com pesquisa e feedback. |