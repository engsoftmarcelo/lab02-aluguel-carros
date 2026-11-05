package br.pucminas.aluguelcarros.exception;

/** Usuário autenticado tentando acessar recurso de outro usuário (HTTP 403). */
public class AcessoNegadoException extends RuntimeException {

    public AcessoNegadoException(String mensagem) {
        super(mensagem);
    }
}
