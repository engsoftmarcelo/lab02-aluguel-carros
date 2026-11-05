package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.DashboardResumo;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import br.pucminas.aluguelcarros.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Contadores para os gráficos do frontend. */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumo")
    public DashboardResumo resumo(@AuthenticationPrincipal UsuarioAutenticado logado) {
        return dashboardService.resumo(logado);
    }
}
