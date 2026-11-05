package br.pucminas.aluguelcarros.repository;

import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.StatusPedido;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface PedidoAluguelRepository extends JpaRepository<PedidoAluguel, Long> {

    @EntityGraph(attributePaths = {"cliente", "automovel", "automovel.proprietario", "agenteAvaliador"})
    List<PedidoAluguel> findByClienteIdOrderByCriadoEmDesc(Long clienteId);

    @EntityGraph(attributePaths = {"cliente", "automovel", "automovel.proprietario", "agenteAvaliador"})
    List<PedidoAluguel> findAllByOrderByCriadoEmDesc();

    @EntityGraph(attributePaths = {"cliente", "automovel", "automovel.proprietario", "agenteAvaliador"})
    List<PedidoAluguel> findByStatusOrderByCriadoEmDesc(StatusPedido status);

    long countByStatus(StatusPedido status);

    long countByClienteIdAndStatus(Long clienteId, StatusPedido status);

    boolean existsByClienteIdAndStatusIn(Long clienteId, Collection<StatusPedido> status);

    boolean existsByAutomovelId(Long automovelId);

    long countByClienteId(Long clienteId);

    /**
     * Totais do dashboard do agente em UMA consulta:
     * [contratos, contratos com crédito, valor financiado, clientes, automóveis, valor contratado].
     */
    @Query(value = """
            select (select count(*) from contratos),
                   (select count(*) from contratos_credito),
                   (select coalesce(sum(valor_financiado), 0) from contratos_credito),
                   (select count(*) from clientes),
                   (select count(*) from automoveis),
                   (select coalesce(sum(valor_estimado), 0) from pedidos_aluguel where status = 'CONTRATADO')
            """, nativeQuery = true)
    List<Object[]> totaisDoAgente();

    /** Contagem por status em uma única consulta (dashboard). */
    @Query("select p.status, count(p) from PedidoAluguel p group by p.status")
    List<Object[]> contarPorStatus();

    @Query("select p.status, count(p) from PedidoAluguel p where p.cliente.id = :clienteId group by p.status")
    List<Object[]> contarPorStatusDoCliente(@Param("clienteId") Long clienteId);

    @Query("select coalesce(sum(p.valorEstimado), 0) from PedidoAluguel p where p.status = :status")
    java.math.BigDecimal somarValorPorStatus(@Param("status") StatusPedido status);

    @Query("""
            select coalesce(sum(p.valorEstimado), 0) from PedidoAluguel p
            where p.status = :status and p.cliente.id = :clienteId
            """)
    java.math.BigDecimal somarValorPorStatusDoCliente(@Param("status") StatusPedido status,
                                                      @Param("clienteId") Long clienteId);

    /** Verifica se o automóvel já está reservado (pedido ativo) em um período que se sobrepõe ao informado. */
    @Query("""
            select count(p) > 0 from PedidoAluguel p
            where p.automovel.id = :automovelId
              and p.status in :statusAtivos
              and (:ignorarId is null or p.id <> :ignorarId)
              and p.dataInicio < :fim
              and p.dataFim > :inicio
            """)
    boolean existeConflitoDePeriodo(@Param("automovelId") Long automovelId,
                                    @Param("inicio") LocalDate inicio,
                                    @Param("fim") LocalDate fim,
                                    @Param("statusAtivos") Collection<StatusPedido> statusAtivos,
                                    @Param("ignorarId") Long ignorarId);
}
