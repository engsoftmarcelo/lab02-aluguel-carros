package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Papel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Cadastro público de agente: tipo EMPRESA ou BANCO (CNPJ aceito com ou sem pontuação). */
public record RegistroAgenteRequest(
        @NotBlank(message = "Informe o nome") @Size(max = 120)
        String nome,

        @NotBlank(message = "Informe o e-mail") @Email(message = "E-mail inválido") @Size(max = 120)
        String login,

        @NotBlank(message = "Informe a senha") @Size(min = 6, max = 72, message = "A senha deve ter de 6 a 72 caracteres")
        String senha,

        @NotBlank(message = "Informe o endereço") @Size(max = 255)
        String endereco,

        @NotBlank(message = "Informe o CNPJ")
        @Pattern(regexp = "^\\d{2}\\.?\\d{3}\\.?\\d{3}/?\\d{4}-?\\d{2}$", message = "CNPJ inválido")
        String cnpj,

        @NotNull(message = "Informe o tipo de agente (EMPRESA ou BANCO)")
        Papel tipo
) {
}
