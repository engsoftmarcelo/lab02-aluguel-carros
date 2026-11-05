package br.pucminas.aluguelcarros.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/** Criação ou modificação de pedido de aluguel. Regras de datas são validadas no service. */
public record PedidoRequest(
        @NotNull(message = "Escolha o automóvel")
        Long automovelId,

        @NotNull(message = "Informe a data de início")
        LocalDate dataInicio,

        @NotNull(message = "Informe a data de devolução")
        LocalDate dataFim
) {
}
