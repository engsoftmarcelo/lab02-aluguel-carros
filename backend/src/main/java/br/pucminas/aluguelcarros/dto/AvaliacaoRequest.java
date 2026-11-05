package br.pucminas.aluguelcarros.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Parecer financeiro do agente: aprovado (true) ou reprovado (false). */
public record AvaliacaoRequest(
        @NotNull(message = "Informe se o pedido foi aprovado")
        Boolean aprovado,

        @NotBlank(message = "O parecer é obrigatório")
        @Size(max = 1000, message = "O parecer pode ter no máximo 1000 caracteres")
        String parecer
) {
}
