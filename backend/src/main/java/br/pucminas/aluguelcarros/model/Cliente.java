package br.pucminas.aluguelcarros.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/** Contratante do aluguel (usuário individual). */
@Entity
@Table(name = "clientes")
@PrimaryKeyJoinColumn(name = "usuario_id")
@Getter
@Setter
@NoArgsConstructor
public class Cliente extends Usuario {

    public static final int MAX_RENDIMENTOS = 3;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String rg;

    /** CPF somente com dígitos (11). */
    @NotBlank
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 dígitos")
    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String profissao;

    /** Entidades empregadoras e rendimentos auferidos (máximo 3; regra validada no service). */
    @Valid
    @Size(max = MAX_RENDIMENTOS, message = "O cliente pode ter no máximo 3 rendimentos")
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<Rendimento> rendimentos = new ArrayList<>();

    public Cliente(String login, String senha, String nome, String endereco,
                   String rg, String cpf, String profissao) {
        super(login, senha, nome, endereco, Papel.CLIENTE);
        this.rg = rg;
        this.cpf = cpf;
        this.profissao = profissao;
    }

    public void adicionarRendimento(Rendimento rendimento) {
        rendimento.setCliente(this);
        rendimentos.add(rendimento);
    }

    public void removerRendimento(Rendimento rendimento) {
        rendimentos.remove(rendimento);
        rendimento.setCliente(null);
    }

    public void limparRendimentos() {
        rendimentos.forEach(r -> r.setCliente(null));
        rendimentos.clear();
    }
}
