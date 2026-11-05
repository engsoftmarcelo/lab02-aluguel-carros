import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import Button from './Button'

/** Modal acessível: Esc fecha, foco vai para dentro e volta ao fechar, clique no fundo fecha. */
export default function Modal({ open, onClose, title, subtitle, children, footer, size }) {
  const tituloId = useId()
  const painelRef = useRef(null)
  const reduzir = useReducedMotion()

  useEffect(() => {
    if (!open) return undefined
    const anterior = document.activeElement
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
      if (e.key === 'Tab' && painelRef.current) {
        const focaveis = painelRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        if (!focaveis.length) return
        const primeiro = focaveis[0]
        const ultimo = focaveis[focaveis.length - 1]
        if (e.shiftKey && document.activeElement === primeiro) {
          e.preventDefault()
          ultimo.focus()
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault()
          primeiro.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => {
      const alvo = painelRef.current?.querySelector('input, select, textarea, button:not(.modal__fechar)')
      ;(alvo || painelRef.current)?.focus()
    }, 50)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      anterior?.focus?.()
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-fundo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            ref={painelRef}
            className={`modal ${size === 'lg' ? 'modal--lg' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            tabIndex={-1}
            initial={reduzir ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduzir ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="modal__topo">
              <div>
                <h2 id={tituloId} className="modal__titulo">
                  {title}
                </h2>
                {subtitle && <p className="text-soft" style={{ fontSize: 'var(--fs-small)', marginTop: 4 }}>{subtitle}</p>}
              </div>
              <Button variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Fechar" className="modal__fechar" />
            </div>
            <div className="modal__corpo">{children}</div>
            {footer && <div className="modal__rodape">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
