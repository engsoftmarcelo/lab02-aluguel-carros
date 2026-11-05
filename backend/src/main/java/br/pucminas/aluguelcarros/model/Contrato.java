package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

/** Contrato de aluguel gerado a partir de um pedido aprovado. */
@Entity
@Table(name = "contratos")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pedido_id", nullable = false, unique = true)
    private PedidoAluguel pedido;

    /** Define de quem o automóvel passa a ser propriedade. */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_propriedade", nullable = false, length = 20)
    private TipoProprietario tipoPropriedade;

    @NotNull
    @Column(name = "data_assinatura", nullable = false)
    private LocalDate dataAssinatura;

    public Contrato(PedidoAluguel pedido, TipoProprietario tipoPropriedade, LocalDate dataAssinatura) {
        this.pedido = pedido;
        this.tipoPropriedade = tipoPropriedade;
        this.dataAssinatura = dataAssinatura;
    }
}
