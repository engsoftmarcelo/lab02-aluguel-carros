package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.DashboardResumo;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.repository.AutomovelRepository;
import br.pucminas.aluguelcarros.repository.ClienteRepository;
import br.pucminas.aluguelcarros.repository.ContratoRepository;
import br.pucminas.aluguelcarros.repository.PedidoAluguelRepository;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.Map;

/** Números para os painéis: visão geral (agente) ou só os pedidos do cliente logado. */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PedidoAluguelRepository pedidoRepository;
    private final ContratoRepository contratoRepository;
    private final ClienteRepository clienteRepository;
    private final AutomovelRepository automovelRepository;

    @Transactional(readOnly = true)
    public DashboardResumo resumo(UsuarioAutenticado logado) {
        Map<StatusPedido, Long> porStatus = new EnumMap<>(StatusPedido.class);
        for (StatusPedido s : StatusPedido.values()) {
            porStatus.put(s, 0L);
        }
        if (logado.isAgente()) {
            // uma consulta agrupada em vez de uma por status (o banco fica longe: cada ida e volta custa ~150 ms)
            pedidoRepository.contarPorStatus().forEach(l -> porStatus.put((StatusPedido) l[0], (Long) l[1]));
            long total = porStatus.values().stream().mapToLong(Long::longValue).sum();
            Object[] t = pedidoRepository.totaisDoAgente().get(0);
            return new DashboardResumo("GERAL", porStatus, total, ((Number) t[0]).longValue(),
                    new java.math.BigDecimal(t[5].toString()), ((Number) t[1]).longValue(),
                    new java.math.BigDecimal(t[2].toString()), ((Number) t[3]).longValue(), ((Number) t[4]).longValue());
        }
        pedidoRepository.contarPorStatusDoCliente(logado.id()).forEach(l -> porStatus.put((StatusPedido) l[0], (Long) l[1]));
        return new DashboardResumo("CLIENTE", porStatus, porStatus.values().stream().mapToLong(Long::longValue).sum(),
                contratoRepository.countByPedidoClienteId(logado.id()),
                pedidoRepository.somarValorPorStatusDoCliente(StatusPedido.CONTRATADO, logado.id()),
                null, null, null, automovelRepository.count());
    }
}
