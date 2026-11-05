/** Sessão (token + usuário) no localStorage, sempre protegida por try/catch. */
const CHAVE = 'traco.sessao'

export function lerSessao() {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return null
    const sessao = JSON.parse(bruto)
    if (sessao?.expiraEm && new Date(sessao.expiraEm).getTime() < Date.now()) {
      localStorage.removeItem(CHAVE)
      return null
    }
    return sessao
  } catch {
    return null
  }
}

export function salvarSessao(sessao) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(sessao))
  } catch {
    // modo privado/armazenamento bloqueado: a sessão vale só enquanto a aba estiver aberta
  }
}

export function limparSessao() {
  try {
    localStorage.removeItem(CHAVE)
  } catch {
    // ignora
  }
}
