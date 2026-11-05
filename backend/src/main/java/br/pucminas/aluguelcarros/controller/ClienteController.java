package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.ClienteRequest;
import br.pucminas.aluguelcarros.dto.ClienteResponse;
import br.pucminas.aluguelcarros.dto.RendimentoRequest;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import br.pucminas.aluguelcarros.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * CRUD de cliente.
 * Agentes: listam, criam, editam e excluem qualquer cliente.
 * Cliente: vê, edita e exclui o próprio cadastro (rotas /me ou o próprio id).
 */
@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    @PreAuthorize("hasRole('AGENTE')")
    public List<ClienteResponse> listar(@RequestParam(required = false) String busca) {
        return clienteService.listar(busca);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('AGENTE')")
    public ClienteResponse criar(@Valid @RequestBody ClienteRequest req) {
        return clienteService.criar(req);
    }

    // ----- dados do próprio cliente logado

    @GetMapping("/me")
    @PreAuthorize("hasRole('CLIENTE')")
    public ClienteResponse meusDados(@AuthenticationPrincipal UsuarioAutenticado logado) {
        return clienteService.buscar(logado.id(), logado);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CLIENTE')")
    public ClienteResponse atualizarMeusDados(@Valid @RequestBody ClienteRequest req,
                                              @AuthenticationPrincipal UsuarioAutenticado logado) {
        return clienteService.atualizar(logado.id(), req, logado);
    }

    @DeleteMapping("/me")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('CLIENTE')")
    public void excluirMinhaConta(@AuthenticationPrincipal UsuarioAutenticado logado) {
        clienteService.excluir(logado.id(), logado);
    }

    // ----- por id (agente: qualquer um; cliente: só o próprio)

    @GetMapping("/{id}")
    public ClienteResponse buscar(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado logado) {
        return clienteService.buscar(id, logado);
    }

    @PutMapping("/{id}")
    public ClienteResponse atualizar(@PathVariable Long id, @Valid @RequestBody ClienteRequest req,
                                     @AuthenticationPrincipal UsuarioAutenticado logado) {
        return clienteService.atualizar(id, req, logado);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado logado) {
        clienteService.excluir(id, logado);
    }

    // ----- rendimentos (máximo 3)

    @PostMapping("/{id}/rendimentos")
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteResponse adicionarRendimento(@PathVariable Long id, @Valid @RequestBody RendimentoRequest req,
                                               @AuthenticationPrincipal UsuarioAutenticado logado) {
        return clienteService.adicionarRendimento(id, req, logado);
    }

    @PutMapping("/{id}/rendimentos/{rendimentoId}")
    public ClienteResponse atualizarRendimento(@PathVariable Long id, @PathVariable Long rendimentoId,
                                               @Valid @RequestBody RendimentoRequest req,
                                               @AuthenticationPrincipal UsuarioAutenticado logado) {
        return clienteService.atualizarRendimento(id, rendimentoId, req, logado);
    }

    @DeleteMapping("/{id}/rendimentos/{rendimentoId}")
    public ClienteResponse removerRendimento(@PathVariable Long id, @PathVariable Long rendimentoId,
                                             @AuthenticationPrincipal UsuarioAutenticado logado) {
        return clienteService.removerRendimento(id, rendimentoId, logado);
    }
}
