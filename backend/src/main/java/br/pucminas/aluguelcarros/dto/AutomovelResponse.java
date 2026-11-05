package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.TipoProprietario;
import br.pucminas.aluguelcarros.model.Usuario;

import java.math.BigDecimal;

public record AutomovelResponse(
        Long id,
        String matricula,
        Integer ano,
        String marca,
        String modelo,
        String placa,
        BigDecimal valorDiaria,
        TipoProprietario tipoProprietario,
        Long proprietarioId,
        String proprietarioNome
) {

    public static AutomovelResponse de(Automovel a) {
        Usuario p = a.getProprietario();
        return new AutomovelResponse(a.getId(), a.getMatricula(), a.getAno(), a.getMarca(), a.getModelo(),
                a.getPlaca(), a.getValorDiaria(), a.getTipoProprietario(),
                p == null ? null : p.getId(), p == null ? null : p.getNome());
    }
}
