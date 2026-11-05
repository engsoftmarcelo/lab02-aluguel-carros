package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/** Pedido de aluguel feito por um cliente e analisado pelos agentes. */
@Entity
@Table(name = "pedidos_aluguel")
@Getter
@Setter
@NoArgsConstructor
public class PedidoAluguel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "automovel_id", nullable = false)
    private Automovel automovel;

    @NotNull
    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @NotNull
    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    @NotNull
    @Column(name = "valor_estimado", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorEstimado;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusPedido status = StatusPedido.EM_ANALISE;

    /** Parecer financeiro do agente ao avaliar o pedido. */
    @Size(max = 1000)
    @Column(length = 1000)
    private String parecer;

    /** Agente (empresa ou banco) que avaliou o pedido. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agente_avaliador_id")
    private Agente agenteAvaliador;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void prePersist() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
        if (status == null) {
            status = StatusPedido.EM_ANALISE;
        }
    }

    /** Quantidade de diárias do período (mínimo 1). */
    public long quantidadeDiarias() {
        return Math.max(1, ChronoUnit.DAYS.between(dataInicio, dataFim));
    }

    /** Recalcula o valor estimado: diárias × valor da diária do automóvel. */
    public void recalcularValorEstimado() {
        this.valorEstimado = automovel.getValorDiaria().multiply(BigDecimal.valueOf(quantidadeDiarias()));
    }
}
