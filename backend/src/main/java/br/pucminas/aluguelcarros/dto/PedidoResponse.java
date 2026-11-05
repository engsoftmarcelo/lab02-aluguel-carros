package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Agente;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.Rendimento;
import br.pucminas.aluguelcarros.model.StatusPedido;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** Pedido com os dados que o cliente e o agente precisam ver (inclui o perfil financeiro do cliente). */
public record PedidoResponse(
        Long id,
        StatusPedido status,
        LocalDate dataInicio,
        LocalDate dataFim,
        long diarias,
        BigDecimal valorEstimado,
        String parecer,
        LocalDateTime criadoEm,
        Long clienteId,
        String clienteNome,
        String clienteCpf,
        String clienteProfissao,
        BigDecimal clienteRendaTotal,
        AutomovelResponse automovel,
        Long agenteAvaliadorId,
        String agenteAvaliadorNome,
        Long contratoId
) {

    public static PedidoResponse de(PedidoAluguel p, Long contratoId) {
        Cliente c = p.getCliente();
        Agente avaliador = p.getAgenteAvaliador();
        BigDecimal renda = c.getRendimentos().stream().map(Rendimento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new PedidoResponse(p.getId(), p.getStatus(), p.getDataInicio(), p.getDataFim(),
                p.quantidadeDiarias(), p.getValorEstimado(), p.getParecer(), p.getCriadoEm(),
                c.getId(), c.getNome(), c.getCpf(), c.getProfissao(), renda,
                AutomovelResponse.de(p.getAutomovel()),
                avaliador == null ? null : avaliador.getId(),
                avaliador == null ? null : avaliador.getNome(),
                contratoId);
    }
}
