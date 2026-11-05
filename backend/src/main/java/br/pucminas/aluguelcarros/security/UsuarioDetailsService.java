package br.pucminas.aluguelcarros.security;

import br.pucminas.aluguelcarros.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Carrega o usuário pelo login (e-mail) para o Spring Security. */
@Service
@RequiredArgsConstructor
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UsuarioAutenticado loadUserByUsername(String login) {
        return usuarioRepository.findByLoginIgnoreCase(login)
                .map(UsuarioAutenticado::de)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));
    }
}
