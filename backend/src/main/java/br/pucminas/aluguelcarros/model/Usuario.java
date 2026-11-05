package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Usuário do sistema. Só acessa o sistema após cadastro e login. */
@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Login do usuário (e-mail). */
    @NotBlank
    @Email
    @Size(max = 120)
    @Column(nullable = false, unique = true, length = 120)
    private String login;

    /** Hash BCrypt da senha (nunca texto puro). */
    @NotBlank
    @Column(nullable = false, length = 100)
    private String senha;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String nome;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String endereco;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Papel papel;

    protected Usuario(String login, String senha, String nome, String endereco, Papel papel) {
        this.login = login;
        this.senha = senha;
        this.nome = nome;
        this.endereco = endereco;
        this.papel = papel;
    }
}
