package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.ClienteRequest;
import br.pucminas.aluguelcarros.dto.ClienteResponse;
import br.pucminas.aluguelcarros.dto.RendimentoRequest;
import br.pucminas.aluguelcarros.exception.AcessoNegadoException;
import br.pucminas.aluguelcarros.exception.ConflitoException;
import br.pucminas.aluguelcarros.exception.RecursoNaoEncontradoException;
import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Rendimento;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.repository.ClienteRepository;
import br.pucminas.aluguelcarros.repository.PedidoAluguelRepository;
import br.pucminas.aluguelcarros.repository.UsuarioRepository;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.EnumSet;
import java.util.List;

/**
 * CRUD de cliente e gerenciamento de rendimentos (máximo 3).
 * Agentes acessam qualquer cliente; um cliente só acessa os próprios dados.
 */
@Service
@RequiredArgsConstructor
public class ClienteService {

    /** Pedidos nesses status impedem excluir o cliente. */
    private static final EnumSet<StatusPedido> STATUS_QUE_BLOQUEIAM_EXCLUSAO =
            EnumSet.of(StatusPedido.EM_ANALISE, StatusPedido.APROVADO, StatusPedido.CONTRATADO);

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoAluguelRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;

    // ---------------------------------------------------------------- consultas

    @Transactional(readOnly = true)
    public List<ClienteResponse> listar(String busca) {
        List<Cliente> clientes = StringUtils.hasText(busca)
                ? clienteRepository.buscar(busca.trim())
                : clienteRepository.findAllByOrderByNomeAsc();
        return clientes.stream().map(ClienteResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponse buscar(Long id, UsuarioAutenticado logado) {
        garantirAcesso(id, logado);
        return ClienteResponse.de(obter(id));
    }

    // ---------------------------------------------------------------- escrita

    /** Agente cadastra um cliente (e-mail e senha obrigatórios). */
    @Transactional
    public ClienteResponse criar(ClienteRequest req) {
        if (!StringUtils.hasText(req.login()) || !StringUtils.hasText(req.senha())) {
            throw new RegraNegocioException("Informe e-mail e senha para cadastrar o cliente.");
        }
        String login = Documentos.normalizarLogin(req.login());
        String cpf = Documentos.somenteDigitos(req.cpf());
        if (usuarioRepository.existsByLoginIgnoreCase(login)) {
            throw new ConflitoException("Este e-mail já está cadastrado.");
        }
        if (clienteRepository.existsByCpf(cpf)) {
            throw new ConflitoException("Já existe um cliente cadastrado com este CPF.");
        }
        Cliente cliente = new Cliente(login, passwordEncoder.encode(req.senha()), req.nome().trim(),
                req.endereco().trim(), req.rg().trim(), cpf, req.profissao().trim());
        definirRendimentos(cliente, req.rendimentos());
        return ClienteResponse.de(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse atualizar(Long id, ClienteRequest req, UsuarioAutenticado logado) {
        garantirAcesso(id, logado);
        Cliente cliente = obter(id);

        String cpf = Documentos.somenteDigitos(req.cpf());
        if (clienteRepository.existsByCpfAndIdNot(cpf, id)) {
            throw new ConflitoException("Já existe outro cliente cadastrado com este CPF.");
        }
        if (StringUtils.hasText(req.login())) {
            String login = Documentos.normalizarLogin(req.login());
            if (!login.equalsIgnoreCase(cliente.getLogin()) && usuarioRepository.existsByLoginIgnoreCase(login)) {
                throw new ConflitoException("Este e-mail já está cadastrado.");
            }
            cliente.setLogin(login);
        }
        if (StringUtils.hasText(req.senha())) {
            cliente.setSenha(passwordEncoder.encode(req.senha()));
        }
        cliente.setNome(req.nome().trim());
        cliente.setEndereco(req.endereco().trim());
        cliente.setRg(req.rg().trim());
        cliente.setCpf(cpf);
        cliente.setProfissao(req.profissao().trim());
        if (req.rendimentos() != null) {
            definirRendimentos(cliente, req.rendimentos());
        }
        return ClienteResponse.de(clienteRepository.save(cliente));
    }

    /**
     * Exclui o cliente. Bloqueado se houver pedido em andamento ou contratado;
     * pedidos encerrados (cancelados/reprovados) são removidos junto.
     */
    @Transactional
    public void excluir(Long id, UsuarioAutenticado logado) {
        garantirAcesso(id, logado);
        Cliente cliente = obter(id);
        if (pedidoRepository.existsByClienteIdAndStatusIn(id, STATUS_QUE_BLOQUEIAM_EXCLUSAO)) {
            throw new RegraNegocioException(
                    "Não é possível excluir: o cliente possui pedidos em análise, aprovados ou contratados.");
        }
        pedidoRepository.deleteAll(pedidoRepository.findByClienteIdOrderByCriadoEmDesc(id));
        clienteRepository.delete(cliente);
    }

    // ---------------------------------------------------------------- rendimentos

    @Transactional
    public ClienteResponse adicionarRendimento(Long clienteId, RendimentoRequest req, UsuarioAutenticado logado) {
        garantirAcesso(clienteId, logado);
        Cliente cliente = obter(clienteId);
        validarLimiteRendimentos(cliente.getRendimentos().size() + 1);
        cliente.adicionarRendimento(new Rendimento(req.entidadeEmpregadora().trim(), req.valor()));
        return ClienteResponse.de(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse atualizarRendimento(Long clienteId, Long rendimentoId, RendimentoRequest req,
                                               UsuarioAutenticado logado) {
        garantirAcesso(clienteId, logado);
        Cliente cliente = obter(clienteId);
        Rendimento rendimento = obterRendimento(cliente, rendimentoId);
        rendimento.setEntidadeEmpregadora(req.entidadeEmpregadora().trim());
        rendimento.setValor(req.valor());
        return ClienteResponse.de(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse removerRendimento(Long clienteId, Long rendimentoId, UsuarioAutenticado logado) {
        garantirAcesso(clienteId, logado);
        Cliente cliente = obter(clienteId);
        cliente.removerRendimento(obterRendimento(cliente, rendimentoId));
        return ClienteResponse.de(clienteRepository.save(cliente));
    }

    /** Substitui os rendimentos do cliente, garantindo o máximo de 3. */
    public void definirRendimentos(Cliente cliente, List<RendimentoRequest> rendimentos) {
        List<RendimentoRequest> lista = rendimentos == null ? List.of() : rendimentos;
        validarLimiteRendimentos(lista.size());
        cliente.limparRendimentos();
        lista.forEach(r -> cliente.adicionarRendimento(
                new Rendimento(r.entidadeEmpregadora().trim(), r.valor())));
    }

    public void validarLimiteRendimentos(int quantidade) {
        if (quantidade > Cliente.MAX_RENDIMENTOS) {
            throw new RegraNegocioException(
                    "O cliente pode ter no máximo " + Cliente.MAX_RENDIMENTOS + " rendimentos.");
        }
    }

    // ---------------------------------------------------------------- auxiliares

    /** Agente acessa qualquer cliente; cliente só acessa o próprio cadastro. */
    private void garantirAcesso(Long clienteId, UsuarioAutenticado logado) {
        if (logado.isAgente()) {
            return;
        }
        if (!logado.isCliente() || !logado.id().equals(clienteId)) {
            throw new AcessoNegadoException("Você só pode acessar os seus próprios dados.");
        }
    }

    private Cliente obter(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Cliente", id));
    }

    private Rendimento obterRendimento(Cliente cliente, Long rendimentoId) {
        return cliente.getRendimentos().stream()
                .filter(r -> r.getId().equals(rendimentoId))
                .findFirst()
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Rendimento", rendimentoId));
    }
}
