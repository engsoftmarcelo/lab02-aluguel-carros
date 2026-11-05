package br.pucminas.aluguelcarros.dto;

import java.time.Instant;

/** Resposta de login/cadastro: token JWT + dados do usuário. */
public record LoginResponse(String token, String tipo, Instant expiraEm, UsuarioResponse usuario) {

    public static LoginResponse bearer(String token, Instant expiraEm, UsuarioResponse usuario) {
        return new LoginResponse(token, "Bearer", expiraEm, usuario);
    }
}
