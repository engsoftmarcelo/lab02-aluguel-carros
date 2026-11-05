import { Fragment, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
if (import.meta.env.DEV) window.ScrollTrigger = ScrollTrigger

export const MQ_ANIMAR = '(prefers-reduced-motion: no-preference)'

export function prefereMenosMovimento() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Scroll suave (Lenis) sincronizado com o ScrollTrigger. Desligado com movimento reduzido. */
export function useLenis() {
  useEffect(() => {
    if (prefereMenosMovimento()) return undefined
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -72 } })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    window.__lenis = lenis
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      delete window.__lenis
    }
  }, [])
}

/** Divide um texto em palavras mascaradas para o reveal palavra por palavra. */
export function Palavras({ texto, className = '', destaque = [] }) {
  return (
    <span className={className}>
      <span className="sr-only">{texto}</span>
      {texto.split(' ').map((p, i) => (
        <Fragment key={i}>
          <span className="mascara" aria-hidden="true">
            <span className={`palavra ${destaque.includes(i) ? 'accent' : ''}`}>{p}</span>
          </span>{' '}
        </Fragment>
      ))}
    </span>
  )
}

/** Divide um texto em letras (para o stagger de letras). */
export function Letras({ texto, className = '' }) {
  return (
    <span className={className}>
      <span className="sr-only">{texto}</span>
      {texto.split(' ').map((palavra, i) => (
        <Fragment key={i}>
          <span className="mascara" aria-hidden="true" style={{ whiteSpace: 'nowrap' }}>
            {[...palavra].map((l, j) => (
              <span key={j} className="letra">
                {l}
              </span>
            ))}
          </span>{' '}
        </Fragment>
      ))}
    </span>
  )
}

/** Barra de progresso do scroll no topo. */
export function ProgressoScroll() {
  const ref = useRef(null)
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        if (ref.current) ref.current.style.transform = `scaleX(${self.progress})`
      },
    })
    return () => st.kill()
  }, [])
  return <div ref={ref} className="progresso-scroll" aria-hidden="true" />
}

/** Cursor customizado (ponto + anel) só em mouse/trackpad e sem movimento reduzido. */
export function Cursor() {
  const ponto = useRef(null)
  const anel = useRef(null)
  const [ativo, setAtivo] = useState(false)

  useEffect(() => {
    const fino = window.matchMedia('(pointer: fine)').matches
    if (!fino || prefereMenosMovimento()) return undefined
    setAtivo(true)
    document.documentElement.classList.add('cursor-ativo')
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const anelPos = { ...pos }
    let raf
    const mover = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      // só aparece depois do primeiro movimento real do mouse (não fica parado no meio do texto)
      if (!ponto.current?.classList.contains('cursor--visivel')) {
        anelPos.x = pos.x
        anelPos.y = pos.y
        ponto.current?.classList.add('cursor--visivel')
        anel.current?.classList.add('cursor--visivel')
      }
      const alvo = e.target.closest?.('a, button, [data-cursor]')
      anel.current?.classList.toggle('cursor__anel--grande', Boolean(alvo))
    }
    const loop = () => {
      anelPos.x += (pos.x - anelPos.x) * 0.18
      anelPos.y += (pos.y - anelPos.y) * 0.18
      if (ponto.current) ponto.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      if (anel.current) anel.current.style.transform = `translate3d(${anelPos.x}px, ${anelPos.y}px, 0)`
      raf = requestAnimationFrame(loop)
    }
    window.addEventListener('mousemove', mover)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', mover)
      document.documentElement.classList.remove('cursor-ativo')
    }
  }, [])

  if (!ativo) return null
  return (
    <div aria-hidden="true">
      <div ref={anel} className="cursor__anel" />
      <div ref={ponto} className="cursor__ponto" />
    </div>
  )
}

/** Reveal genérico ao entrar na tela: palavras, letras e elementos [data-revelar]. */
export function useRevelar(escopo, opcoes = {}) {
  useEffect(() => {
    if (!escopo.current) return undefined
    const mm = gsap.matchMedia()
    mm.add(MQ_ANIMAR, () => {
      const raiz = escopo.current
      raiz.querySelectorAll('[data-palavras]').forEach((el) => {
        gsap.from(el.querySelectorAll('.palavra'), {
          yPercent: 115,
          duration: 0.8,
          ease: 'expo.out',
          stagger: 0.045,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })
      raiz.querySelectorAll('[data-letras]').forEach((el) => {
        gsap.from(el.querySelectorAll('.letra'), {
          yPercent: 110,
          opacity: 0,
          duration: 0.7,
          ease: 'expo.out',
          stagger: 0.018,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })
      raiz.querySelectorAll('[data-revelar]').forEach((el) => {
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 0.8,
          ease: 'expo.out',
          delay: Number(el.dataset.atraso || 0),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
      opcoes.extra?.(raiz)
    })
    return () => mm.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
