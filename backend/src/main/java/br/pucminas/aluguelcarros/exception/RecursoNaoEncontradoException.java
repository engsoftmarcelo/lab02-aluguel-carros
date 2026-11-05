package br.pucminas.aluguelcarros.exception;

/** Recurso inexistente (HTTP 404). */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }

    public static RecursoNaoEncontradoException de(String recurso, Object id) {
        return new RecursoNaoEncontradoException(recurso + " " + id + " não encontrado(a).");
    }
}
