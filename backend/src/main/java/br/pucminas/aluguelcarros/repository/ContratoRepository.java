package br.pucminas.aluguelcarros.repository;

import br.pucminas.aluguelcarros.model.Contrato;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContratoRepository extends JpaRepository<Contrato, Long> {

    boolean existsByPedidoId(Long pedidoId);

    Optional<Contrato> findByPedidoId(Long pedidoId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"pedido", "pedido.cliente", "pedido.automovel", "pedido.automovel.proprietario"})
    List<Contrato> findByPedidoClienteIdOrderByDataAssinaturaDesc(Long clienteId);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"pedido", "pedido.cliente", "pedido.automovel", "pedido.automovel.proprietario"})
    List<Contrato> findAllByOrderByDataAssinaturaDesc();

    long countByPedidoClienteId(Long clienteId);

    /** Pares [pedidoId, contratoId] para montar listas de pedidos sem N+1. */
    @org.springframework.data.jpa.repository.Query("select c.pedido.id, c.id from Contrato c where c.pedido.id in :pedidoIds")
    List<Object[]> idsPorPedido(@org.springframework.data.repository.query.Param("pedidoIds") java.util.Collection<Long> pedidoIds);

    @org.springframework.data.jpa.repository.Query("select count(c) from ContratoCredito c")
    long contarComCredito();

    @org.springframework.data.jpa.repository.Query(
            "select coalesce(sum(c.valorFinanciado), 0) from ContratoCredito c")
    java.math.BigDecimal somarValorFinanciado();
}
