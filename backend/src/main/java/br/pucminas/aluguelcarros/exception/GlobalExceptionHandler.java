package br.pucminas.aluguelcarros.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/** Converte exceções em respostas JSON amigáveis e consistentes. */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String MSG_CAMPOS = "Há campos inválidos. Verifique e tente novamente.";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroResponse> validacao(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> campos = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> campos.putIfAbsent(e.getField(), e.getDefaultMessage()));
        ex.getBindingResult().getGlobalErrors()
                .forEach(e -> campos.putIfAbsent(e.getObjectName(), e.getDefaultMessage()));
        return resposta(HttpStatus.BAD_REQUEST, MSG_CAMPOS, req, campos);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErroResponse> violacao(ConstraintViolationException ex, HttpServletRequest req) {
        Map<String, String> campos = new LinkedHashMap<>();
        ex.getConstraintViolations()
                .forEach(v -> campos.putIfAbsent(v.getPropertyPath().toString(), v.getMessage()));
        return resposta(HttpStatus.BAD_REQUEST, MSG_CAMPOS, req, campos);
    }

    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErroResponse> naoEncontrado(RecursoNaoEncontradoException ex, HttpServletRequest req) {
        return resposta(HttpStatus.NOT_FOUND, ex.getMessage(), req, null);
    }

    @ExceptionHandler(ConflitoException.class)
    public ResponseEntity<ErroResponse> conflito(ConflitoException ex, HttpServletRequest req) {
        return resposta(HttpStatus.CONFLICT, ex.getMessage(), req, null);
    }

    @ExceptionHandler(RegraNegocioException.class)
    public ResponseEntity<ErroResponse> regraNegocio(RegraNegocioException ex, HttpServletRequest req) {
        return resposta(HttpStatus.UNPROCESSABLE_CONTENT, ex.getMessage(), req, null);
    }

    @ExceptionHandler(AcessoNegadoException.class)
    public ResponseEntity<ErroResponse> acessoNegado(AcessoNegadoException ex, HttpServletRequest req) {
        return resposta(HttpStatus.FORBIDDEN, ex.getMessage(), req, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErroResponse> semPermissao(AccessDeniedException ex, HttpServletRequest req) {
        return resposta(HttpStatus.FORBIDDEN, "Você não tem permissão para realizar esta ação.", req, null);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErroResponse> credenciais(BadCredentialsException ex, HttpServletRequest req) {
        return resposta(HttpStatus.UNAUTHORIZED, "Login ou senha inválidos.", req, null);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErroResponse> autenticacao(AuthenticationException ex, HttpServletRequest req) {
        return resposta(HttpStatus.UNAUTHORIZED, "Faça login para continuar.", req, null);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroResponse> integridade(DataIntegrityViolationException ex, HttpServletRequest req) {
        log.warn("Violação de integridade: {}", ex.getMostSpecificCause().getMessage());
        return resposta(HttpStatus.CONFLICT,
                "Operação não permitida: o registro está duplicado ou em uso por outros dados.", req, null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroResponse> corpoInvalido(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return resposta(HttpStatus.BAD_REQUEST, "O corpo da requisição está mal formatado.", req, null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErroResponse> tipoInvalido(MethodArgumentTypeMismatchException ex, HttpServletRequest req) {
        return resposta(HttpStatus.BAD_REQUEST, "Valor inválido para o parâmetro \"" + ex.getName() + "\".", req, null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErroResponse> metodo(HttpRequestMethodNotSupportedException ex, HttpServletRequest req) {
        return resposta(HttpStatus.METHOD_NOT_ALLOWED, "Método HTTP não suportado para este endereço.", req, null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroResponse> rotaInexistente(NoResourceFoundException ex, HttpServletRequest req) {
        return resposta(HttpStatus.NOT_FOUND, "Endereço não encontrado.", req, null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroResponse> inesperado(Exception ex, HttpServletRequest req) {
        log.error("Erro inesperado em {} {}", req.getMethod(), req.getRequestURI(), ex);
        return resposta(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocorreu um erro inesperado. Tente novamente em instantes.", req, null);
    }

    private ResponseEntity<ErroResponse> resposta(HttpStatus status, String mensagem,
                                                  HttpServletRequest req, Map<String, String> campos) {
        ErroResponse corpo = new ErroResponse(OffsetDateTime.now(), status.value(), status.getReasonPhrase(),
                mensagem, req.getRequestURI(), campos == null || campos.isEmpty() ? null : campos);
        return ResponseEntity.status(status).body(corpo);
    }
}
