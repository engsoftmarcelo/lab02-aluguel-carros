package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.AvaliacaoRequest;
import br.pucminas.aluguelcarros.dto.PedidoRequest;
import br.pucminas.aluguelcarros.dto.PedidoResponse;
import br.pucminas.aluguelcarros.exception.AcessoNegadoException;
import br.pucminas.aluguelcarros.exception.RecursoNaoEncontradoException;
import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import br.pucminas.aluguelcarros.model.Agente;
import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Contrato;
import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.repository.AgenteRepository;
import br.pucminas.aluguelcarros.repository.AutomovelRepository;
import br.pucminas.aluguelcarros.repository.ClienteRepository;
import br.pucminas.aluguelcarros.repository.ContratoRepository;
import br.pucminas.aluguelcarros.repository.PedidoAluguelRepository;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

/**
 * Pedidos de aluguel e avaliação pelos agentes.
 * Ciclo de vida: EM_ANALISE → APROVADO → CONTRATADO; EM_ANALISE → REPROVADO; EM_ANALISE → CANCELADO.
 */
@Service
@RequiredArgsConstructor
public class PedidoService {

    /** Pedidos que "seguram" o automóvel no período (impedem outro pedido no mesmo intervalo). */
    static final Set<StatusPedido> STATUS_ATIVOS =
            EnumSet.of(StatusPedido.EM_ANALISE, StatusPedido.APROVADO, StatusPedido.CONTRATADO);

    static final int MAX_DIAS_ALUGUEL = 365;

    private final PedidoAluguelRepository pedidoRepository;
    private final AutomovelRepository automovelRepository;
    private final ClienteRepository clienteRepository;
    private final AgenteRepository agenteRepository;
    private final ContratoRepository contratoRepository;
    private final Clock clock;

