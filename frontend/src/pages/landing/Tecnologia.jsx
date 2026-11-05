import { useRef } from 'react'
import { KeyRound, LineChart, Wallet } from 'lucide-react'
import useScrub from './useScrub'
import { SEQUENCIAS } from './quadros'

const ITENS = [
  { icon: KeyRound, t: 'Seus dados protegidos', d: 'Acesso só com login e senha. Cada requisição viaja com um token assinado (JWT).' },
  { icon: LineChart, t: 'Análise de renda', d: 'Até três fontes de rendimento por cliente, avaliadas por empresas e bancos.' },
  { icon: Wallet, t: 'Crédito com parcela calculada', d: 'Bancos concedem crédito e a parcela sai na hora pela Tabela Price.' },
]

/** "Por dentro do traço": o wireframe vira carro conforme o scroll (111 quadros). */
export default function Tecnologia() {
  const secao = useRef(null)
  const canvas = useRef(null)

  useScrub({
    nome: 'tech',
    secaoRef: secao,
    canvasRef: canvas,
    duracao: '+=240%',
    montarTimeline: (tl, raiz) => {
      tl.from(raiz.querySelector('.tech__cabecalho'), { opacity: 0, y: 30, duration: 0.12 }, 0)
      raiz.querySelectorAll('.tech__item').forEach((el, i) => {
        tl.fromTo(el, { opacity: 0.18, x: -16 }, { opacity: 1, x: 0, duration: 0.1 }, 0.18 + i * 0.22)
        tl.fromTo(el.querySelector('.tech__item-linha'), { scaleY: 0 }, { scaleY: 1, duration: 0.18 }, 0.18 + i * 0.22)
      })
    },
  })

  return (
    <section ref={secao} id="tecnologia" className="tech" aria-labelledby="tech-titulo">
      <canvas ref={canvas} className="tech__canvas" aria-hidden="true" />
      <img className="tech__estatica" src={SEQUENCIAS.tech.estatica} alt="" aria-hidden="true" />
      <div className="tech__vinheta" aria-hidden="true" />
      <div className="container tech__conteudo">
        <div className="tech__cabecalho">
          <p className="label">
            <span className="accent">03</span> — Por dentro do traço
          </p>
          <h2 id="tech-titulo" className="display tech__titulo">
            Do esboço
            <br />
            ao contrato.
          </h2>
        </div>
        <ul className="tech__lista">
          {ITENS.map((it) => {
            const Icone = it.icon
            return (
              <li key={it.t} className="tech__item">
                <span className="tech__item-linha" aria-hidden="true" />
                <Icone size={20} className="accent" aria-hidden="true" />
                <div>
                  <p className="tech__item-titulo">{it.t}</p>
                  <p className="text-soft">{it.d}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
