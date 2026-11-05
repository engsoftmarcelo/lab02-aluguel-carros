import { useCallback, useEffect, useState } from 'react'
import { lerErro } from '../services/api'

/** Carrega dados da API com estados de carregando/erro e função para recarregar. */
export default function useCarregar(buscar, deps = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: '' })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recarregar = useCallback(() => {
    setEstado((e) => ({ ...e, carregando: true, erro: '' }))
    return buscar()
      .then((dados) => setEstado({ dados, carregando: false, erro: '' }))
      .catch((err) => setEstado({ dados: null, carregando: false, erro: lerErro(err).mensagem }))
  }, deps)

  useEffect(() => {
    recarregar()
  }, [recarregar])

  const setDados = useCallback((d) => setEstado((e) => ({ ...e, dados: typeof d === 'function' ? d(e.dados) : d })), [])

  return { ...estado, recarregar, setDados }
}