    // ---------------------------------------------------------------- consultas

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarTodos(StatusPedido status) {
        List<PedidoAluguel> pedidos = status == null
                ? pedidoRepository.findAllByOrderByCriadoEmDesc()
                : pedidoRepository.findByStatusOrderByCriadoEmDesc(status);
        return paraResponses(pedidos);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> listarDoCliente(UsuarioAutenticado logado) {
        return paraResponses(pedidoRepository.findByClienteIdOrderByCriadoEmDesc(logado.id()));
    }

    /** Monta a lista buscando os ids de contrato de todos os pedidos de uma vez (evita N+1). */
    private List<PedidoResponse> paraResponses(List<PedidoAluguel> pedidos) {
        List<Long> contratados = pedidos.stream()
                .filter(p -> p.getStatus() == StatusPedido.CONTRATADO).map(PedidoAluguel::getId).toList();
        java.util.Map<Long, Long> contratoPorPedido = new java.util.HashMap<>();
        if (!contratados.isEmpty()) {
            contratoRepository.idsPorPedido(contratados)
                    .forEach(par -> contratoPorPedido.put((Long) par[0], (Long) par[1]));
        }
        return pedidos.stream().map(p -> PedidoResponse.de(p, contratoPorPedido.get(p.getId()))).toList();
    }

    @Transactional(readOnly = true)
    public PedidoResponse buscar(Long id, UsuarioAutenticado logado) {
        PedidoAluguel pedido = obter(id);
        garantirAcesso(pedido, logado);
        return paraResponse(pedido);
    }

    // ---------------------------------------------------------------- cliente

    @Transactional
    public PedidoResponse criar(PedidoRequest req, UsuarioAutenticado logado) {
        if (!logado.isCliente()) {
            throw new AcessoNegadoException("Somente clientes podem criar pedidos de aluguel.");
        }
        Cliente cliente = clienteRepository.findById(logado.id())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Cliente", logado.id()));
        Automovel automovel = obterAutomovel(req.automovelId());
        validarPeriodo(req.dataInicio(), req.dataFim());
        validarDisponibilidade(automovel.getId(), req.dataInicio(), req.dataFim(), null);

        PedidoAluguel pedido = new PedidoAluguel();
        pedido.setCliente(cliente);
        pedido.setAutomovel(automovel);
        pedido.setDataInicio(req.dataInicio());
        pedido.setDataFim(req.dataFim());
        pedido.setStatus(StatusPedido.EM_ANALISE);
        pedido.recalcularValorEstimado();
        return paraResponse(pedidoRepository.save(pedido));
    }

    /**
     * Modifica automóvel e/ou período.
     * Cliente: só os próprios pedidos e só em EM_ANALISE. Agente: em EM_ANALISE ou APROVADO.
     */
    @Transactional
    public PedidoResponse modificar(Long id, PedidoRequest req, UsuarioAutenticado logado) {
        PedidoAluguel pedido = obter(id);
        garantirAcesso(pedido, logado);
        if (logado.isAgente()) {
            exigirStatus(pedido, EnumSet.of(StatusPedido.EM_ANALISE, StatusPedido.APROVADO),
                    "Agentes só podem modificar pedidos em análise ou aprovados.");
        } else {
            exigirStatus(pedido, EnumSet.of(StatusPedido.EM_ANALISE),
                    "Só é possível modificar pedidos que ainda estão em análise.");
        }
        Automovel automovel = obterAutomovel(req.automovelId());
        validarPeriodo(req.dataInicio(), req.dataFim());
        validarDisponibilidade(automovel.getId(), req.dataInicio(), req.dataFim(), pedido.getId());

        pedido.setAutomovel(automovel);
        pedido.setDataInicio(req.dataInicio());
        pedido.setDataFim(req.dataFim());
        pedido.recalcularValorEstimado();
        return paraResponse(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoResponse cancelar(Long id, UsuarioAutenticado logado) {
        PedidoAluguel pedido = obter(id);
        if (!logado.isCliente()) {
            throw new AcessoNegadoException("Somente o cliente dono do pedido pode cancelá-lo.");
        }
        garantirAcesso(pedido, logado);
        exigirStatus(pedido, EnumSet.of(StatusPedido.EM_ANALISE),
                "Só é possível cancelar pedidos que ainda estão em análise.");
        pedido.setStatus(StatusPedido.CANCELADO);
        return paraResponse(pedidoRepository.save(pedido));
    }

    // ---------------------------------------------------------------- agente

    /** Análise financeira: APROVADO ou REPROVADO, sempre com parecer e registro do agente avaliador. */
    @Transactional
    public PedidoResponse avaliar(Long id, AvaliacaoRequest req, UsuarioAutenticado logado) {
        if (!logado.isAgente()) {
            throw new AcessoNegadoException("Somente agentes (empresas e bancos) podem avaliar pedidos.");
        }
        PedidoAluguel pedido = obter(id);
        exigirStatus(pedido, EnumSet.of(StatusPedido.EM_ANALISE),
                "Este pedido já foi avaliado ou encerrado (status atual: " + pedido.getStatus() + ").");
        Agente agente = agenteRepository.findById(logado.id())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Agente", logado.id()));

        pedido.setStatus(Boolean.TRUE.equals(req.aprovado()) ? StatusPedido.APROVADO : StatusPedido.REPROVADO);
        pedido.setParecer(req.parecer().trim());
        pedido.setAgenteAvaliador(agente);
        return paraResponse(pedidoRepository.save(pedido));
    }

    // ---------------------------------------------------------------- regras

    void validarPeriodo(LocalDate inicio, LocalDate fim) {
        LocalDate hoje = LocalDate.now(clock);
        if (inicio.isBefore(hoje)) {
            throw new RegraNegocioException("A data de início não pode estar no passado.");
        }
        if (!fim.isAfter(inicio)) {
            throw new RegraNegocioException("A data de devolução deve ser posterior à data de início.");
        }
        if (ChronoUnit.DAYS.between(inicio, fim) > MAX_DIAS_ALUGUEL) {
            throw new RegraNegocioException("O período máximo de aluguel é de " + MAX_DIAS_ALUGUEL + " dias.");
        }
    }

    private void validarDisponibilidade(Long automovelId, LocalDate inicio, LocalDate fim, Long ignorarPedidoId) {
        if (pedidoRepository.existeConflitoDePeriodo(automovelId, inicio, fim, STATUS_ATIVOS, ignorarPedidoId)) {
            throw new RegraNegocioException(
                    "Este automóvel já está reservado em parte desse período. Escolha outras datas ou outro carro.");
        }
    }

    static void exigirStatus(PedidoAluguel pedido, Set<StatusPedido> permitidos, String mensagem) {
        if (!permitidos.contains(pedido.getStatus())) {
            throw new RegraNegocioException(mensagem);
        }
    }

    /** Agente vê qualquer pedido; cliente só os próprios. */
    private void garantirAcesso(PedidoAluguel pedido, UsuarioAutenticado logado) {
        if (logado.isAgente()) {
            return;
        }
        if (!pedido.getCliente().getId().equals(logado.id())) {
            throw new AcessoNegadoException("Você só pode acessar os seus próprios pedidos.");
        }
    }

    private PedidoAluguel obter(Long id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Pedido", id));
    }

    private Automovel obterAutomovel(Long id) {
        return automovelRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Automóvel", id));
    }

    private PedidoResponse paraResponse(PedidoAluguel p) {
        Long contratoId = p.getStatus() == StatusPedido.CONTRATADO
                ? contratoRepository.findByPedidoId(p.getId()).map(Contrato::getId).orElse(null)
                : null;
        return PedidoResponse.de(p, contratoId);
    }
}
