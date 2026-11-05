package br.pucminas.aluguelcarros.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Criação (por agente) e atualização de cliente.
 * Na atualização, {@code login} e {@code senha} são opcionais: se vierem vazios, não são alterados.
 */
public record ClienteRequest(
        @NotBlank(message = "Informe o nome") @Size(max = 120)
        String nome,

        @Email(message = "E-mail inválido") @Size(max = 120)
        String login,

        @Size(min = 6, max = 72, message = "A senha deve ter de 6 a 72 caracteres")
        String senha,

        @NotBlank(message = "Informe o endereço") @Size(max = 255)
        String endereco,

        @NotBlank(message = "Informe o RG") @Size(max = 20)
        String rg,

        @NotBlank(message = "Informe o CPF")
        @Pattern(regexp = "^\\d{3}\\.?\\d{3}\\.?\\d{3}-?\\d{2}$", message = "CPF inválido")
        String cpf,

        @NotBlank(message = "Informe a profissão") @Size(max = 100)
        String profissao,

        @Valid
        @Size(max = 3, message = "O cliente pode ter no máximo 3 rendimentos")
        List<RendimentoRequest> rendimentos
) {
}
