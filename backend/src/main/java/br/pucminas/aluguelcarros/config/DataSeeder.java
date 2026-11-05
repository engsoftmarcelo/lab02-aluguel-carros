package br.pucminas.aluguelcarros.config;

import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.Banco;
import br.pucminas.aluguelcarros.model.Cliente;
import br.pucminas.aluguelcarros.model.Empresa;
import br.pucminas.aluguelcarros.model.Rendimento;
import br.pucminas.aluguelcarros.model.TipoProprietario;
import br.pucminas.aluguelcarros.repository.AutomovelRepository;
import br.pucminas.aluguelcarros.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Popula o banco com contas e automóveis de demonstração, apenas se ele estiver vazio.
 * As senhas são de teste (documentadas no README), não são dados reais.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    public static final String SENHA_DEMO = "demo123";

    private final UsuarioRepository usuarioRepository;
    private final AutomovelRepository automovelRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarioRepository.count() > 0) {
            return;
        }
        String senha = passwordEncoder.encode(SENHA_DEMO);

        Cliente cliente = new Cliente("cliente@demo.com", senha, "Ana Beatriz Souza",
                "Rua da Bahia, 1200 - Centro, Belo Horizonte/MG", "MG-12.345.678", "52998224725",
                "Engenheira de Software");
        cliente.adicionarRendimento(new Rendimento("TechMinas Sistemas", new BigDecimal("9800.00")));
        cliente.adicionarRendimento(new Rendimento("Consultoria freelancer", new BigDecimal("2500.00")));
        usuarioRepository.save(cliente);

        Empresa empresa = usuarioRepository.save(new Empresa("empresa@demo.com", senha, "Locadora Demo Ltda",
                "Av. do Contorno, 5000 - Funcionários, Belo Horizonte/MG", "11222333000181"));

        usuarioRepository.save(new Banco("banco@demo.com", senha, "Banco Demo S.A.",
                "Av. Afonso Pena, 3000 - Savassi, Belo Horizonte/MG", "33444555000172"));

        List<Automovel> frota = List.of(
                carro("00912345671", 2024, "BYD", "Dolphin", "RTA1B23", "219.90", empresa),
                carro("00912345672", 2025, "Toyota", "Corolla Cross", "RTB2C34", "289.90", empresa),
                carro("00912345673", 2024, "Jeep", "Compass", "RTC3D45", "319.90", empresa),
                carro("00912345674", 2023, "Volkswagen", "Nivus", "RTD4E56", "199.90", empresa),
                carro("00912345675", 2025, "Honda", "Civic Hybrid", "RTE5F67", "349.90", empresa),
                carro("00912345676", 2024, "Fiat", "Pulse", "RTF6G78", "169.90", empresa)
        );
        automovelRepository.saveAll(frota);

        log.info("Seed de demonstração criado: 3 usuários (senha '{}') e {} automóveis.", SENHA_DEMO, frota.size());
    }

    private Automovel carro(String matricula, int ano, String marca, String modelo, String placa,
                            String diaria, Empresa proprietaria) {
        Automovel a = new Automovel();
        a.setMatricula(matricula);
        a.setAno(ano);
        a.setMarca(marca);
        a.setModelo(modelo);
        a.setPlaca(placa);
        a.setValorDiaria(new BigDecimal(diaria));
        a.setTipoProprietario(TipoProprietario.EMPRESA);
        a.setProprietario(proprietaria);
        return a;
    }
}
