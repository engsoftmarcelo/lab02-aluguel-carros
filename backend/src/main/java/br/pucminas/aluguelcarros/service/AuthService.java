package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.LoginRequest;
import br.pucminas.aluguelcarros.dto.LoginResponse;
import br.pucminas.aluguelcarros.dto.RegistroAgenteRequest;
import br.pucminas.aluguelcarros.dto.RegistroClienteRequest;
import br.pucminas.aluguelcarros.dto.UsuarioResponse;
import br.pucminas.aluguelcarros.exception.ConflitoException;
import br.pucminas.aluguelcarros.exception.RecursoNaoEncontradoException;
import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import br.pucminas.aluguelcarros.model.Agente;
import br.pucminas.aluguelcarros.model.Banco;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Empresa;
import br.pucminas.aluguelcarros.model.Papel;
import br.pucminas.aluguelcarros.model.Usuario;
import br.pucminas.aluguelcarros.repository.AgenteRepository;
import br.pucminas.aluguelcarros.repository.ClienteRepository;
import br.pucminas.aluguelcarros.repository.UsuarioRepository;
import br.pucminas.aluguelcarros.security.JwtService;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Cadastro (cliente/agente), login e dados do usuário logado. */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final AgenteRepository agenteRepository;
    private final ClienteService clienteService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public LoginResponse registrarCliente(RegistroClienteRequest req) {
        String login = Documentos.normalizarLogin(req.login());
        String cpf = Documentos.somenteDigitos(req.cpf());
        validarLoginDisponivel(login);
        if (clienteRepository.existsByCpf(cpf)) {
            throw new ConflitoException("Já existe um cliente cadastrado com este CPF.");
        }
        Cliente cliente = new Cliente(login, passwordEncoder.encode(req.senha()), req.nome().trim(),
                req.endereco().trim(), req.rg().trim(), cpf, req.profissao().trim());
        clienteService.definirRendimentos(cliente, req.rendimentos());
        return autenticar(usuarioRepository.save(cliente));
    }

    @Transactional
    public LoginResponse registrarAgente(RegistroAgenteRequest req) {
        if (!req.tipo().isAgente()) {
            throw new RegraNegocioException("O tipo de agente deve ser EMPRESA ou BANCO.");
        }
        String login = Documentos.normalizarLogin(req.login());
        String cnpj = Documentos.somenteDigitos(req.cnpj());
        validarLoginDisponivel(login);
        if (agenteRepository.existsByCnpj(cnpj)) {
            throw new ConflitoException("Já existe um agente cadastrado com este CNPJ.");
        }
        String senha = passwordEncoder.encode(req.senha());
        Agente agente = req.tipo() == Papel.BANCO
                ? new Banco(login, senha, req.nome().trim(), req.endereco().trim(), cnpj)
                : new Empresa(login, senha, req.nome().trim(), req.endereco().trim(), cnpj);
        return autenticar(usuarioRepository.save(agente));
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        Usuario usuario = usuarioRepository.findByLoginIgnoreCase(Documentos.normalizarLogin(req.login()))
                .filter(u -> passwordEncoder.matches(req.senha(), u.getSenha()))
                .orElseThrow(() -> new BadCredentialsException("Login ou senha inválidos."));
        return autenticar(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse me(UsuarioAutenticado logado) {
        return usuarioRepository.findById(logado.id())
                .map(UsuarioResponse::de)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Usuário", logado.id()));
    }

    private void validarLoginDisponivel(String login) {
        if (usuarioRepository.existsByLoginIgnoreCase(login)) {
            throw new ConflitoException("Este e-mail já está cadastrado.");
        }
    }

    private LoginResponse autenticar(Usuario usuario) {
        String token = jwtService.gerarToken(UsuarioAutenticado.de(usuario));
        return LoginResponse.bearer(token, jwtService.expiracao(), UsuarioResponse.de(usuario));
    }
}
