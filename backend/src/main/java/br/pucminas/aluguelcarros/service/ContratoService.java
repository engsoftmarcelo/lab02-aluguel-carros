package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.ContratoRequest;
import br.pucminas.aluguelcarros.dto.ContratoResponse;
import br.pucminas.aluguelcarros.exception.AcessoNegadoException;
import br.pucminas.aluguelcarros.exception.ConflitoException;
import br.pucminas.aluguelcarros.exception.RecursoNaoEncontradoException;
import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.Banco;
import br.pucminas.aluguelcarros.model.Contrato;
import br.pucminas.aluguelcarros.model.ContratoCredito;
import br.pucminas.aluguelcarros.model.Empresa;
import br.pucminas.aluguelcarros.model.Papel;
import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.model.Usuario;
import br.pucminas.aluguelcarros.repository.BancoRepository;
import br.pucminas.aluguelcarros.repository.ContratoRepository;
import br.pucminas.aluguelcarros.repository.PedidoAluguelRepository;
import br.pucminas.aluguelcarros.repository.UsuarioRepository;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;

/**
 * Execução do contrato de aluguel a partir de um pedido aprovado, com crédito bancário opcional.
 * Ao contratar, o pedido passa a CONTRATADO e o automóvel é registrado como propriedade
 * do cliente, da empresa ou do banco, conforme o tipo de contrato.
 */
@Service
@RequiredArgsConstructor
public class ContratoService {

    private final ContratoRepository contratoRepository;
    private final PedidoAluguelRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final BancoRepository bancoRepository;
    private final Clock clock;

    @Transactional
    public ContratoResponse gerar(Long pedidoId, ContratoRequest req, UsuarioAutenticado logado) {
        if (!logado.isAgente()) {
            throw new AcessoNegadoException("Somente agentes podem gerar contratos.");
        }
        PedidoAluguel pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Pedido", pedidoId));
        PedidoService.exigirStatus(pedido, EnumSet.of(StatusPedido.APROVADO),
                "Só é possível gerar contrato para pedidos aprovados (status atual: " + pedido.getStatus() + ").");
        if (contratoRepository.existsByPedidoId(pedidoId)) {
            throw new ConflitoException("Este pedido já possui contrato.");
        }

        LocalDate hoje = LocalDate.now(clock);
        Contrato contrato;
        Banco bancoConcedente = null;
        if (req.credito() != null) {
            if (logado.papel() != Papel.BANCO) {
                throw new AcessoNegadoException("Somente bancos podem conceder contratos de crédito.");
            }
            ContratoRequest.Credito cr = req.credito();
            if (cr.valorFinanciado().compareTo(pedido.getValorEstimado()) > 0) {
                throw new RegraNegocioException("O valor financiado não pode ser maior que o valor do aluguel ("
                        + pedido.getValorEstimado() + ").");
            }
            bancoConcedente = bancoRepository.findById(logado.id())
                    .orElseThrow(() -> RecursoNaoEncontradoException.de("Banco", logado.id()));
            contrato = new ContratoCredito(pedido, req.tipoPropriedade(), hoje, bancoConcedente,
                    cr.valorFinanciado(), cr.taxaJuros(), cr.parcelas());
        } else {
            contrato = new Contrato(pedido, req.tipoPropriedade(), hoje);
        }

        atualizarProprietario(pedido, req, logado, bancoConcedente);
        pedido.setStatus(StatusPedido.CONTRATADO);
        pedidoRepository.save(pedido);
        return ContratoResponse.de(contratoRepository.save(contrato));
    }

    @Transactional(readOnly = true)
    public List<ContratoResponse> listarTodos() {
        return contratoRepository.findAllByOrderByDataAssinaturaDesc().stream().map(ContratoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public List<ContratoResponse> listarDoCliente(UsuarioAutenticado logado) {
        return contratoRepository.findByPedidoClienteIdOrderByDataAssinaturaDesc(logado.id()).stream()
                .map(ContratoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public ContratoResponse buscar(Long id, UsuarioAutenticado logado) {
        Contrato c = contratoRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Contrato", id));
        if (!logado.isAgente() && !c.getPedido().getCliente().getId().equals(logado.id())) {
            throw new AcessoNegadoException("Você só pode acessar os seus próprios contratos.");
        }
        return ContratoResponse.de(c);
    }

    /**
     * CLIENTE → o cliente do pedido;
     * EMPRESA → a empresa logada ou, se quem gera é um banco, a empresa que já é dona do carro;
     * BANCO → o banco que concedeu o crédito ou o banco logado.
     */
    private void atualizarProprietario(PedidoAluguel pedido, ContratoRequest req, UsuarioAutenticado logado,
                                       Banco bancoConcedente) {
        Automovel automovel = pedido.getAutomovel();
        Usuario logadoEntidade = (Usuario) Hibernate.unproxy(usuarioRepository.findById(logado.id())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Usuário", logado.id())));
        Usuario donoAtual = automovel.getProprietario() == null ? null
                : (Usuario) Hibernate.unproxy(automovel.getProprietario());

        Usuario novoDono = switch (req.tipoPropriedade()) {
            case CLIENTE -> pedido.getCliente();
            case EMPRESA -> {
                if (logadoEntidade instanceof Empresa e) {
                    yield e;
                }
                if (donoAtual instanceof Empresa e) {
                    yield e;
                }
                throw new RegraNegocioException(
                        "Para registrar o automóvel como propriedade de empresa, o contrato deve ser gerado por uma empresa.");
            }
            case BANCO -> {
                if (bancoConcedente != null) {
                    yield bancoConcedente;
                }
                if (logadoEntidade instanceof Banco b) {
                    yield b;
                }
                throw new RegraNegocioException(
                        "Para registrar o automóvel como propriedade de banco, o contrato deve ser gerado por um banco.");
            }
        };
        automovel.setProprietario(novoDono);
        automovel.setTipoProprietario(req.tipoPropriedade());
    }
}
