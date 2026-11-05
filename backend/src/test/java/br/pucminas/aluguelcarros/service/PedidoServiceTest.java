package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.AvaliacaoRequest;
import br.pucminas.aluguelcarros.dto.PedidoRequest;
import br.pucminas.aluguelcarros.dto.PedidoResponse;
import br.pucminas.aluguelcarros.exception.AcessoNegadoException;
import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Empresa;
import br.pucminas.aluguelcarros.model.Papel;
import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.repository.AgenteRepository;
import br.pucminas.aluguelcarros.repository.AutomovelRepository;
import br.pucminas.aluguelcarros.repository.ClienteRepository;
import br.pucminas.aluguelcarros.repository.ContratoRepository;
import br.pucminas.aluguelcarros.repository.PedidoAluguelRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.math.BigDecimal;
import java.util.Optional;

import static br.pucminas.aluguelcarros.service.Fixtures.HOJE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("PedidoService — regras de status do pedido de aluguel")
class PedidoServiceTest {

    @Mock PedidoAluguelRepository pedidoRepository;
    @Mock AutomovelRepository automovelRepository;
    @Mock ClienteRepository clienteRepository;
    @Mock AgenteRepository agenteRepository;
    @Mock ContratoRepository contratoRepository;

    PedidoService service;
    Cliente cliente;
    Empresa empresa;
    Automovel carro;

    @BeforeEach
    void setUp() {
        service = new PedidoService(pedidoRepository, automovelRepository, clienteRepository, agenteRepository,
                contratoRepository, Fixtures.RELOGIO);
        cliente = Fixtures.cliente(1);
        empresa = Fixtures.empresa(2);
        carro = Fixtures.automovel(10, "200.00", empresa);

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(agenteRepository.findById(2L)).thenReturn(Optional.of(empresa));
        when(automovelRepository.findById(10L)).thenReturn(Optional.of(carro));
        when(pedidoRepository.save(any(PedidoAluguel.class))).thenAnswer(inv -> inv.getArgument(0));
        when(pedidoRepository.existeConflitoDePeriodo(anyLong(), any(), any(), any(), any())).thenReturn(false);
    }

