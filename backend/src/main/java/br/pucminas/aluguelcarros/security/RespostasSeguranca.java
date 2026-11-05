package br.pucminas.aluguelcarros.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;

/** Respostas JSON para 401/403 geradas na camada de filtros (antes de chegar aos controllers). */
public final class RespostasSeguranca {

    private RespostasSeguranca() {
    }

    public static AuthenticationEntryPoint naoAutenticado() {
        return (req, res, ex) -> escrever(req, res, HttpStatus.UNAUTHORIZED, "Faça login para continuar.");
    }

    public static AccessDeniedHandler acessoNegado() {
        return (req, res, ex) -> escrever(req, res, HttpStatus.FORBIDDEN,
                "Você não tem permissão para realizar esta ação.");
    }

    private static void escrever(HttpServletRequest req, HttpServletResponse res, HttpStatus status, String mensagem)
            throws IOException {
        res.setStatus(status.value());
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        res.setCharacterEncoding(StandardCharsets.UTF_8.name());
        String json = """
                {"timestamp":"%s","status":%d,"erro":"%s","mensagem":"%s","caminho":"%s"}"""
                .formatted(OffsetDateTime.now(), status.value(), status.getReasonPhrase(), mensagem,
                        req.getRequestURI().replace("\"", ""));
        res.getWriter().write(json);
    }
}
