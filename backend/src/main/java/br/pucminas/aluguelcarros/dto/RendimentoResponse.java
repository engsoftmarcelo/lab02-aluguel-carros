package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Rendimento;

import java.math.BigDecimal;

public record RendimentoResponse(Long id, String entidadeEmpregadora, BigDecimal valor) {

    public static RendimentoResponse de(Rendimento r) {
        return new RendimentoResponse(r.getId(), r.getEntidadeEmpregadora(), r.getValor());
    }
}
