package br.pucminas.aluguelcarros.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/** Cadastro/edição de automóvel. O ano máximo (ano atual + 1) é validado no service. */
public record AutomovelRequest(
        @NotBlank(message = "Informe a matrícula") @Size(max = 30)
        String matricula,

        @NotNull(message = "Informe o ano") @Min(value = 1950, message = "Ano deve ser a partir de 1950")
        Integer ano,

        @NotBlank(message = "Informe a marca") @Size(max = 60)
        String marca,

        @NotBlank(message = "Informe o modelo") @Size(max = 60)
        String modelo,

        /* Padrão antigo (ABC1234 / ABC-1234) ou Mercosul (ABC1D23). */
        @NotBlank(message = "Informe a placa")
        @Pattern(regexp = "^[A-Za-z]{3}-?\\d[A-Za-z0-9]\\d{2}$",
                message = "Placa inválida (use ABC1234 ou o padrão Mercosul ABC1D23)")
        String placa,

        @NotNull(message = "Informe o valor da diária")
        @DecimalMin(value = "0.01", message = "A diária deve ser maior que zero")
        @DecimalMax(value = "99999.99", message = "Diária muito alta")
        BigDecimal valorDiaria
) {
}