    private PedidoAluguel pedidoNoStatus(StatusPedido status) {
        PedidoAluguel p = Fixtures.pedido(100, cliente, carro, status);
        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(p));
        return p;
    }

    @Nested
    @DisplayName("Criar pedido")
    class Criar {

        @Test
        @DisplayName("nasce EM_ANALISE e calcula valor = diárias × diária")
        void criaEmAnaliseComValorEstimado() {
            PedidoResponse r = service.criar(new PedidoRequest(10L, HOJE.plusDays(1), HOJE.plusDays(4)),
                    Fixtures.logado(1, Papel.CLIENTE));

            assertThat(r.status()).isEqualTo(StatusPedido.EM_ANALISE);
            assertThat(r.diarias()).isEqualTo(3);
            assertThat(r.valorEstimado()).isEqualByComparingTo(new BigDecimal("600.00"));
        }

        @Test
        @DisplayName("rejeita data de início no passado")
        void rejeitaInicioNoPassado() {
            assertThatThrownBy(() -> service.criar(new PedidoRequest(10L, HOJE.minusDays(1), HOJE.plusDays(2)),
                    Fixtures.logado(1, Papel.CLIENTE)))
                    .isInstanceOf(RegraNegocioException.class)
                    .hasMessageContaining("passado");
        }

        @Test
        @DisplayName("rejeita devolução igual ou anterior ao início")
        void rejeitaFimAntesDoInicio() {
            assertThatThrownBy(() -> service.criar(new PedidoRequest(10L, HOJE.plusDays(5), HOJE.plusDays(5)),
                    Fixtures.logado(1, Papel.CLIENTE)))
                    .isInstanceOf(RegraNegocioException.class)
                    .hasMessageContaining("posterior");
        }

        @Test
        @DisplayName("rejeita automóvel já reservado no período")
        void rejeitaConflitoDePeriodo() {
            when(pedidoRepository.existeConflitoDePeriodo(eq(10L), any(), any(), any(), any())).thenReturn(true);

            assertThatThrownBy(() -> service.criar(new PedidoRequest(10L, HOJE.plusDays(1), HOJE.plusDays(3)),
                    Fixtures.logado(1, Papel.CLIENTE)))
                    .isInstanceOf(RegraNegocioException.class)
                    .hasMessageContaining("reservado");
        }

        @Test
        @DisplayName("agente não pode criar pedido")
        void agenteNaoCria() {
            assertThatThrownBy(() -> service.criar(new PedidoRequest(10L, HOJE.plusDays(1), HOJE.plusDays(3)),
                    Fixtures.logado(2, Papel.EMPRESA)))
                    .isInstanceOf(AcessoNegadoException.class);
        }
    }

    @Nested
    @DisplayName("Cancelar pedido")
    class Cancelar {

        @Test
        @DisplayName("EM_ANALISE → CANCELADO")
        void cancelaEmAnalise() {
            pedidoNoStatus(StatusPedido.EM_ANALISE);

            assertThat(service.cancelar(100L, Fixtures.logado(1, Papel.CLIENTE)).status())
                    .isEqualTo(StatusPedido.CANCELADO);
        }

        @ParameterizedTest(name = "não cancela pedido {0}")
        @EnumSource(value = StatusPedido.class, names = {"APROVADO", "REPROVADO", "CANCELADO", "CONTRATADO"})
        void naoCancelaForaDeAnalise(StatusPedido status) {
            pedidoNoStatus(status);

            assertThatThrownBy(() -> service.cancelar(100L, Fixtures.logado(1, Papel.CLIENTE)))
                    .isInstanceOf(RegraNegocioException.class);
            verify(pedidoRepository, never()).save(any());
        }

        @Test
        @DisplayName("cliente não cancela pedido de outro cliente")
        void naoCancelaPedidoDeOutro() {
            pedidoNoStatus(StatusPedido.EM_ANALISE);

            assertThatThrownBy(() -> service.cancelar(100L, Fixtures.logado(99, Papel.CLIENTE)))
                    .isInstanceOf(AcessoNegadoException.class);
        }
    }

    @Nested
    @DisplayName("Modificar pedido")
    class Modificar {

        @Test
        @DisplayName("cliente modifica em EM_ANALISE e o valor é recalculado")
        void clienteModificaEmAnalise() {
            pedidoNoStatus(StatusPedido.EM_ANALISE);

            PedidoResponse r = service.modificar(100L, new PedidoRequest(10L, HOJE.plusDays(2), HOJE.plusDays(12)),
                    Fixtures.logado(1, Papel.CLIENTE));

            assertThat(r.diarias()).isEqualTo(10);
            assertThat(r.valorEstimado()).isEqualByComparingTo("2000.00");
        }

        @Test
        @DisplayName("cliente não modifica pedido APROVADO")
        void clienteNaoModificaAprovado() {
            pedidoNoStatus(StatusPedido.APROVADO);

            assertThatThrownBy(() -> service.modificar(100L,
                    new PedidoRequest(10L, HOJE.plusDays(2), HOJE.plusDays(4)), Fixtures.logado(1, Papel.CLIENTE)))
                    .isInstanceOf(RegraNegocioException.class);
        }

        @Test
        @DisplayName("agente pode modificar pedido APROVADO")
        void agenteModificaAprovado() {
            pedidoNoStatus(StatusPedido.APROVADO);

            PedidoResponse r = service.modificar(100L, new PedidoRequest(10L, HOJE.plusDays(2), HOJE.plusDays(4)),
                    Fixtures.logado(2, Papel.EMPRESA));

            assertThat(r.status()).isEqualTo(StatusPedido.APROVADO);
            assertThat(r.diarias()).isEqualTo(2);
        }

        @Test
        @DisplayName("ninguém modifica pedido CONTRATADO")
        void ninguemModificaContratado() {
            pedidoNoStatus(StatusPedido.CONTRATADO);

            assertThatThrownBy(() -> service.modificar(100L,
                    new PedidoRequest(10L, HOJE.plusDays(2), HOJE.plusDays(4)), Fixtures.logado(2, Papel.BANCO)))
                    .isInstanceOf(RegraNegocioException.class);
        }
    }

    @Nested
    @DisplayName("Avaliar pedido")
    class Avaliar {

        @Test
        @DisplayName("aprovar: EM_ANALISE → APROVADO, com parecer e agente avaliador")
        void aprova() {
            PedidoAluguel p = pedidoNoStatus(StatusPedido.EM_ANALISE);

            PedidoResponse r = service.avaliar(100L, new AvaliacaoRequest(true, "Renda compatível"),
                    Fixtures.logado(2, Papel.EMPRESA));

            assertThat(r.status()).isEqualTo(StatusPedido.APROVADO);
            assertThat(r.parecer()).isEqualTo("Renda compatível");
            assertThat(p.getAgenteAvaliador()).isSameAs(empresa);
        }

        @Test
        @DisplayName("reprovar: EM_ANALISE → REPROVADO")
        void reprova() {
            pedidoNoStatus(StatusPedido.EM_ANALISE);

            assertThat(service.avaliar(100L, new AvaliacaoRequest(false, "Renda insuficiente"),
                    Fixtures.logado(2, Papel.EMPRESA)).status()).isEqualTo(StatusPedido.REPROVADO);
        }

        @ParameterizedTest(name = "não reavalia pedido {0}")
        @EnumSource(value = StatusPedido.class, names = {"APROVADO", "REPROVADO", "CANCELADO", "CONTRATADO"})
        void naoAvaliaForaDeAnalise(StatusPedido status) {
            pedidoNoStatus(status);

            assertThatThrownBy(() -> service.avaliar(100L, new AvaliacaoRequest(true, "ok"),
                    Fixtures.logado(2, Papel.EMPRESA)))
                    .isInstanceOf(RegraNegocioException.class);
        }

        @Test
        @DisplayName("cliente não pode avaliar")
        void clienteNaoAvalia() {
            pedidoNoStatus(StatusPedido.EM_ANALISE);

            assertThatThrownBy(() -> service.avaliar(100L, new AvaliacaoRequest(true, "ok"),
                    Fixtures.logado(1, Papel.CLIENTE)))
                    .isInstanceOf(AcessoNegadoException.class);
        }
    }
}
