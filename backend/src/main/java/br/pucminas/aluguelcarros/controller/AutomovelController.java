package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.AutomovelRequest;
import br.pucminas.aluguelcarros.dto.AutomovelResponse;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import br.pucminas.aluguelcarros.service.AutomovelService;
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

/** Frota: consulta para todos os autenticados; criação/edição/exclusão só para agentes. */
@RestController
@RequestMapping("/api/automoveis")
@RequiredArgsConstructor
public class AutomovelController {

    private final AutomovelService automovelService;

    @GetMapping
    public List<AutomovelResponse> listar(@RequestParam(required = false) String busca) {
        return automovelService.listar(busca);
    }

    @GetMapping("/{id}")
    public AutomovelResponse buscar(@PathVariable Long id) {
        return automovelService.buscar(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('AGENTE')")
    public AutomovelResponse criar(@Valid @RequestBody AutomovelRequest req,
                                   @AuthenticationPrincipal UsuarioAutenticado logado) {
        return automovelService.criar(req, logado);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('AGENTE')")
    public AutomovelResponse atualizar(@PathVariable Long id, @Valid @RequestBody AutomovelRequest req) {
        return automovelService.atualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('AGENTE')")
    public void excluir(@PathVariable Long id) {
        automovelService.excluir(id);
    }
}
