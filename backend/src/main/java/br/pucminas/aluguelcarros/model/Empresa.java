package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.NoArgsConstructor;

/** Agente do tipo empresa (locadora). */
@Entity
@Table(name = "empresas")
@PrimaryKeyJoinColumn(name = "agente_id")
@NoArgsConstructor
public class Empresa extends Agente {

    public Empresa(String login, String senha, String nome, String endereco, String cnpj) {
        super(login, senha, nome, endereco, Papel.EMPRESA, cnpj);
    }
}
