package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.Banco;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Empresa;
import br.pucminas.aluguelcarros.model.Papel;
import br.pucminas.aluguelcarros.model.PedidoAluguel;
import br.pucminas.aluguelcarros.model.StatusPedido;
import br.pucminas.aluguelcarros.model.TipoProprietario;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;

/** Objetos de teste reutilizados pelos testes de service. */
final class Fixtures {

    static final LocalDate HOJE = LocalDate.of(2026, 11, 4);
    static final Clock RELOGIO = Clock.fixed(HOJE.atStartOfDay(ZoneId.of("America/Sao_Paulo")).toInstant(),
            ZoneId.of("America/Sao_Paulo"));

    private Fixtures() {
    }

    static Cliente cliente(long id) {
        Cliente c = new Cliente("c" + id + "@teste.com", "hash", "Cliente " + id, "Rua X", "MG-1",
                String.format("%011d", id), "Analista");
        c.setId(id);
        return c;
    }

    static Empresa empresa(long id) {
        Empresa e = new Empresa("e" + id + "@teste.com", "hash", "Empresa " + id, "Av Y", String.format("%014d", id));
        e.setId(id);
        return e;
    }

    static Banco banco(long id) {
        Banco b = new Banco("b" + id + "@teste.com", "hash", "Banco " + id, "Av Z", String.format("%014d", id));
        b.setId(id);
        return b;
    }

    static Automovel automovel(long id, String diaria, Empresa dona) {
        Automovel a = new Automovel();
        a.setId(id);
        a.setMatricula("MAT" + id);
        a.setAno(2025);
        a.setMarca("Marca");
        a.setModelo("Modelo " + id);
        a.setPlaca("ABC1D2" + (id % 10));
        a.setValorDiaria(new BigDecimal(diaria));
        a.setTipoProprietario(TipoProprietario.EMPRESA);
        a.setProprietario(dona);
        return a;
    }

    static PedidoAluguel pedido(long id, Cliente cliente, Automovel automovel, StatusPedido status) {
        PedidoAluguel p = new PedidoAluguel();
        p.setId(id);
        p.setCliente(cliente);
        p.setAutomovel(automovel);
        p.setDataInicio(HOJE.plusDays(10));
        p.setDataFim(HOJE.plusDays(15));
        p.setStatus(status);
        p.recalcularValorEstimado();
        return p;
    }

    static UsuarioAutenticado logado(long id, Papel papel) {
        return new UsuarioAutenticado(id, "x@teste.com", "hash", "Logado " + id, papel);
    }
}
