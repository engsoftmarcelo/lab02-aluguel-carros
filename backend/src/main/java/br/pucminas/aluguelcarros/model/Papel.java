package br.pucminas.aluguelcarros.model;

/** Papel do usuário no sistema; define o que ele pode fazer. */
public enum Papel {
    CLIENTE,
    EMPRESA,
    BANCO;

    public boolean isAgente() {
        return this == EMPRESA || this == BANCO;
    }
}
