# Histórias de Usuário — Sistema de Aluguel de Carros

> Versão 1 (modelagem inicial). Atores: **Visitante** (usuário não autenticado), **Cliente**, **Agente** (generalização de **Empresa** e **Banco**).
>
> Prioridade: **Alta** = exigida no enunciado para o protótipo · **Média** = completa o fluxo de negócio.

## Épico 1 — Acesso ao sistema

### US01 — Cadastro de cliente
**Como** visitante, **quero** me cadastrar como cliente informando meus dados pessoais e rendimentos, **para** poder solicitar aluguéis de automóveis.

Critérios de aceitação:
- [ ] Campos obrigatórios: nome, login (e-mail), senha, RG, CPF, endereço e profissão.
- [ ] Posso informar de 0 a **3** rendimentos (entidade empregadora + valor); o sistema bloqueia o 4º.
- [ ] Login e CPF são únicos; se já existirem, recebo uma mensagem clara.
- [ ] A senha é armazenada criptografada (BCrypt), nunca em texto puro.
- [ ] Após o cadastro, posso fazer login.

Prioridade: Alta

### US02 — Cadastro de agente
**Como** visitante que representa uma empresa ou um banco, **quero** me cadastrar como agente informando o CNPJ e o tipo (Empresa ou Banco), **para** avaliar pedidos de aluguel.

Critérios de aceitação:
- [ ] Campos obrigatórios: nome, login (e-mail), senha, endereço, CNPJ e tipo (Empresa/Banco).
- [ ] O CNPJ é único.
- [ ] O tipo escolhido define o papel do usuário (`EMPRESA` ou `BANCO`).

Prioridade: Alta

### US03 — Login
**Como** usuário cadastrado (cliente ou agente), **quero** entrar no sistema com login e senha, **para** acessar as funcionalidades do meu perfil.

Critérios de aceitação:
- [ ] Credenciais válidas → acesso liberado e redirecionamento para o painel do meu papel.
- [ ] Credenciais inválidas → mensagem de erro genérica, sem revelar qual campo está errado.
- [ ] Nenhuma tela ou endpoint do sistema (exceto landing, cadastro e login) é acessível sem autenticação.
- [ ] Cliente não acessa funcionalidades de agente, e vice-versa.

Prioridade: Alta

### US04 — Logout
**Como** usuário autenticado, **quero** sair do sistema, **para** que ninguém use minha sessão.

Critérios de aceitação:
- [ ] Ao sair, o token é descartado e volto para a tela inicial.
- [ ] Depois do logout, as rotas protegidas exigem novo login.

Prioridade: Média

## Épico 2 — CRUD de cliente

### US05 — Consultar meus dados
**Como** cliente, **quero** ver meus dados cadastrais e rendimentos, **para** conferir se estão corretos.

Critérios de aceitação:
- [ ] Vejo nome, login, RG, CPF, endereço, profissão e rendimentos.
- [ ] Não consigo ver dados de outros clientes.

Prioridade: Alta

### US06 — Atualizar meus dados e rendimentos
**Como** cliente, **quero** editar meus dados e adicionar, alterar ou remover rendimentos, **para** manter meu cadastro atualizado para a análise financeira.

Critérios de aceitação:
- [ ] Posso alterar nome, endereço, profissão e rendimentos.
- [ ] O sistema impede mais de **3** rendimentos.
- [ ] CPF continua único após a edição.

Prioridade: Alta

### US07 — Excluir minha conta
**Como** cliente, **quero** excluir meu cadastro, **para** deixar de usar o sistema.

Critérios de aceitação:
- [ ] O sistema pede confirmação antes de excluir.
- [ ] Não é possível excluir se houver pedido em andamento (`EM_ANALISE`, `APROVADO`) ou contrato ativo; o motivo é informado.

Prioridade: Média

### US08 — Gerenciar clientes (agente)
**Como** agente, **quero** listar, consultar, editar e excluir clientes, **para** apoiar a análise financeira e manter a base correta.

Critérios de aceitação:
- [ ] Vejo a lista de clientes com busca por nome ou CPF.
- [ ] Vejo os rendimentos de cada cliente.
- [ ] As mesmas validações de US06 e US07 se aplicam.

Prioridade: Alta

## Épico 3 — Automóveis

### US09 — Cadastrar e manter automóveis
**Como** agente, **quero** cadastrar, editar e remover automóveis informando matrícula, ano, marca, modelo e placa, **para** que fiquem disponíveis para aluguel.

Critérios de aceitação:
- [ ] Campos obrigatórios: matrícula, ano, marca, modelo, placa.
- [ ] Placa e matrícula são únicas; o ano não pode ser maior que o ano seguinte ao atual.
- [ ] O automóvel nasce como propriedade do agente que o cadastrou.
- [ ] Cliente não pode cadastrar, editar ou remover automóveis.

Prioridade: Alta

### US10 — Consultar automóveis
**Como** usuário autenticado, **quero** ver os automóveis disponíveis, **para** escolher qual alugar.

Critérios de aceitação:
- [ ] Vejo marca, modelo, ano e placa de cada automóvel.
- [ ] Posso filtrar por marca/modelo.

Prioridade: Alta

## Épico 4 — Pedidos de aluguel (cliente)

