package br.pucminas.aluguelcarros.exception;

/** Violação de regra de negócio, ex.: 4º rendimento, transição de status inválida (HTTP 422). */
public class RegraNegocioException extends RuntimeException {

    public RegraNegocioException(String mensagem) {
        super(mensagem);
    }
}
