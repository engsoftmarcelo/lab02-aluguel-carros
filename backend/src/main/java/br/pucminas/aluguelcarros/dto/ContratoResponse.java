package br.pucminas.aluguelcarros.dto;

import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.Contrato;
import br.pucminas.aluguelcarros.model.ContratoCredito;
import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.TipoProprietario;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ContratoResponse(
        Long id,
        Long pedidoId,
        TipoProprietario tipoPropriedade,
        LocalDate dataAssinatura,
        Long clienteId,
        String clienteNome,
        String automovel,
        String placa,
        String proprietarioAtual,
        LocalDate dataInicio,
        LocalDate dataFim,
        BigDecimal valorAluguel,
        @JsonInclude(JsonInclude.Include.ALWAYS)
        Credito credito
) {

    public record Credito(Long bancoId, String bancoNome, BigDecimal valorFinanciado, BigDecimal taxaJuros,
                          Integer parcelas, BigDecimal valorParcela, BigDecimal totalPago) {
    }

    public static ContratoResponse de(Contrato c) {
        PedidoAluguel p = c.getPedido();
        Automovel a = p.getAutomovel();
        Credito credito = null;
        if (c instanceof ContratoCredito cc) {
            BigDecimal parcela = cc.valorParcela();
            credito = new Credito(cc.getBanco().getId(), cc.getBanco().getNome(), cc.getValorFinanciado(),
                    cc.getTaxaJuros(), cc.getParcelas(), parcela,
                    parcela.multiply(BigDecimal.valueOf(cc.getParcelas())));
        }
        return new ContratoResponse(c.getId(), p.getId(), c.getTipoPropriedade(), c.getDataAssinatura(),
                p.getCliente().getId(), p.getCliente().getNome(), a.getMarca() + " " + a.getModelo(), a.getPlaca(),
                a.getProprietario() == null ? null : a.getProprietario().getNome(),
                p.getDataInicio(), p.getDataFim(), p.getValorEstimado(), credito);
    }
}