### US11 — Criar pedido de aluguel
**Como** cliente, **quero** criar um pedido escolhendo um automóvel e o período, **para** solicitar o aluguel.

Critérios de aceitação:
- [ ] Informo automóvel, data de início e data de fim.
- [ ] A data de início não pode estar no passado, e a data de fim deve ser posterior à de início.
- [ ] O sistema calcula e mostra o valor estimado.
- [ ] O pedido é criado com status `EM_ANALISE`.

Prioridade: Alta

### US12 — Consultar meus pedidos e status
**Como** cliente, **quero** ver meus pedidos e o status de cada um, **para** acompanhar a análise.

Critérios de aceitação:
- [ ] Vejo a lista dos meus pedidos com automóvel, período, valor e status.
- [ ] No detalhe, vejo o parecer do agente (quando houver) e a linha do tempo do status.
- [ ] Não vejo pedidos de outros clientes.

Prioridade: Alta

### US13 — Modificar pedido
**Como** cliente, **quero** alterar o automóvel ou as datas de um pedido, **para** corrigir a solicitação antes da análise.

Critérios de aceitação:
- [ ] Só é possível modificar pedidos em `EM_ANALISE`.
- [ ] As mesmas validações de datas de US11 se aplicam, e o valor estimado é recalculado.

Prioridade: Alta

### US14 — Cancelar pedido
**Como** cliente, **quero** cancelar um pedido, **para** desistir do aluguel.

Critérios de aceitação:
- [ ] Só é possível cancelar pedidos em `EM_ANALISE`.
- [ ] O sistema pede confirmação.
- [ ] O status passa a `CANCELADO` e o pedido não pode mais ser alterado.

Prioridade: Alta

## Épico 5 — Análise pelos agentes

### US15 — Consultar pedidos para análise
**Como** agente, **quero** listar os pedidos, filtrando por status, **para** priorizar minha análise.

Critérios de aceitação:
- [ ] Vejo todos os pedidos de todos os clientes.
- [ ] Posso filtrar por status (padrão: `EM_ANALISE`).
- [ ] No detalhe, vejo os dados financeiros do cliente (profissão, empregadores e rendimentos).

Prioridade: Alta

### US16 — Avaliar pedido
**Como** agente, **quero** aprovar ou reprovar um pedido com um parecer financeiro, **para** decidir se ele segue para contrato.

Critérios de aceitação:
- [ ] Só é possível avaliar pedidos em `EM_ANALISE`.
- [ ] O parecer é obrigatório.
- [ ] O status passa a `APROVADO` ou `REPROVADO`, e o sistema registra qual agente avaliou.
- [ ] O cliente passa a ver o novo status e o parecer.

Prioridade: Alta

### US17 — Modificar pedido (agente)
**Como** agente, **quero** ajustar o período ou o automóvel de um pedido, **para** adequá-lo às condições de aprovação.

Critérios de aceitação:
- [ ] Só é possível modificar pedidos em `EM_ANALISE` ou `APROVADO`.
- [ ] O valor estimado é recalculado.

Prioridade: Média

## Épico 6 — Contratos

### US18 — Gerar contrato
**Como** agente, **quero** transformar um pedido aprovado em contrato, definindo a quem pertencerá o automóvel, **para** executar o aluguel.

Critérios de aceitação:
- [ ] Só é possível para pedidos `APROVADO`.
- [ ] Informo o tipo de propriedade: `CLIENTE`, `EMPRESA` ou `BANCO`.
- [ ] O pedido passa a `CONTRATADO` e o proprietário do automóvel é atualizado conforme o tipo.
- [ ] O cliente vê o contrato na sua área.

Prioridade: Média

### US19 — Conceder contrato de crédito
**Como** banco, **quero** associar um crédito ao contrato de aluguel, informando valor financiado, taxa de juros e parcelas, **para** financiar o cliente.

Critérios de aceitação:
- [ ] Somente usuários do tipo `BANCO` podem conceder crédito.
- [ ] Valor financiado > 0, taxa ≥ 0, parcelas ≥ 1.
- [ ] O sistema mostra o valor da parcela calculada.
- [ ] O contrato fica registrado como contrato de crédito, vinculado ao banco concedente.

Prioridade: Média

### US20 — Consultar contratos
**Como** cliente, **quero** ver meus contratos, **para** acompanhar o que foi firmado. **Como** agente, **quero** ver todos os contratos, **para** gerir a carteira.

Critérios de aceitação:
- [ ] O cliente vê apenas os próprios contratos.
- [ ] O agente vê todos os contratos, com indicação de crédito quando houver.

Prioridade: Média

## Matriz história × caso de uso

| História | Caso de uso |
|---|---|
| US01, US02 | UC01 Cadastrar-se |
| US03, US04 | UC02 Autenticar-se |
| US05–US07 | UC03 Manter dados pessoais |
| US08 | UC04 Manter clientes |
| US09 | UC05 Manter automóveis |
| US10 | UC06 Consultar automóveis |
| US11 | UC07 Criar pedido |
| US12 | UC08 Consultar pedidos |
| US13, US17 | UC09 Modificar pedido |
| US14 | UC10 Cancelar pedido |
| US15, US16 | UC11 Avaliar pedido |
| US18 | UC12 Gerar contrato |
| US19 | UC13 Conceder crédito |
| US20 | UC14 Consultar contratos |
