package br.pucminas.aluguelcarros.repository;

import br.pucminas.aluguelcarros.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    boolean existsByCpf(String cpf);

    boolean existsByCpfAndIdNot(String cpf, Long id);

    List<Cliente> findAllByOrderByNomeAsc();

    @Query("""
            select c from Cliente c
            where lower(c.nome) like lower(concat('%', :termo, '%'))
               or c.cpf like concat('%', :termo, '%')
            order by c.nome
            """)
    List<Cliente> buscar(@Param("termo") String termo);
}
