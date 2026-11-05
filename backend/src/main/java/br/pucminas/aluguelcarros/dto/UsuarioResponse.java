package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Agente;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Papel;
import br.pucminas.aluguelcarros.model.Usuario;
import com.fasterxml.jackson.annotation.JsonInclude;

/** Dados públicos do usuário logado (sem senha). */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record UsuarioResponse(
        Long id,
        String nome,
        String login,
        String endereco,
        Papel papel,
        boolean agente,
        String cpf,
        String cnpj
) {

    public static UsuarioResponse de(Usuario u) {
        String cpf = u instanceof Cliente c ? c.getCpf() : null;
        String cnpj = u instanceof Agente a ? a.getCnpj() : null;
        return new UsuarioResponse(u.getId(), u.getNome(), u.getLogin(), u.getEndereco(), u.getPapel(),
                u.getPapel().isAgente(), cpf, cnpj);
    }
}
