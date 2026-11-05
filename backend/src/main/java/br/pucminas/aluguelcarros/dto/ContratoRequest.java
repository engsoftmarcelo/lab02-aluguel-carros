package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.TipoProprietario;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Geração do contrato a partir de um pedido aprovado.
 * {@code credito} é opcional e só pode ser informado por um usuário BANCO.
 */
public record ContratoRequest(
        @NotNull(message = "Informe a quem o automóvel pertencerá (CLIENTE, EMPRESA ou BANCO)")
        TipoProprietario tipoPropriedade,

        @Valid
        Credito credito
) {

    public record Credito(
            @NotNull(message = "Informe o valor financiado")
            @DecimalMin(value = "0.01", message = "O valor financiado deve ser maior que zero")
            BigDecimal valorFinanciado,

            @NotNull(message = "Informe a taxa de juros mensal")
            @DecimalMin(value = "0.00", message = "A taxa de juros não pode ser negativa")
            @DecimalMax(value = "20.00", message = "Taxa de juros mensal acima do permitido (20%)")
            BigDecimal taxaJuros,

            @NotNull(message = "Informe o número de parcelas")
            @Min(value = 1, message = "Mínimo de 1 parcela")
            @Max(value = 120, message = "Máximo de 120 parcelas")
            Integer parcelas
    ) {
    }
}
