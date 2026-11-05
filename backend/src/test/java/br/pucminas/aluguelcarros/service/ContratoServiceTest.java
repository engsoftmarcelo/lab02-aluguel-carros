package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.ContratoRequest;
import br.pucminas.aluguelcarros.dto.ContratoResponse;
import br.pucminas.aluguelcarros.exception.AcessoNegadoException;
import br.pucminas.aluguelcarros.exception.ConflitoException;
import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.Banco;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Contrato;
import br.pucminas.aluguelcarros.model.ContratoCredito;
import br.pucminas.aluguelcarros.model.Empresa;
import br.pucminas.aluguelcarros.model.Papel;
import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.model.TipoProprietario;
import br.pucminas.aluguelcarros.repository.BancoRepository;
import br.pucminas.aluguelcarros.repository.ContratoRepository;
import br.pucminas.aluguelcarros.repository.PedidoAluguelRepository;
import br.pucminas.aluguelcarros.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("ContratoService — geração de contrato e crédito bancário")
class ContratoServiceTest {

    @Mock ContratoRepository contratoRepository;
    @Mock PedidoAluguelRepository pedidoRepository;
    @Mock UsuarioRepository usuarioRepository;
    @Mock BancoRepository bancoRepository;

    ContratoService service;
    Cliente cliente;
    Empresa empresa;
    Banco banco;
    Automovel carro;
    PedidoAluguel pedido;

    @BeforeEach
    void setUp() {
        service = new ContratoService(contratoRepository, pedidoRepository, usuarioRepository, bancoRepository,
                Fixtures.RELOGIO);
        cliente = Fixtures.cliente(1);
        empresa = Fixtures.empresa(2);
        banco = Fixtures.banco(3);
        carro = Fixtures.automovel(10, "200.00", empresa);
        pedido = Fixtures.pedido(100, cliente, carro, StatusPedido.APROVADO); // 5 diárias = 1000.00

        when(pedidoRepository.findById(100L)).thenReturn(Optional.of(pedido));
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(empresa));
        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(banco));
        when(bancoRepository.findById(3L)).thenReturn(Optional.of(banco));
        when(contratoRepository.existsByPedidoId(100L)).thenReturn(false);
        when(contratoRepository.save(any(Contrato.class))).thenAnswer(inv -> inv.getArgument(0));
        when(pedidoRepository.save(any(PedidoAluguel.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    @DisplayName("contrato simples: APROVADO → CONTRATADO e carro passa para o cliente")
    void contratoSimplesParaCliente() {
        ContratoResponse r = service.gerar(100L, new ContratoRequest(TipoProprietario.CLIENTE, null),
                Fixtures.logado(2, Papel.EMPRESA));

        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.CONTRATADO);
        assertThat(carro.getProprietario()).isSameAs(cliente);
        assertThat(carro.getTipoProprietario()).isEqualTo(TipoProprietario.CLIENTE);
        assertThat(r.credito()).isNull();
        assertThat(r.dataAssinatura()).isEqualTo(Fixtures.HOJE);
    }

    @Test
    @DisplayName("banco concede crédito: gera ContratoCredito e o carro fica com o banco")
    void bancoConcedeCredito() {
        var credito = new ContratoRequest.Credito(new BigDecimal("1000.00"), new BigDecimal("2.0"), 12);

        ContratoResponse r = service.gerar(100L, new ContratoRequest(TipoProprietario.BANCO, credito),
                Fixtures.logado(3, Papel.BANCO));

        assertThat(r.credito()).isNotNull();
        assertThat(r.credito().bancoNome()).isEqualTo("Banco 3");
        assertThat(r.credito().valorParcela()).isEqualByComparingTo("94.56");
        assertThat(carro.getProprietario()).isSameAs(banco);
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.CONTRATADO);
    }

    @Test
    @DisplayName("empresa não pode conceder crédito")
    void empresaNaoConcedeCredito() {
        var credito = new ContratoRequest.Credito(new BigDecimal("500.00"), new BigDecimal("1.5"), 6);

        assertThatThrownBy(() -> service.gerar(100L, new ContratoRequest(TipoProprietario.CLIENTE, credito),
                Fixtures.logado(2, Papel.EMPRESA)))
                .isInstanceOf(AcessoNegadoException.class)
                .hasMessageContaining("bancos");
        assertThat(pedido.getStatus()).isEqualTo(StatusPedido.APROVADO);
    }

    @Test
    @DisplayName("valor financiado não pode passar do valor do aluguel")
    void financiamentoAcimaDoAluguel() {
        var credito = new ContratoRequest.Credito(new BigDecimal("1000.01"), new BigDecimal("1.0"), 6);

        assertThatThrownBy(() -> service.gerar(100L, new ContratoRequest(TipoProprietario.CLIENTE, credito),
                Fixtures.logado(3, Papel.BANCO)))
                .isInstanceOf(RegraNegocioException.class);
    }

    @ParameterizedTest(name = "não gera contrato para pedido {0}")
    @EnumSource(value = StatusPedido.class, names = {"EM_ANALISE", "REPROVADO", "CANCELADO", "CONTRATADO"})
    void soGeraContratoParaAprovado(StatusPedido status) {
        pedido.setStatus(status);

        assertThatThrownBy(() -> service.gerar(100L, new ContratoRequest(TipoProprietario.CLIENTE, null),
                Fixtures.logado(2, Papel.EMPRESA)))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("pedido que já tem contrato não gera outro")
    void contratoDuplicado() {
        when(contratoRepository.existsByPedidoId(100L)).thenReturn(true);

        assertThatThrownBy(() -> service.gerar(100L, new ContratoRequest(TipoProprietario.CLIENTE, null),
                Fixtures.logado(2, Papel.EMPRESA)))
                .isInstanceOf(ConflitoException.class);
    }

    @Test
    @DisplayName("propriedade BANCO sem crédito exige que quem gera seja um banco")
    void propriedadeBancoGeradaPorEmpresa() {
        assertThatThrownBy(() -> service.gerar(100L, new ContratoRequest(TipoProprietario.BANCO, null),
                Fixtures.logado(2, Papel.EMPRESA)))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    @DisplayName("Tabela Price: R$ 1.000 a 2% a.m. em 12x = R$ 94,56; sem juros divide igualmente")
    void tabelaPrice() {
        assertThat(ContratoCredito.calcularParcela(new BigDecimal("1000"), new BigDecimal("2"), 12))
                .isEqualByComparingTo("94.56");
        assertThat(ContratoCredito.calcularParcela(new BigDecimal("1200"), BigDecimal.ZERO, 12))
                .isEqualByComparingTo("100.00");
    }
}
