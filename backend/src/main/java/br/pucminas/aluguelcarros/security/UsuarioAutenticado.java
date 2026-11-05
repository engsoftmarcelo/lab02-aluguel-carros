package br.pucminas.aluguelcarros.security;

import br.pucminas.aluguelcarros.model.Papel;
import br.pucminas.aluguelcarros.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * Usuário logado (principal do Spring Security).
 * Authorities: ROLE_CLIENTE, ROLE_EMPRESA ou ROLE_BANCO; agentes também recebem ROLE_AGENTE.
 */
public record UsuarioAutenticado(Long id, String login, String senha, String nome, Papel papel) implements UserDetails {

    public static UsuarioAutenticado de(Usuario u) {
        return new UsuarioAutenticado(u.getId(), u.getLogin(), u.getSenha(), u.getNome(), u.getPapel());
    }

    public boolean isAgente() {
        return papel.isAgente();
    }

    public boolean isCliente() {
        return papel == Papel.CLIENTE;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> roles = new ArrayList<>();
        roles.add(new SimpleGrantedAuthority("ROLE_" + papel.name()));
        if (papel.isAgente()) {
            roles.add(new SimpleGrantedAuthority("ROLE_AGENTE"));
        }
        return roles;
    }

    @Override
    public String getPassword() {
        return senha;
    }

    @Override
    public String getUsername() {
        return login;
    }
}
