package br.pucminas.aluguelcarros.security;

import br.pucminas.aluguelcarros.model.Papel;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;

/** Gera e valida os tokens JWT (HS256) usados na autenticação stateless. */
@Service
public class JwtService {

    private final SecretKey chave;
    private final long expiracaoMs;

    public JwtService(@Value("${app.jwt.secret}") String segredo,
                      @Value("${app.jwt.expiracao-ms}") long expiracaoMs) {
        if (segredo == null || segredo.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT_SECRET deve ter pelo menos 32 caracteres (veja backend/.env.example).");
        }
        this.chave = Keys.hmacShaKeyFor(segredo.getBytes(StandardCharsets.UTF_8));
        this.expiracaoMs = expiracaoMs;
    }

    public String gerarToken(UsuarioAutenticado usuario) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(usuario.login())
                .claim("id", usuario.id())
                .claim("papel", usuario.papel().name())
                .claim("nome", usuario.nome())
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plusMillis(expiracaoMs)))
                .signWith(chave)
                .compact();
    }

    public Instant expiracao() {
        return Instant.now().plusMillis(expiracaoMs);
    }

    /** Retorna o login (subject) se o token for válido e não estiver expirado. */
    public Optional<String> extrairLogin(String token) {
        return extrairUsuario(token).map(UsuarioAutenticado::login);
    }

    /**
     * Reconstrói o usuário logado a partir das claims assinadas do token (id, papel, nome),
     * sem ir ao banco a cada requisição — o Supabase fica longe e cada consulta custa ~250 ms.
     */
    public Optional<UsuarioAutenticado> extrairUsuario(String token) {
        try {
            Claims c = Jwts.parser().verifyWith(chave).build().parseSignedClaims(token).getPayload();
            Number id = c.get("id", Number.class);
            String papel = c.get("papel", String.class);
            if (c.getSubject() == null || id == null || papel == null) {
                return Optional.empty();
            }
            return Optional.of(new UsuarioAutenticado(id.longValue(), c.getSubject(), null,
                    c.get("nome", String.class), Papel.valueOf(papel)));
        } catch (JwtException | IllegalArgumentException e) {
            return Optional.empty();
        }
    }
}
