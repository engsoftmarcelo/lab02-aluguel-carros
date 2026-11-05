package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Agente (empresa ou banco): modifica e avalia pedidos de aluguel. */
@Entity
@Table(name = "agentes")
@PrimaryKeyJoinColumn(name = "usuario_id")
@Getter
@Setter
@NoArgsConstructor
public abstract class Agente extends Usuario {

    /** CNPJ somente com dígitos (14). */
    @NotBlank
    @Pattern(regexp = "\\d{14}", message = "CNPJ deve conter 14 dígitos")
    @Column(nullable = false, unique = true, length = 14)
    private String cnpj;

    protected Agente(String login, String senha, String nome, String endereco, Papel papel, String cnpj) {
        super(login, senha, nome, endereco, papel);
        this.cnpj = cnpj;
    }
}
