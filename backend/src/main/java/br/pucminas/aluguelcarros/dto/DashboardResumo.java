package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.StatusPedido;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Contadores para os painéis do frontend.
 * Para o cliente, os números se referem só aos pedidos dele; campos globais ficam nulos.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record DashboardResumo(
        String escopo,
        Map<StatusPedido, Long> pedidosPorStatus,
        long totalPedidos,
        long totalContratos,
        BigDecimal valorContratado,
        Long contratosComCredito,
        BigDecimal valorFinanciado,
        Long totalClientes,
        Long totalAutomoveis
) {
}
