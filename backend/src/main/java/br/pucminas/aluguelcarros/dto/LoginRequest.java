package br.pucminas.aluguelcarros.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Informe o e-mail") String login,
        @NotBlank(message = "Informe a senha") String senha
) {
}
