package br.pucminas.aluguelcarros.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.LocalDate;

/** Contrato de aluguel associado a um crédito concedido por um banco agente. */
@Entity
@Table(name = "contratos_credito")
@PrimaryKeyJoinColumn(name = "contrato_id")
@Getter
@Setter
@NoArgsConstructor
public class ContratoCredito extends Contrato {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "banco_id", nullable = false)
    private Banco banco;

    @NotNull
    @DecimalMin(value = "0.01")
    @Column(name = "valor_financiado", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorFinanciado;

    /** Taxa de juros mensal em percentual (ex.: 1.99 = 1,99% a.m.). */
    @NotNull
    @DecimalMin(value = "0.00")
    @Column(name = "taxa_juros", nullable = false, precision = 6, scale = 3)
    private BigDecimal taxaJuros;

    @NotNull
    @Min(1)
    @Column(nullable = false)
    private Integer parcelas;

    public ContratoCredito(PedidoAluguel pedido, TipoProprietario tipoPropriedade, LocalDate dataAssinatura,
                           Banco banco, BigDecimal valorFinanciado, BigDecimal taxaJuros, Integer parcelas) {
        super(pedido, tipoPropriedade, dataAssinatura);
        this.banco = banco;
        this.valorFinanciado = valorFinanciado;
        this.taxaJuros = taxaJuros;
        this.parcelas = parcelas;
    }

    /** Valor da parcela pela Tabela Price: PV · i / (1 − (1 + i)^−n). */
    public BigDecimal valorParcela() {
        return calcularParcela(valorFinanciado, taxaJuros, parcelas);
    }

    public static BigDecimal calcularParcela(BigDecimal valor, BigDecimal taxaPercentualMensal, int parcelas) {
        if (taxaPercentualMensal.signum() == 0) {
            return valor.divide(BigDecimal.valueOf(parcelas), 2, RoundingMode.HALF_UP);
        }
        MathContext mc = MathContext.DECIMAL64;
        BigDecimal i = taxaPercentualMensal.divide(BigDecimal.valueOf(100), mc);
        BigDecimal fator = BigDecimal.ONE.add(i).pow(parcelas, mc);
        BigDecimal parcela = valor.multiply(i).multiply(fator).divide(fator.subtract(BigDecimal.ONE), mc);
        return parcela.setScale(2, RoundingMode.HALF_UP);
    }
}
