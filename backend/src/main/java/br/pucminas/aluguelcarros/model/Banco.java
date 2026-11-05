package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

/** Agente do tipo banco: além de avaliar, pode conceder contratos de crédito. */
@Entity
@Table(name = "bancos")
@PrimaryKeyJoinColumn(name = "agente_id")
@NoArgsConstructor
public class Banco extends Agente {

    public Banco(String login, String senha, String nome, String endereco, String cnpj) {
        super(login, senha, nome, endereco, Papel.BANCO, cnpj);
    }
}
