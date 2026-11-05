package br.pucminas.aluguelcarros.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/** Relógio da aplicação (fuso de São Paulo). Injetável para que os testes usem uma data fixa. */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("America/Sao_Paulo"));
    }
}
