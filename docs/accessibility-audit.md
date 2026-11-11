# Auditoria de acessibilidade — T-30

## Situação em 11/11/2026

**Implementação parcial; aceite bloqueado.** A aplicação ainda apresenta dados
de demonstração. Esta entrega prepara verificações reproduzíveis, mas não
declara conformidade WCAG 2.2 AA nem substitui a avaliação manual.

Rastreabilidade: RF1, RF6, US1-CA12, US5-CA07, RNF2, RNF3 e RNF5 da
[especificação](../specs/weather-app-spec.md), conforme a estratégia do
[plano](../plans/weather-app-plan.md).

## Cobertura implementada

- `tests/e2e/accessibility.spec.ts` usa `@axe-core/playwright` com as tags
  `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` e `wcag22aa`, incluindo as
  verificações automáticas de contraste aplicáveis.
- São auditados os estados inicial, carregando, carregado, vazio e erro da
  demonstração, com o resultado completo do axe anexado ao relatório de cada
  teste. Os itens `incomplete` exigem análise humana.
- A fixture em `tests/e2e/fixtures/accessibility.tsx` monta o `App` com
  `initialStatus`. Apenas os testes interceptam o ponto de entrada; parâmetros
  da URL não habilitam estados de teste na aplicação publicada.
- Teclado: Tab e Shift+Tab, ordem Celsius → Fahrenheit → busca → Buscar,
  indicadores de foco computados, ativação por Enter/Espaço, alternância de
  unidade e retry da demonstração sem mouse.
- Anúncios: presença de `role="status"`, `aria-live="polite"`, `role="alert"`
  e associação do feedback da busca pelo `aria-describedby`. Isso verifica
  semântica, não comprova o anúncio por um leitor de tela.
- Movimento reduzido: emulação de `prefers-reduced-motion` e checagem das
  durações computadas dos controles. O CSS global reduz transições/animações.
- A configuração existente executa 9 casos em Chromium desktop e 9 no projeto
  mobile (WebKit/iPhone 13). Recursos HTTPS externos são interceptados e
  bloqueados; não há chamadas reais à API.

## Evidências obtidas

| Verificação | Resultado |
| --- | --- |
| `pnpm lint` | Passou, sem avisos |
| `pnpm build` | Passou |
| `pnpm test` | Passou: 29 testes unitários |
| `pnpm test:e2e tests/e2e/accessibility.spec.ts --list` | 18 casos descobertos |
| TypeScript strict dos testes e da fixture | Passou |
| Auditoria no navegador | Bloqueada antes de abrir o Chromium: falta `libnspr4.so` |
| Revisão manual com leitor de tela | Não executada |

Checagem de tipos dos E2E, que não entram no build do app:

```sh
pnpm exec tsc --ignoreConfig --noEmit --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution bundler --jsx react-jsx --lib ES2022,DOM src/vite-env.d.ts tests/e2e/accessibility.spec.ts tests/e2e/fixtures/accessibility.tsx
```

## Bloqueios de aceite

1. **T-29 pendente:** os fluxos integrados e a matriz de navegadores ainda não
   foram implementados/validados. Esta suíte não comprova RNF2.
2. **Seleção indisponível:** não existem resultados selecionáveis, desambiguação
   ou cartões de capitais. US1-CA12 não pode ser aceito com a interface atual.
3. **Erro/parcial real indisponível:** retry apenas muda o estado temporário
   para os mocks. O estado parcial e a recuperação de requisições reais ainda
   precisam ser auditados com respostas interceptadas e determinísticas.
4. **Dependências de navegador ausentes:** instalar as bibliotecas do sistema
   e os navegadores antes de executar a suíte. Nenhuma auditoria axe, inspeção
   visual, verificação de contraste ou interação E2E foi concluída neste
   contêiner. Bibliotecas adicionais podem ser necessárias além de `libnspr4`.
5. **Validação manual pendente:** ordem/visibilidade e contraste do foco,
   comportamento com leitor de tela, ausência de perda de foco na recuperação
   e movimento reduzido precisam de confirmação humana.

Em um terminal com as permissões necessárias para instalar dependências do
sistema:

```sh
pnpm exec playwright install --with-deps chromium webkit
pnpm test:e2e tests/e2e/accessibility.spec.ts
```

## Roteiro manual pendente

Registrar navegador/versão, sistema operacional, leitor de tela/versão,
viewport, resultado e evidência de cada item. Para os estados temporários,
usar o modo `--debug` da suíte, que aplica a fixture sem modificar produção.

- [ ] Navegar sem mouse, nos viewports desktop e mobile: Tab/Shift+Tab devem
  seguir a ordem visual, sem armadilhas, com indicador visível e não ocultado.
- [ ] Buscar cidade e, após implementar a integração, percorrer e selecionar
  todos os resultados apenas por teclado, com nomes geográficos identificáveis.
- [ ] Alternar Celsius/Fahrenheit por Enter e Espaço; confirmar nome, estado
  pressionado e consistência das temperaturas em todas as seções disponíveis.
- [ ] Acionar retry por teclado; confirmar anúncio da conclusão e destino
  lógico do foco quando o botão desaparecer. Repetir com erro e parcial reais.
- [ ] Com leitor de tela em ambiente suportado, confirmar leitura dos rótulos,
  feedback de validação, carregamento, vazio, erro e conclusão, sem anúncios
  duplicados ou foco deslocado inesperadamente.
- [ ] Revisar visualmente o contraste: 4,5:1 para texto comum e 3:1 para texto
  grande e componentes/indicadores relevantes, incluindo foco e estados ativos.
- [ ] Ativar movimento reduzido no sistema e confirmar ausência de movimento
  desnecessário, sem perda de feedback ou funcionalidade.
- [ ] Revisar os itens `incomplete` anexados pelo axe e registrar correções e
  resultados antes de remover os bloqueios de aceite.