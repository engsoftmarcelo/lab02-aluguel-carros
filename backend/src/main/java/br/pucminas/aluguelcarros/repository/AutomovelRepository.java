package br.pucminas.aluguelcarros.repository;

import br.pucminas.aluguelcarros.model.Automovel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AutomovelRepository extends JpaRepository<Automovel, Long> {

    boolean existsByPlaca(String placa);

    boolean existsByPlacaAndIdNot(String placa, Long id);

    boolean existsByMatricula(String matricula);

    boolean existsByMatriculaAndIdNot(String matricula, Long id);

    List<Automovel> findAllByOrderByMarcaAscModeloAsc();

    @Query("""
            select a from Automovel a
            where lower(a.marca) like lower(concat('%', :termo, '%'))
               or lower(a.modelo) like lower(concat('%', :termo, '%'))
            order by a.marca, a.modelo
            """)
    List<Automovel> buscar(@Param("termo") String termo);
}
