# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa deseja uma aplicação de previsão do tempo que permita consultar as condições meteorológicas de cidades. O usuário deve conseguir buscar uma cidade, ver o clima atual e a previsão para cinco dias, além de alternar entre Celsius e Fahrenheit. A aplicação também deve funcionar em dispositivos móveis.

O briefing define as capacidades principais, mas não detalha quais dados meteorológicos exibir, como resolver cidades com nomes iguais ou quais critérios de desempenho e acessibilidade atender.

## Requisitos Funcionais

- **RF1 — Buscar cidades:** permitir que o usuário pesquise uma cidade pelo nome e selecione o local desejado.
- **RF2 — Exibir clima atual:** mostrar as condições meteorológicas atuais da cidade selecionada.
- **RF3 — Exibir previsão:** mostrar a previsão do tempo para os próximos cinco dias.
- **RF4 — Alternar unidade:** permitir alternar entre Celsius e Fahrenheit e atualizar os valores de temperatura exibidos.

## Requisitos Não-Funcionais

- **RNF1 — Compatibilidade móvel:** a aplicação deve ser utilizável em dispositivos móveis.
- **RNF2 — Responsividade:** a interface deve se adaptar a diferentes tamanhos de tela, incluindo dispositivos móveis e desktops.
- **RNF3 — Usabilidade:** busca, consulta da previsão e alternância de unidade devem ser compreensíveis e fáceis de acessar.
- **RNF4 — Acessibilidade:** controles e informações meteorológicas devem ser acessíveis por teclado e identificáveis por tecnologias assistivas.
- **RNF5 — Consistência:** valores de temperatura devem respeitar a unidade selecionada em todas as áreas da aplicação.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| A busca retornar cidades homônimas ou resultados imprecisos | Média | Alto | Apresentar informações adicionais, como estado e país, para distinguir resultados. |
| A fonte de dados meteorológicos ficar indisponível ou responder lentamente | Média | Alto | Exibir estados de carregamento e erro e permitir nova tentativa. |
| A previsão disponível não corresponder à expectativa de “cinco dias” | Média | Médio | Confirmar se o período inclui o dia atual e explicitar as datas exibidas. |
| Valores incorretos após alternar entre Celsius e Fahrenheit | Baixa | Alto | Definir uma conversão consistente e validar os valores nas duas unidades. |
| Interface difícil de usar em telas pequenas | Média | Alto | Projetar e testar os fluxos principais em dispositivos móveis e diferentes larguras de tela. |

## Perguntas em Aberto (Open Questions)

1. Qual fonte de dados meteorológicos será usada? **Impacto:** determina cobertura, custo, limites de uso e necessidade de credenciais.
2. Quais informações devem aparecer no clima atual, além da temperatura? **Impacto:** afeta o escopo dos dados, a interface e os critérios de aceite.
3. Como devem ser apresentados os cinco dias: hoje mais quatro dias ou os cinco dias seguintes? **Impacto:** altera o intervalo da previsão e a forma de rotular as datas.
4. A previsão deve mostrar apenas um resumo diário ou também informações por hora? **Impacto:** muda a complexidade da integração e da interface.
5. Como a busca deve tratar cidades com o mesmo nome? **Impacto:** sem desambiguação, o usuário pode consultar a localização errada.
6. Qual unidade deve ser selecionada inicialmente? **Impacto:** define os valores exibidos na primeira consulta.
7. A preferência de unidade deve ser lembrada entre sessões? **Impacto:** determina se é necessário armazenar preferências no dispositivo ou no servidor.
8. Quais idiomas e regiões devem ser suportados? **Impacto:** afeta textos, formatos de data e apresentação de unidades.
9. Deve haver geolocalização automática ou busca por localização atual? **Impacto:** envolve permissões do navegador e um fluxo adicional de privacidade e UX.
10. A aplicação precisa oferecer cache ou algum suporte offline? **Impacto:** afeta atualidade dos dados e complexidade de armazenamento e sincronização.
11. Quais são os alvos de desempenho e disponibilidade? **Impacto:** sem metas, não é possível definir critérios objetivos de operação e experiência.

## Suposições (Assumptions)

- O usuário inicia a consulta pesquisando uma cidade; geolocalização automática não foi solicitada.
- “Cinco dias” representa um período de previsão diária, mas a inclusão do dia atual ainda precisa ser confirmada.
- Celsius e Fahrenheit são as únicas unidades de temperatura necessárias na primeira versão.
- O uso principal é informativo e não exige conta de usuário.
- A aplicação depende de conexão com a internet para buscar dados meteorológicos.
- O suporte a dispositivos móveis é obrigatório; a compatibilidade detalhada com navegadores e tamanhos de tela ainda precisa ser definida.
- As instruções do projeto indicam Open-Meteo como fonte de dados prevista, sem chave de API. Essa decisão deve ser confirmada como requisito da entrega.