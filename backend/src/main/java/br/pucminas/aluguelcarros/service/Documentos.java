package br.pucminas.aluguelcarros.service;

/** Normalização de documentos e identificadores antes de persistir. */
public final class Documentos {

    private Documentos() {
    }

    /** Remove tudo que não for dígito (ex.: "123.456.789-09" → "12345678909"). */
    public static String somenteDigitos(String valor) {
        return valor == null ? null : valor.replaceAll("\\D", "");
    }

    /** Placa em maiúsculas, sem hífen/espaços (ex.: "abc-1d23" → "ABC1D23"). */
    public static String normalizarPlaca(String placa) {
        return placa == null ? null : placa.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
    }

    /** Login (e-mail) sem espaços e em minúsculas. */
    public static String normalizarLogin(String login) {
        return login == null ? null : login.trim().toLowerCase();
    }
}
