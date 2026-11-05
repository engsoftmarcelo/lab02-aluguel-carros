# Evolução dos modelos UML: v1 → v2

| Versão | Pasta | Quando | Base |
|---|---|---|---|
| **v1** | [`v1/`](v1/) | Início do projeto (modelagem inicial) | Enunciado e histórias de usuário |
| **v2** | [`v2/`](v2/) | Fim do desenvolvimento | Código final (`backend/` e `frontend/`) |

A v1 foi mantida intacta para registrar a evolução. A v2 reflete **exatamente** as classes, atributos, enums e pacotes do código.

---

## 1. Diagrama de classes ([v1](v1/classes.png) → [v2](v2/classes.png))

| # | Mudança | Por quê |
|---|---|---|
| C1 | **`Automovel.valorDiaria : BigDecimal`** adicionado | A v1 tinha `PedidoAluguel.valorEstimado`, mas nenhuma informação de preço para calculá-lo. Sem a diária não haveria como estimar o valor do aluguel nem financiá-lo. |
| C2 | **`PedidoAluguel.quantidadeDiarias()`** e **`recalcularValorEstimado()`** adicionados; `modificar()` e `cancelar()` saíram da entidade | O cálculo do valor é responsabilidade do próprio pedido. As **transições de status** (quem pode modificar, cancelar, avaliar, em qual status) dependem do usuário logado e de outras entidades, então ficaram no **`PedidoService`**, seguindo o MVC (regra de negócio na camada de serviço, entidade como modelo). |
| C3 | `Agente.avaliarPedido()` e `Banco.concederCredito()` **removidos** das entidades | Mesmo motivo: a avaliação está em `PedidoService.avaliar()` e o crédito em `ContratoService.gerar()`. As entidades `Empresa` e `Banco` passaram a existir para **identificar o papel** (herança JOINED) e para a associação `ContratoCredito → Banco`. |
| C4 | **`ContratoCredito.valorParcela()`** e o estático **`calcularParcela()`** (Tabela Price) | O enunciado prevê o contrato de crédito; a parcela é calculada a partir de `valorFinanciado`, `taxaJuros` (definida como **% ao mês**) e `parcelas`. |
| C5 | **`Papel.isAgente()`** e constante **`Cliente.MAX_RENDIMENTOS = 3`** | Centralizam regras usadas em vários pontos (autorização e limite de rendimentos). |
| C6 | `Cliente.limparRendimentos()` e o atributo de volta **`Rendimento.cliente`** | Necessários para o mapeamento bidirecional JPA (`@OneToMany(mappedBy)`) e para substituir a lista de rendimentos na edição. |
| C7 | Restrições explícitas nos atributos: `login`, `cpf`, `cnpj`, `placa` e `matricula` **únicos**; CPF com 11 e CNPJ com 14 dígitos; placa no padrão `ABC1D23` | Aparecem como `unique` no banco e como validação nos DTOs; documentadas no diagrama para alinhar modelo e código. |
| C8 | Estereótipos `<<Entity>>` com o **nome real das tabelas** e a estratégia **JOINED** (`usuarios`, `clientes`, `agentes`, `empresas`, `bancos`; `contratos` + `contratos_credito`) | Deixa explícito o mapeamento objeto-relacional adotado no Supabase. |
| C9 | Associação `Contrato → PedidoAluguel` com a navegabilidade correta (o contrato conhece o pedido, 1:1) e `PedidoAluguel → Cliente` (muitos para um) | Corresponde às chaves estrangeiras reais (`contratos.pedido_id`, `pedidos_aluguel.cliente_id`). |

## 2. Diagrama de pacotes ([v1](v1/pacotes.png) → [v2](v2/pacotes.png))

| # | Mudança | Por quê |
|---|---|---|
| P1 | Cada pacote agora **lista as classes reais** (controllers, services, repositories, DTOs, entidades, segurança, configuração, exceções) | Rastreabilidade direta entre o modelo de arquitetura e o código. |
| P2 | Pacote **`config`** detalhado: `SecurityConfig`, `CorsConfig`, `ClockConfig` (relógio injetável para testes de datas) e `DataSeeder` (contas de demonstração) | Não estavam previstos na v1. |
| P3 | **`security`** com `JwtService`, `JwtAuthFilter`, `UsuarioAutenticado`, `RespostasSeguranca` | Autenticação stateless com JWT. Na v2 o filtro monta o usuário a partir das *claims* assinadas do token (sem consultar o banco a cada requisição), por causa da latência do Supabase. |
| P4 | Novas dependências: `service → security` (o usuário logado entra nas regras), `dto → model` (DTOs constroem-se a partir das entidades) e `exception → dto` | Refletem os imports reais. |
| P5 | Frontend ganhou **`routes`** (`RotaProtegida`), **`hooks`** (`useCarregar`) e **`utils`** (`formato`), e o `components` foi dividido em `ui`, `layout`, `pedido` e `forms` | Organização que surgiu na implementação: proteção de rotas por papel, carregamento padronizado e máscaras/formatação. |
| P6 | Conexão com o Supabase identificada como **Session pooler (JDBC)** | A conexão direta só tem IPv6 e não funcionava na rede usada. |

## 3. Diagrama de casos de uso ([v1](v1/casos-de-uso.png) → [v2](v2/casos-de-uso.png))

| # | Mudança | Por quê |
|---|---|---|
| U1 | **UC15 Consultar painel** (resumo por status) | Os painéis do cliente e do agente usam `GET /api/dashboard/resumo`. |
| U2 | Caso incluído **"Verificar disponibilidade do automóvel no período"** em UC07 e UC09 | Regra descoberta na implementação: o mesmo carro não pode ter dois pedidos ativos com datas sobrepostas. |
| U3 | **UC04 Manter clientes** passa a incluir "Gerenciar rendimentos" | O agente também edita os rendimentos do cliente. |
| U4 | UC01 explicita **cliente ou agente**; UC02 explicita **JWT**; UC03 inclui **excluir conta** | Funcionalidades implementadas. |
| U5 | Legenda atualizada: o agente pode modificar pedidos **em análise ou aprovados**; UC12 leva o pedido a **CONTRATADO** | Regras finais do `PedidoService` e do `ContratoService`. |

## 4. Histórias de usuário

As histórias em [`docs/historias/historias-de-usuario.md`](../historias/historias-de-usuario.md) continuam válidas. Todas as 20 (US01–US20) foram implementadas. Os critérios de aceitação de US11 e US13 ganharam, na prática, a verificação de disponibilidade do automóvel (U2).
