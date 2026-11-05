package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.AvaliacaoRequest;
import br.pucminas.aluguelcarros.dto.PedidoRequest;
import br.pucminas.aluguelcarros.dto.PedidoResponse;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import br.pucminas.aluguelcarros.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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
 * Pedidos de aluguel.
 * Cliente: cria, consulta, modifica e cancela os próprios pedidos.
 * Agente: consulta todos, modifica e avalia (aprova/reprova com parecer).
 */
@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping
    @PreAuthorize("hasRole('AGENTE')")
    public List<PedidoResponse> listarTodos(@RequestParam(required = false) StatusPedido status) {
        return pedidoService.listarTodos(status);
    }

    @GetMapping("/meus")
    @PreAuthorize("hasRole('CLIENTE')")
    public List<PedidoResponse> meusPedidos(@AuthenticationPrincipal UsuarioAutenticado logado) {
        return pedidoService.listarDoCliente(logado);
    }

    @GetMapping("/{id}")
    public PedidoResponse buscar(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado logado) {
        return pedidoService.buscar(id, logado);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CLIENTE')")
    public PedidoResponse criar(@Valid @RequestBody PedidoRequest req,
                                @AuthenticationPrincipal UsuarioAutenticado logado) {
        return pedidoService.criar(req, logado);
    }

    @PutMapping("/{id}")
    public PedidoResponse modificar(@PathVariable Long id, @Valid @RequestBody PedidoRequest req,
                                    @AuthenticationPrincipal UsuarioAutenticado logado) {
        return pedidoService.modificar(id, req, logado);
    }

    @PatchMapping("/{id}/cancelar")
    @PreAuthorize("hasRole('CLIENTE')")
    public PedidoResponse cancelar(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado logado) {
        return pedidoService.cancelar(id, logado);
    }

    @PatchMapping("/{id}/avaliar")
    @PreAuthorize("hasRole('AGENTE')")
    public PedidoResponse avaliar(@PathVariable Long id, @Valid @RequestBody AvaliacaoRequest req,
                                  @AuthenticationPrincipal UsuarioAutenticado logado) {
        return pedidoService.avaliar(id, req, logado);
    }
}
