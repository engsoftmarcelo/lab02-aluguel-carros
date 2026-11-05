import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { AuthAPI } from '../services/api'
import { lerSessao, limparSessao, salvarSessao } from '../services/sessao'

const AuthContext = createContext(null)

/** Página inicial de cada papel. */
export const homeDoPapel = (papel) => (papel === 'CLIENTE' ? '/app' : '/agente')

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(() => lerSessao())
  const [validando, setValidando] = useState(Boolean(lerSessao()))

  // Ao abrir o site com uma sessão salva, confirma no backend que o token ainda vale.
  useEffect(() => {
    if (!sessao?.token) {
      setValidando(false)
      return
    }
    let ativo = true
    AuthAPI.me()
      .then((usuario) => {
        if (!ativo) return
        const nova = { ...sessao, usuario }
        salvarSessao(nova)
        setSessao(nova)
      })
      .catch(() => {
        if (!ativo) return
        limparSessao()
        setSessao(null)
      })
      .finally(() => ativo && setValidando(false))
    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const iniciar = useCallback((resposta) => {
    const nova = { token: resposta.token, expiraEm: resposta.expiraEm, usuario: resposta.usuario }
    salvarSessao(nova)
    setSessao(nova)
    return nova.usuario
  }, [])

  const login = useCallback(async (email, senha) => iniciar(await AuthAPI.login(email, senha)), [iniciar])
  const registrarCliente = useCallback(async (dados) => iniciar(await AuthAPI.registrarCliente(dados)), [iniciar])
  const registrarAgente = useCallback(async (dados) => iniciar(await AuthAPI.registrarAgente(dados)), [iniciar])

  const logout = useCallback(() => {
    limparSessao()
    setSessao(null)
  }, [])

  const atualizarUsuario = useCallback((parcial) => {
    setSessao((atual) => {
      if (!atual) return atual
      const nova = { ...atual, usuario: { ...atual.usuario, ...parcial } }
      salvarSessao(nova)
      return nova
    })
  }, [])

  const valor = useMemo(() => {
    const usuario = sessao?.usuario || null
    return {
      usuario,
      autenticado: Boolean(sessao?.token),
      validando,
      isCliente: usuario?.papel === 'CLIENTE',
      isAgente: usuario?.papel === 'EMPRESA' || usuario?.papel === 'BANCO',
      isBanco: usuario?.papel === 'BANCO',
      login,
      registrarCliente,
      registrarAgente,
      logout,
      atualizarUsuario,
    }
  }, [sessao, validando, login, registrarCliente, registrarAgente, logout, atualizarUsuario])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return ctx
}
