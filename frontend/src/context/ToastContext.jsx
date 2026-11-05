import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONES = { sucesso: CheckCircle2, erro: AlertTriangle, info: Info }

/** Notificações empilhadas no canto da tela (somem sozinhas em 4,5 s). */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const seq = useRef(0)

  const fechar = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const mostrar = useCallback(
    (tipo, titulo, mensagem) => {
      const id = ++seq.current
      setToasts((t) => [...t.slice(-3), { id, tipo, titulo, mensagem }])
      setTimeout(() => fechar(id), 4500)
    },
    [fechar],
  )

  const api = useMemo(
    () => ({
      sucesso: (titulo, msg) => mostrar('sucesso', titulo, msg),
      erro: (titulo, msg) => mostrar('erro', titulo, msg),
      info: (titulo, msg) => mostrar('info', titulo, msg),
    }),
    [mostrar],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="region" aria-label="Notificações" aria-live="polite">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const Icone = ICONES[t.tipo]
            return (
              <motion.div
                key={t.id}
                layout
                className={`toast toast--${t.tipo}`}
                role={t.tipo === 'erro' ? 'alert' : 'status'}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              >
                <Icone className="toast__icone" aria-hidden="true" />
                <div>
                  <p className="toast__titulo">{t.titulo}</p>
                  {t.mensagem && <p className="toast__msg">{t.mensagem}</p>}
                </div>
                <button className="toast__fechar" onClick={() => fechar(t.id)} aria-label="Fechar notificação">
                  <X size={16} />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>')
  return ctx
}
