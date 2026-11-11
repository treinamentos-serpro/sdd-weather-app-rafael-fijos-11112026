# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa deseja uma aplicação de previsão do tempo que permita consultar as condições meteorológicas de cidades. O usuário deve conseguir buscar uma cidade, ver o clima atual e a previsão para cinco dias, além de alternar entre Celsius e Fahrenheit. A aplicação também deve funcionar em dispositivos móveis.

O briefing define as capacidades principais, mas não detalha quais dados meteorológicos exibir, como resolver cidades com nomes iguais ou quais critérios de desempenho e acessibilidade atender.

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

## Perguntas em Aberto e Impactos

1. **Quem é o público prioritário e qual necessidade principal a aplicação deve atender?** **Impacto:** sem esse foco, a equipe pode priorizar informações ou fluxos inadequados e não terá uma base comum para avaliar se o produto resolve o problema.
2. **A Open-Meteo será a fonte de dados da entrega e quais condições de uso, atribuição, cobertura e limites se aplicam?** **Impacto:** a implementação pode não atender à cobertura esperada, exceder limites ou descumprir exigências da fonte; uma indisponibilidade sem alternativa também pode interromper o serviço.
3. **Quais informações são obrigatórias no clima atual e qual instante representa “atual”, incluindo idade máxima aceitável e indicação de dados atrasados ou indisponíveis?** **Impacto:** diferentes implementações podem exibir conjuntos de dados incompatíveis ou apresentar dados antigos como atuais, reduzindo confiança e tornando o aceite subjetivo.
4. **“Cinco dias” inclui hoje ou corresponde aos cinco dias completos seguintes, e qual fuso horário define as datas locais?** **Impacto:** o intervalo e os rótulos podem divergir da expectativa do usuário ou mostrar datas incorretas para a cidade selecionada.
5. **A previsão será apenas diária ou também horária, e quais métricas devem ser exibidas em cada período?** **Impacto:** escopo de dados, complexidade da integração e desenho da interface permanecem indeterminados, dificultando estimativas e critérios de aceite.
6. **Como a busca deve funcionar (consulta mínima, ordenação e limite de resultados, seleção por teclado e mensagens para entrada inválida ou sem resultados)?** **Impacto:** usuários podem não encontrar ou selecionar a localidade e os estados de busca podem variar entre implementações.
7. **Como distinguir cidades homônimas e quais países, regiões e tipos de localidade serão cobertos?** **Impacto:** o usuário pode consultar o lugar errado ou encontrar falhas sem explicação; a cobertura não poderá ser validada contra um escopo acordado.
8. **Qual unidade será inicial, quais valores serão convertidos e quais regras de arredondamento e apresentação se aplicam?** **Impacto:** unidades podem ficar inconsistentes entre clima atual e previsão, e arredondamentos diferentes podem produzir valores conflitantes.
9. **A unidade escolhida e a última cidade devem ser mantidas entre recarregamentos ou sessões?** **Impacto:** a experiência pode ser inconsistente e a implementação pode armazenar preferências sem requisitos claros de duração e escopo.
10. **Quais idiomas e regiões serão suportados, incluindo formatos de data, hora, números e nomes das condições meteorológicas?** **Impacto:** informações podem ficar ambíguas ou inadequadas para o público e não haverá base para validar a experiência regional.
11. **Deve haver geolocalização ou consulta pela localização atual, além da busca por cidade?** **Impacto:** permissões, tratamento de recusa e implicações de privacidade podem ser ignorados ou implementados de forma inesperada.
12. **Como tratar carregamento, falhas de busca ou previsão, respostas parciais, limites de requisição e nova tentativa?** **Impacto:** a aplicação pode ficar bloqueada ou apresentar dados incompletos como válidos, sem distinguir erro de serviço de ausência de resultados.
13. **Qual deve ser a política de atualização, cache e funcionamento sem conexão, incluindo quando dados anteriores podem ser exibidos?** **Impacto:** dados vencidos podem ser confundidos com atuais ou requisições podem ser excessivas; não há equilíbrio acordado entre atualidade e disponibilidade.
14. **Quais são as metas de desempenho e disponibilidade e quais navegadores, versões e larguras de tela precisam ser suportados?** **Impacto:** termos como “moderno”, “responsivo” e “rápido” não são verificáveis e a equipe não consegue avaliar objetivamente compatibilidade e qualidade operacional.
15. **Qual nível ou padrão de acessibilidade será exigido e quais verificações específicas se aplicam a teclado, leitores de tela, foco, contraste e atualizações?** **Impacto:** acessibilidade permanece uma intenção genérica e barreiras importantes podem chegar à entrega sem serem detectadas.
16. **Quais cenários e dados mínimos definem o aceite de cada requisito e quais capacidades fazem parte do MVP?** **Impacto:** escopo, prioridade e conclusão da entrega ficam sujeitos a interpretações diferentes, tornando revisão e testes inconsistentes.