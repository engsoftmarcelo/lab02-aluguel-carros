package br.pucminas.aluguelcarros.controller;

import br.pucminas.aluguelcarros.dto.LoginRequest;
import br.pucminas.aluguelcarros.dto.LoginResponse;
import br.pucminas.aluguelcarros.dto.RegistroAgenteRequest;
import br.pucminas.aluguelcarros.dto.RegistroClienteRequest;
import br.pucminas.aluguelcarros.dto.UsuarioResponse;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import br.pucminas.aluguelcarros.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Cadastro e login (públicos) e dados do usuário logado. */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/registro/cliente")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse registrarCliente(@Valid @RequestBody RegistroClienteRequest req) {
        return authService.registrarCliente(req);
    }

    @PostMapping("/registro/agente")
    @ResponseStatus(HttpStatus.CREATED)
    public LoginResponse registrarAgente(@Valid @RequestBody RegistroAgenteRequest req) {
        return authService.registrarAgente(req);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public UsuarioResponse me(@AuthenticationPrincipal UsuarioAutenticado usuario) {
        return authService.me(usuario);
    }
}
