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
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Automóvel disponível para aluguel. */
@Entity
@Table(name = "automoveis")
@Getter
@Setter
@NoArgsConstructor
public class Automovel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 30)
    @Column(nullable = false, unique = true, length = 30)
    private String matricula;

    @NotNull
    @Min(1950)
    @Max(2100)
    @Column(nullable = false)
    private Integer ano;

    @NotBlank
    @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String marca;

    @NotBlank
    @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String modelo;

    /** Placa no padrão brasileiro antigo (ABC1234) ou Mercosul (ABC1D23), sem hífen. */
    @NotBlank
    @Size(min = 7, max = 7)
    @Column(nullable = false, unique = true, length = 7)
    private String placa;

    /**
     * Valor da diária. Acrescentado durante o desenvolvimento (não existia na v1 do
     * diagrama de classes) para permitir calcular o valor estimado do pedido.
     */
    @NotNull
    @DecimalMin(value = "0.01")
    @Column(name = "valor_diaria", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorDiaria;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_proprietario", nullable = false, length = 20)
    private TipoProprietario tipoProprietario;

    /** Usuário (cliente, empresa ou banco) registrado como proprietário. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietario_id")
    private Usuario proprietario;
}
