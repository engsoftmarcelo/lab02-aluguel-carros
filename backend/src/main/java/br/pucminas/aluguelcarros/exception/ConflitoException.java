package br.pucminas.aluguelcarros.exception;

/** Dado duplicado, ex.: login, CPF, CNPJ ou placa já cadastrados (HTTP 409). */
public class ConflitoException extends RuntimeException {

    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
