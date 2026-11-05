package br.pucminas.aluguelcarros.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.Map;

/** Corpo padrão de erro devolvido pela API. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErroResponse(
        OffsetDateTime timestamp,
        int status,
        String erro,
        String mensagem,
        String caminho,
        Map<String, String> campos
) {
}
