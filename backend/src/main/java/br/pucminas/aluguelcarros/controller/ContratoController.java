package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.ContratoRequest;
import br.pucminas.aluguelcarros.dto.ContratoResponse;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import br.pucminas.aluguelcarros.service.ContratoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Contratos de aluguel (com ou sem crédito bancário). */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContratoController {

    private final ContratoService contratoService;

    /** Agente transforma um pedido APROVADO em contrato; crédito só pode ser concedido por BANCO. */
    @PostMapping("/pedidos/{pedidoId}/contrato")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('AGENTE')")
    public ContratoResponse gerar(@PathVariable Long pedidoId, @Valid @RequestBody ContratoRequest req,
                                  @AuthenticationPrincipal UsuarioAutenticado logado) {
        return contratoService.gerar(pedidoId, req, logado);
    }

    @GetMapping("/contratos")
    @PreAuthorize("hasRole('AGENTE')")
    public List<ContratoResponse> listarTodos() {
        return contratoService.listarTodos();
    }

    @GetMapping("/contratos/meus")
    @PreAuthorize("hasRole('CLIENTE')")
    public List<ContratoResponse> meusContratos(@AuthenticationPrincipal UsuarioAutenticado logado) {
        return contratoService.listarDoCliente(logado);
    }

    @GetMapping("/contratos/{id}")
    public ContratoResponse buscar(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado logado) {
        return contratoService.buscar(id, logado);
    }
}
