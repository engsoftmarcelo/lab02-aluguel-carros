package br.pucminas.aluguelcarros.repository;

import br.pucminas.aluguelcarros.model.Banco;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BancoRepository extends JpaRepository<Banco, Long> {
}
