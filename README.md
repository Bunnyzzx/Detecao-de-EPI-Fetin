# Detecção de EPI — FETIN

Terminal de verificação de **Equipamentos de Proteção Individual (EPIs)** para instalação na entrada
de áreas restritas. A pessoa se posiciona em frente ao terminal, toca em **Iniciar Verificação** e o
sistema avalia os equipamentos automaticamente, liberando ou bloqueando o acesso.

É a adaptação em aplicação web nativa do protótipo
[tape-crab-67490107.figma.site](https://tape-crab-67490107.figma.site) — layout, cores, textos e
fluxo foram preservados.

> ⚠️ O sistema auxilia a inspeção de EPIs, mas **não substitui a avaliação de um profissional de
> segurança do trabalho**.

---

## Estado atual

A detecção real será feita por uma **IA própria**, ainda não integrada. Até lá, o terminal opera em
**modo simulado**: ao iniciar a verificação, o `MockEpiVerificationService` avalia um equipamento por
vez, emitindo progresso, exatamente como a IA fará. O aviso de modo simulado é exibido na tela
inicial — nada é apresentado como real quando não é.

Não há upload de imagem nem seleção de galeria: o fluxo é iniciar a verificação e aguardar.

---

## Sumário

- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Configuração do `.env`](#configuração-do-env)
- [Telas e fluxo](#telas-e-fluxo)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Serviço de verificação](#serviço-de-verificação)
- [Integrando a IA de detecção](#integrando-a-ia-de-detecção)
- [Armazenamento local](#armazenamento-local)
- [Área administrativa](#área-administrativa)
- [Qualidade: testes, lint e tipos](#qualidade-testes-lint-e-tipos)
- [Instalação no totem](#instalação-no-totem)
- [Limitações atuais](#limitações-atuais)
- [Próximos passos sugeridos](#próximos-passos-sugeridos)

---

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Base | React 19 + Vite 8 |
| Linguagem | TypeScript em modo estrito |
| Navegação | React Router |
| Estilo | CSS Modules sobre tokens em `custom properties` |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts (o mesmo do protótipo) |
| Ícones | lucide-react (idem) |
| Animação | Motion |
| Persistência | `localStorage` por trás de repositórios |
| Testes | Vitest + Testing Library |
| Qualidade | ESLint + Prettier |

---

## Pré-requisitos

- **Node.js 20 ou superior** (validado com Node 24)
- **npm 10+**
- Um navegador moderno (Chrome, Edge ou Firefox)

Não é necessário Android Studio, Xcode nem emulador: é uma aplicação web.

## Instalação e execução

```bash
npm install
```

```bash
npm run dev
```

A aplicação abre em `http://localhost:5173`. O layout é pensado para **tela em paisagem**; para a
apresentação, use o navegador em tela cheia (**F11**).

Para gerar a versão de produção:

```bash
npm run build
```

```bash
npm run preview
```

## Configuração do `.env`

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `VITE_EPI_API_URL` | Não | URL base da API da IA. **Se vazia, o terminal usa o serviço simulado.** |
| `VITE_EPI_API_TIMEOUT_MS` | Não | Timeout das requisições, em ms. Padrão: `20000`. |
| `VITE_TERMINAL_RESET_SECONDS` | Não | Segundos até o terminal voltar sozinho ao início. Padrão: `20`. |

O `.env` está no `.gitignore`; só o `.env.example` é versionado. **Nenhuma URL, chave ou token é
escrito no código.**

---

## Telas e fluxo

```text
Início ──[Iniciar Verificação]──► Verificação (automática) ──► Resultado
   │                                      │                       │
   │                                      └─ Voltar ──────────────┤
   │                                                              │
   └── Admin ─► Login ─► Dashboard · Usuários · EPIs Ativos · Histórico
                                                                  │
                        Resultado volta sozinho ao Início ◄───────┘
```

| Rota | Tela |
| --- | --- |
| `/` | Início: identidade, grade dos EPIs ativos e botão de verificação |
| `/verificacao` | Verificação automática: moldura de escaneamento, silhueta com zonas por EPI, barra de progresso e lista lateral confirmando um item por vez |
| `/resultado/:id` | Resultado: **Acesso Liberado**, **Atenção** ou **Acesso Negado**, com confiança, itens detectados e ausentes, ressalva e retorno automático |
| `/admin` | Login administrativo |
| `/admin/painel` | Dashboard, Usuários, EPIs Ativos e Histórico |

### Estados previstos

Verificação em andamento · concluída · **interrompida** (a pessoa saiu antes do fim) · **falha** com
opção de repetir · **nenhum equipamento ativo** na configuração · **nada reconhecido** ·
**confiança baixa** · resultado inexistente · rota desconhecida. Todos usam os componentes
reutilizáveis de `src/components/feedback`.

---

## Estrutura de pastas

```text
src/
├── app/                        App, provedores e tabela de rotas
├── pages/
│   ├── HomePage · ScanPage · ResultPage
│   └── admin/                  AdminLayout · Login · Dashboard · Users · Epis · History
├── components/
│   ├── ui/                     Button Card Badge ProgressBar TextField SelectField Toggle
│   ├── layout/                 TerminalShell · TerminalStatusBar · StepIndicator
│   └── feedback/               StateView · ErrorState · EmptyState · InlineNotice · RouteFallback
├── features/
│   ├── epi-verification/
│   │   ├── components/         ScanViewport · HumanSilhouette · EpiChecklist · EpiGrid · ResultSummary
│   │   ├── hooks/              useVerification · useRequiredEpis · useVerificationHistory
│   │   ├── services/           Mock · Api · fábrica · repositórios
│   │   ├── mocks/              cenários de verificação
│   │   ├── types/              domínio e contrato da API
│   │   └── utils/              status · montagem do resultado · mapeamento da resposta
│   └── admin/                  components hooks schemas services mocks types utils
├── services/                   errors/ http/ storage/ env.ts
├── hooks/                      useClock · useCountdown
├── constants/                  catálogo de EPIs · textos · limiares
├── styles/                     tokens.css · global.css
└── utils/                      formatação · identificadores
```

---

## Serviço de verificação

O contrato está em `src/features/epi-verification/types/verification.ts`:

```ts
export interface EpiVerificationService {
  verify(
    input: VerificationInput,
    onProgress?: VerificationProgressListener,
  ): Promise<VerificationResult>;
}
```

A verificação é **progressiva**: o serviço emite `{ progress, items, currentItem }` a cada passo, e é
isso que alimenta a barra de progresso, as zonas coloridas da silhueta e a lista lateral. Um
`AbortSignal` permite interromper a verificação se a pessoa sair do terminal.

### Como o simulado funciona

`MockEpiVerificationService`:

1. Valida que há ao menos um equipamento ativo.
2. Avalia **um equipamento por vez**, com pausa entre eles, emitindo progresso.
3. Sorteia um **cenário** de `mocks/verificationScenarios.ts`, com pesos:

   | Cenário | Efeito | Status resultante |
   | --- | --- | --- |
   | `conformidade-total` | Todos detectados com confiança alta | `approved` |
   | `confianca-baixa` | Todos detectados, confiança reduzida | `warning` |
   | `falta-oculos` | Um item ausente | `warning` |
   | `falta-luvas-e-mascara` | Dois itens ausentes | `rejected` |
   | `sem-capacete-e-colete` | Dois itens ausentes | `rejected` |
   | `nada-reconhecido` | Nenhum item detectado | `rejected` |

4. Gera confianças a partir da confiança-base de cada EPI no catálogo, com pequena variação.
5. Passa tudo por `buildVerificationResult`, o **mesmo** caminho que a IA usará.

A aleatoriedade (`random`), o cenário (`forcedScenario`) e o tempo por passo (`stepDurationMs`) são
injetáveis — é o que permite testar os três status de forma determinística.

**Nenhum componente de interface inventa resultados.** Todo resultado simulado nasce no serviço.

### Regra de decisão do status

Em `resolveVerificationStatus.ts`, coberta por testes:

- `rejected` — nada reconhecido, **ou** dois ou mais equipamentos ausentes, **ou** ausência com menos
  de três equipamentos exigidos;
- `warning` — tudo presente porém com confiança média abaixo de 70%, **ou** exatamente um ausente
  entre três ou mais exigidos;
- `approved` — nenhum ausente e confiança acima do limiar.

Um item só conta como detectado com confiança **≥ 60%**. A regra é conservadora de propósito: na
dúvida, exige revisão humana.

---

## Integrando a IA de detecção

1. Preencha a variável de ambiente:

   ```env
   VITE_EPI_API_URL=https://sua-api.exemplo/v1
   ```

2. Pronto. `getEpiVerificationService()` passa a devolver `ApiEpiVerificationService`
   automaticamente. **Nenhuma tela, hook ou componente muda.**

O `ApiEpiVerificationService` assume o fluxo mais comum para inferência em vídeo ao vivo:

| Passo | Requisição | Resposta esperada |
| --- | --- | --- |
| Abrir sessão | `POST {BASE}/verifications` com `{ requiredItems: string[] }` | `{ "sessionId": "..." }` |
| Acompanhar | `GET {BASE}/verifications/{sessionId}` (repetido) | ver abaixo |

```jsonc
{
  "state": "running",          // "running" | "completed" | "failed"
  "progress": 0.43,            // aceita 0–1 ou 0–100
  "items": [
    { "id": "capacete", "detected": true, "confidence": 0.97 }
  ],
  "durationMs": 4300,          // opcional
  "verifiedAt": "2026-08-03T15:32:00.000Z", // opcional
  "message": "..."             // usado quando state = "failed"
}
```

Se o backend adotar outro contrato — WebSocket, SSE ou envio de frames —, **só dois arquivos mudam**:
`services/ApiEpiVerificationService.ts` e `utils/mapVerificationResponse.ts`. O mapeador já descarta
itens desconhecidos, normaliza a confiança e lança `AppError('invalid_response')` para respostas fora
do formato.

---

## Armazenamento local

Nenhuma tela chama o `localStorage` diretamente. O acesso passa por `storageClient` e, acima dele,
por repositórios:

| Repositório | Responsabilidade |
| --- | --- |
| `verificationHistoryRepository` | Histórico das verificações (máx. 200, mais recentes primeiro) |
| `epiSettingsRepository` | Equipamentos exigidos na verificação |
| `usersRepository` | Cadastro local de operadores |

Todos validam o conteúdo lido e descartam registros corrompidos.

---

## Área administrativa

Acessível pelo botão **Admin** na tela inicial. Credenciais de demonstração exibidas na própria tela:
`admin` / `admin` (autenticação simulada, **apenas em memória** — recarregar exige novo login).

| Seção | O que faz |
| --- | --- |
| **Dashboard** | Verificações de hoje e da semana, taxa de conformidade, gráfico de barras conformes × não conformes, rosca de resultado geral e ranking de EPIs mais ausentes |
| **Usuários** | Busca, cadastro, edição e remoção de operadores, com validação por React Hook Form + Zod |
| **EPIs Ativos** | Liga/desliga cada equipamento exigido, com pré-visualização em tempo real |
| **Histórico** | Verificações registradas, com acesso aos detalhes, remoção individual e limpeza total |

Duas decisões de projeto que diferem do protótipo:

1. **O histórico fica no admin, não na tela pública** — num terminal de entrada, qualquer pessoa
   veria as verificações alheias.
2. **Os indicadores são calculados a partir do histórico real** do terminal; no protótipo web eram
   números fixos.

---

## Qualidade: testes, lint e tipos

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm test
```

Outros scripts: `lint:fix`, `format`, `format:check`, `test:watch`, `preview`.

### Cobertura de testes

72 testes em 10 suítes, cobrindo:

- transformação da resposta da API (`mapVerificationResponse`, incluindo progresso e falhas);
- montagem do resultado e separação detectados × ausentes (`buildVerificationResult`);
- regra de status aprovado / atenção / reprovado (`resolveVerificationStatus`);
- serviço simulado: seis cenários, emissão de progresso, item corrente e cancelamento;
- repositórios de histórico e de configuração (limite, remoção, dados corrompidos);
- indicadores do dashboard;
- componentes de resultado (`ResultSummary`, `EpiChecklist`), incluindo acessibilidade.

---

## Instalação no totem

1. `npm run build` gera a pasta `dist/`, que é estática.
2. Sirva `dist/` em qualquer servidor web. Configure o **fallback para `index.html`** (SPA), senão
   recarregar em `/resultado/:id` devolve 404.
3. No totem, abra o navegador em modo quiosque:

```bash
chrome --kiosk --app=http://localhost:4173
```

---

## Limitações atuais

- **A detecção não é real.** Todo resultado vem do serviço simulado; a IA ainda não está integrada.
- **Não há câmera.** Conforme definido, o visor mostra a silhueta animada do protótipo, sem captura
  de vídeo. Quando a IA entrar, o visor pode passar a exibir o vídeo ao vivo.
- **Não há backend.** Autenticação, operadores, histórico e configuração são locais ao navegador do
  terminal; limpar os dados do site apaga tudo.
- **A sessão admin não persiste** entre recarregamentos — proposital num terminal público.
- **O layout é pensado para paisagem** (a partir de ~900 px). Abaixo disso ele empilha e continua
  utilizável, mas não é o cenário de uso.
- **Sem controle de acesso real:** o terminal informa o resultado, mas não aciona catraca, porta ou
  qualquer travamento físico.

## Próximos passos sugeridos

1. Integrar a IA de detecção preenchendo `VITE_EPI_API_URL`.
2. Exibir o vídeo ao vivo no visor, com as caixas de detecção sobrepostas.
3. Identificar a pessoa (crachá, QR Code ou reconhecimento facial) e vincular a verificação ao
   operador cadastrado.
4. Backend com autenticação real, papéis e histórico centralizado entre terminais.
5. Acionamento físico da catraca/porta quando o acesso for liberado.
6. Exportar relatórios de inspeção em PDF ou CSV.
7. Indicador de conectividade com a IA na barra de status.
8. Testes de ponta a ponta do fluxo do terminal (Playwright).
9. Modo alto contraste e ajuste de tamanho de fonte para acessibilidade em campo.
