package br.pucminas.aluguelcarros.service;

import br.pucminas.aluguelcarros.dto.AutomovelRequest;
import br.pucminas.aluguelcarros.dto.AutomovelResponse;
import br.pucminas.aluguelcarros.exception.ConflitoException;
import br.pucminas.aluguelcarros.exception.RecursoNaoEncontradoException;
import br.pucminas.aluguelcarros.exception.RegraNegocioException;
import br.pucminas.aluguelcarros.model.Automovel;
import br.pucminas.aluguelcarros.model.Papel;
import br.pucminas.aluguelcarros.model.TipoProprietario;
import br.pucminas.aluguelcarros.model.Usuario;
import br.pucminas.aluguelcarros.repository.AutomovelRepository;
import br.pucminas.aluguelcarros.repository.PedidoAluguelRepository;
import br.pucminas.aluguelcarros.repository.UsuarioRepository;
import br.pucminas.aluguelcarros.security.UsuarioAutenticado;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Year;
import java.util.List;

/** Cadastro e manutenção da frota (somente agentes alteram; todos os autenticados consultam). */
@Service
@RequiredArgsConstructor
public class AutomovelService {

    private final AutomovelRepository automovelRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoAluguelRepository pedidoRepository;

    @Transactional(readOnly = true)
    public List<AutomovelResponse> listar(String busca) {
        List<Automovel> lista = StringUtils.hasText(busca)
                ? automovelRepository.buscar(busca.trim())
                : automovelRepository.findAllByOrderByMarcaAscModeloAsc();
        return lista.stream().map(AutomovelResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public AutomovelResponse buscar(Long id) {
        return AutomovelResponse.de(obter(id));
    }

    /** O automóvel nasce como propriedade do agente (empresa ou banco) que o cadastrou. */
    @Transactional
    public AutomovelResponse criar(AutomovelRequest req, UsuarioAutenticado logado) {
        String placa = Documentos.normalizarPlaca(req.placa());
        String matricula = req.matricula().trim();
        validarAno(req.ano());
        if (automovelRepository.existsByPlaca(placa)) {
            throw new ConflitoException("Já existe um automóvel com a placa " + placa + ".");
        }
        if (automovelRepository.existsByMatricula(matricula)) {
            throw new ConflitoException("Já existe um automóvel com a matrícula " + matricula + ".");
        }
        Usuario dono = usuarioRepository.findById(logado.id())
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Usuário", logado.id()));

        Automovel a = new Automovel();
        preencher(a, req, placa, matricula);
        a.setProprietario(dono);
        a.setTipoProprietario(logado.papel() == Papel.BANCO ? TipoProprietario.BANCO : TipoProprietario.EMPRESA);
        return AutomovelResponse.de(automovelRepository.save(a));
    }

    @Transactional
    public AutomovelResponse atualizar(Long id, AutomovelRequest req) {
        Automovel a = obter(id);
        String placa = Documentos.normalizarPlaca(req.placa());
        String matricula = req.matricula().trim();
        validarAno(req.ano());
        if (automovelRepository.existsByPlacaAndIdNot(placa, id)) {
            throw new ConflitoException("Já existe outro automóvel com a placa " + placa + ".");
        }
        if (automovelRepository.existsByMatriculaAndIdNot(matricula, id)) {
            throw new ConflitoException("Já existe outro automóvel com a matrícula " + matricula + ".");
        }
        preencher(a, req, placa, matricula);
        return AutomovelResponse.de(automovelRepository.save(a));
    }

    @Transactional
    public void excluir(Long id) {
        Automovel a = obter(id);
        if (pedidoRepository.existsByAutomovelId(id)) {
            throw new RegraNegocioException(
                    "Não é possível excluir: o automóvel possui pedidos de aluguel registrados.");
        }
        automovelRepository.delete(a);
    }

    private void preencher(Automovel a, AutomovelRequest req, String placa, String matricula) {
        a.setMatricula(matricula);
        a.setAno(req.ano());
        a.setMarca(req.marca().trim());
        a.setModelo(req.modelo().trim());
        a.setPlaca(placa);
        a.setValorDiaria(req.valorDiaria());
    }

    private void validarAno(Integer ano) {
        int maximo = Year.now().getValue() + 1;
        if (ano > maximo) {
            throw new RegraNegocioException("O ano do automóvel não pode ser maior que " + maximo + ".");
        }
    }

    private Automovel obter(Long id) {
        return automovelRepository.findById(id)
                .orElseThrow(() -> RecursoNaoEncontradoException.de("Automóvel", id));
    }
}
