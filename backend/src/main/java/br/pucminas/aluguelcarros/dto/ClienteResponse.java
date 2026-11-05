package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Rendimento;

import java.math.BigDecimal;
import java.util.List;

/** Dados do cliente devolvidos pela API (sem senha). */
public record ClienteResponse(
        Long id,
        String nome,
        String login,
        String endereco,
        String rg,
        String cpf,
        String profissao,
        List<RendimentoResponse> rendimentos,
        BigDecimal rendaTotal
) {

    public static ClienteResponse de(Cliente c) {
        List<RendimentoResponse> rendimentos = c.getRendimentos().stream().map(RendimentoResponse::de).toList();
        BigDecimal total = c.getRendimentos().stream().map(Rendimento::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new ClienteResponse(c.getId(), c.getNome(), c.getLogin(), c.getEndereco(), c.getRg(), c.getCpf(),
                c.getProfissao(), rendimentos, total);
    }
}
