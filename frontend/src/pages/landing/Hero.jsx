import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ArrowRight } from 'lucide-react'
import Button from '../../components/ui/Button'
import { MQ_ANIMAR, Palavras } from './efeitos'
import useScrub from './useScrub'
import { SEQUENCIAS } from './quadros'

const LEGENDAS = [
  { n: '01', t: 'Escolha o carro', d: 'Frota completa, diária e valor estimado na hora.' },
  { n: '02', t: 'Análise financeira', d: 'Empresas e bancos avaliam sua renda e dão o parecer.' },
  { n: '03', t: 'Contrato assinado', d: 'Com ou sem crédito bancário, tudo no mesmo traço.' },
]

/** Hero pinado: o carro gira conforme o scroll (158 quadros) e três legendas entram e saem. */
export default function Hero({ pronto }) {
  const secao = useRef(null)
  const canvas = useRef(null)

  useScrub({
    nome: 'hero',
    secaoRef: secao,
    canvasRef: canvas,
    duracao: '+=320%',
    montarTimeline: (tl, raiz) => {
      tl.to(raiz.querySelector('.hero__texto'), { yPercent: -18, opacity: 0, duration: 0.18 }, 0.04)
      tl.to(raiz.querySelector('.hero__rolar'), { opacity: 0, duration: 0.06 }, 0)
      raiz.querySelectorAll('.hero__legenda').forEach((el, i) => {
        const inicio = 0.22 + i * 0.25
        tl.fromTo(el, { opacity: 0, y: 40, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.07 }, inicio)
        if (i < LEGENDAS.length - 1) tl.to(el, { opacity: 0, y: -30, duration: 0.06 }, inicio + 0.17)
      })
      tl.fromTo(raiz.querySelector('.hero__barra span'), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
    },
  })

  // Reveal do título palavra por palavra quando o carregamento termina.
  useEffect(() => {
    if (!pronto) return undefined
    const mm = gsap.matchMedia()
    mm.add(MQ_ANIMAR, () => {
      const raiz = secao.current
      const tl = gsap.timeline({ delay: 0.15 })
      tl.from(raiz.querySelectorAll('.hero__titulo .palavra'), { yPercent: 115, duration: 1, ease: 'expo.out', stagger: 0.06 })
        .from(raiz.querySelectorAll('[data-hero-entrar]'), { y: 20, opacity: 0, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, '-=0.6')
        .from(canvas.current, { opacity: 0, scale: 1.06, duration: 1.6, ease: 'expo.out' }, 0)
    })
    return () => mm.revert()
  }, [pronto])

  return (
    <section ref={secao} className="hero" aria-label="Apresentação">
      <canvas ref={canvas} className="hero__canvas" aria-hidden="true" />
      <img className="hero__estatica" src={SEQUENCIAS.hero.estatica} alt="Cupê conceito preto com contorno de luz âmbar em estúdio escuro" />
      <div className="hero__vinheta" aria-hidden="true" />

      <div className="container hero__conteudo">
        <div className="hero__texto">
          <p className="label" data-hero-entrar>
            TRAÇO — aluguel de carros
          </p>
          <h1 className="display hero__titulo">
            <Palavras texto={'O carro certo, no traço certo.'} destaque={[4]} />
          </h1>
          <p className="hero__sub" data-hero-entrar>
            Peça, acompanhe e contrate seu aluguel em um único fluxo, analisado por empresas e bancos parceiros.
          </p>
          <div className="hero__ctas" data-hero-entrar>
            <Button variant="primary" size="lg" to="/cadastro" iconRight={ArrowRight}>
              Começar agora
            </Button>
            <Button variant="secondary" size="lg" to="/entrar">
              Entrar
            </Button>
          </div>
        </div>

        <ol className="hero__legendas">
          {LEGENDAS.map((l) => (
            <li key={l.n} className="hero__legenda">
              <p className="label">
                <span className="accent">{l.n}</span> — {l.t}
              </p>
              <p className="hero__legenda-titulo display">{l.t}</p>
              <p className="text-soft">{l.d}</p>
            </li>
          ))}
        </ol>

        <div className="hero__rolar label" data-hero-entrar aria-hidden="true">
          <span className="hero__rolar-linha" />
          Role para ver o traço
        </div>
        <div className="hero__barra" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  )
}
