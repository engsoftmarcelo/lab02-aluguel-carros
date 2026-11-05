package br.pucminas.aluguelcarros.model;

/**
 * Ciclo de vida do pedido de aluguel.
 * EM_ANALISE → APROVADO → CONTRATADO; EM_ANALISE → REPROVADO; EM_ANALISE → CANCELADO.
 */
public enum StatusPedido {
    EM_ANALISE,
    APROVADO,
    REPROVADO,
    CANCELADO,
    CONTRATADO
}
