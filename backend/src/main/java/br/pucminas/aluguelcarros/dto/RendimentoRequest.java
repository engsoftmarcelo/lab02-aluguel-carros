package br.pucminas.aluguelcarros.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record RendimentoRequest(
        @NotBlank(message = "Informe a entidade empregadora")
        @Size(max = 120)
        String entidadeEmpregadora,

        @NotNull(message = "Informe o valor do rendimento")
        @DecimalMin(value = "0.00", message = "O rendimento não pode ser negativo")
        BigDecimal valor
) {
}
