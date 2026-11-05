import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogoMarca } from '../../components/ui/Logo'
import { carregarSequencia } from './quadros'

/**
 * Tela de carregamento com a porcentagem REAL dos quadros do hero.
 * Libera a página quando ~20% dos quadros chegaram (o 1º e 1 a cada 4 já cobrem o scrub) ou após 6 s.
 */
export default function Carregamento({ onPronto }) {
  const [progresso, setProgresso] = useState(0)
  const [visivel, setVisivel] = useState(true)

  useEffect(() => {
    let liberado = false
    const liberar = () => {
      if (liberado) return
      liberado = true
      setVisivel(false)
      onPronto?.()
    }
    carregarSequencia('hero', (p) => {
      setProgresso(p)
      if (p >= 0.2) setTimeout(liberar, 350)
    })
    carregarSequencia('tech')
    const limite = setTimeout(liberar, 6000)
    return () => clearTimeout(limite)
  }, [onPronto])

  const pct = Math.min(100, Math.round((progresso / 0.2) * 100))

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          className="carregamento"
          role="status"
          aria-live="polite"
          aria-label={`Carregando ${pct}%`}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
        >
          <div className="logo logo--animado carregamento__marca">
            <LogoMarca />
          </div>
          <div className="carregamento__linha">
            <span style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <p className="label">
            Carregando <span className="mono accent">{String(pct).padStart(3, '0')}%</span>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
