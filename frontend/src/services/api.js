import axios from 'axios'
import { lerSessao, limparSessao } from './sessao'

/** Cliente HTTP da API Spring Boot. O token JWT vai em todas as requisições. */
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api`,
  timeout: 75000, // o servidor gratuito (Render) pode levar ~1 min para acordar
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const sessao = lerSessao()
  if (sessao?.token) {
    config.headers.Authorization = `Bearer ${sessao.token}`
  }
  return config
})

/** Em 401 (token expirado/inválido) a sessão é encerrada e o usuário volta para o login. */
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const status = erro.response?.status
    const rota = erro.config?.url || ''
    const ehAuth = rota.startsWith('/auth/login') || rota.startsWith('/auth/registro')
    if (status === 401 && !ehAuth && lerSessao()) {
      limparSessao()
      if (!window.location.pathname.startsWith('/entrar')) {
        window.location.assign('/entrar?sessao=expirada')
      }
    }
    return Promise.reject(erro)
  },
)

/** Extrai { mensagem, campos } do JSON de erro padrão do backend. */
export function lerErro(erro, padrao = 'Não foi possível concluir. Tente novamente.') {
  if (!erro?.response) {
    return { mensagem: 'Não conseguimos falar com o servidor agora. Se ele estava parado, pode levar até 1 minuto para acordar: tente de novo em instantes.', campos: {} }
  }
  const dados = erro.response.data || {}
  return { mensagem: dados.mensagem || padrao, campos: dados.campos || {}, status: erro.response.status }
}

export default api

// ----- Endpoints -----
export const AuthAPI = {
  login: (login, senha) => api.post('/auth/login', { login, senha }).then((r) => r.data),
  registrarCliente: (dados) => api.post('/auth/registro/cliente', dados).then((r) => r.data),
  registrarAgente: (dados) => api.post('/auth/registro/agente', dados).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
}

export const ClientesAPI = {
  listar: (busca) => api.get('/clientes', { params: { busca: busca || undefined } }).then((r) => r.data),
  criar: (dados) => api.post('/clientes', dados).then((r) => r.data),
  buscar: (id) => api.get(`/clientes/${id}`).then((r) => r.data),
  atualizar: (id, dados) => api.put(`/clientes/${id}`, dados).then((r) => r.data),
  excluir: (id) => api.delete(`/clientes/${id}`),
  meusDados: () => api.get('/clientes/me').then((r) => r.data),
  atualizarMeusDados: (dados) => api.put('/clientes/me', dados).then((r) => r.data),
  excluirMinhaConta: () => api.delete('/clientes/me'),
}

export const AutomoveisAPI = {
  listar: (busca) => api.get('/automoveis', { params: { busca: busca || undefined } }).then((r) => r.data),
  buscar: (id) => api.get(`/automoveis/${id}`).then((r) => r.data),
  criar: (dados) => api.post('/automoveis', dados).then((r) => r.data),
  atualizar: (id, dados) => api.put(`/automoveis/${id}`, dados).then((r) => r.data),
  excluir: (id) => api.delete(`/automoveis/${id}`),
}

export const PedidosAPI = {
  meus: () => api.get('/pedidos/meus').then((r) => r.data),
  todos: (status) => api.get('/pedidos', { params: { status: status || undefined } }).then((r) => r.data),
  buscar: (id) => api.get(`/pedidos/${id}`).then((r) => r.data),
  criar: (dados) => api.post('/pedidos', dados).then((r) => r.data),
  modificar: (id, dados) => api.put(`/pedidos/${id}`, dados).then((r) => r.data),
  cancelar: (id) => api.patch(`/pedidos/${id}/cancelar`).then((r) => r.data),
  avaliar: (id, aprovado, parecer) => api.patch(`/pedidos/${id}/avaliar`, { aprovado, parecer }).then((r) => r.data),
  gerarContrato: (id, dados) => api.post(`/pedidos/${id}/contrato`, dados).then((r) => r.data),
}

export const ContratosAPI = {
  todos: () => api.get('/contratos').then((r) => r.data),
  meus: () => api.get('/contratos/meus').then((r) => r.data),
  buscar: (id) => api.get(`/contratos/${id}`).then((r) => r.data),
}

export const DashboardAPI = {
  resumo: () => api.get('/dashboard/resumo').then((r) => r.data),
}
