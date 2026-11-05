import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import StatusBadge, { STATUS } from '../../components/ui/StatusBadge'
import LinhaDoTempo from '../../components/pedido/LinhaDoTempo'
import FotoCarro from '../../components/carro/FotoCarro'
import { QuadroJornada } from '../../components/pedido/Pedido'
import { exibirPlaca, formatarData, formatarMoeda, hojeISO } from '../../utils/formato'
import { Palavras, useRevelar } from './efeitos'

const CARRO = { marca: 'Toyota', modelo: 'Corolla Cross', ano: 2025, placa: 'RTB2C34', valorDiaria: 289.9 }
const DIARIAS = 3

const MOMENTOS = [
  {
    status: 'EM_ANALISE',
    titulo: 'Antes de enviar, o total.',
    texto: 'Diárias × valor da diária, sem taxa escondida. Você vê o total do período antes de enviar, e o pedido não gera cobrança.',
  },
  {
    status: 'APROVADO',
    titulo: 'Na análise, um parecer por escrito.',
    texto: 'Uma empresa ou banco parceiro avalia sua renda e registra o motivo da decisão. Você sabe o que já está definido e o que ainda falta.',
  },
  {
    status: 'CONTRATADO',
    titulo: 'Estimativa só vira contrato no contrato.',
    texto: 'O valor fica definitivo quando o agente gera o contrato. Com crédito de banco, parcela, juros e total pago aparecem lado a lado.',
  },
]

/** 04 — Tudo à vista: um passaporte de exemplo avança de etapa conforme a leitura (ou pelos botões). */
export default function TudoAVista() {
  const raiz = useRef(null)
  const [etapa, setEtapa] = useState(0)
  const status = MOMENTOS[etapa].status
  const inicio = hojeISO(10)
  const fim = hojeISO(10 + DIARIAS)
  useRevelar(raiz)

  useEffect(() => {
    const blocos = raiz.current.querySelectorAll('.vista__momento')
    const gatilhos = [...blocos].map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 62%',
        end: 'bottom 62%',
        onToggle: (self) => self.isActive && setEtapa(i),
      }),
    )
    return () => gatilhos.forEach((g) => g.kill())
  }, [])

  // destaca o momento ativo
  useEffect(() => {
    const blocos = raiz.current.querySelectorAll('.vista__momento')
    blocos.forEach((b, i) => b.classList.toggle('vista__momento--ativo', i === etapa))
    const total = raiz.current.querySelector('.vista__numero')
    if (total) gsap.fromTo(total, { opacity: 0.4 }, { opacity: 1, duration: 0.5, ease: 'power2.out' })
  }, [etapa])

  return (
    <section ref={raiz} id="tudo-a-vista" className="secao vista" aria-labelledby="vista-titulo">
      <div className="container">
        <p className="label" data-revelar>
          <span className="accent">02</span> — Tudo à vista
        </p>
        <h2 id="vista-titulo" className="display secao__titulo" data-palavras>
          <Palavras texto="Sem letra miúda. Do total ao próximo passo." destaque={[2]} />
        </h2>

        <div className="vista__grade">
          <div className="vista__palco">
            <article className="vista__passaporte" aria-label="Exemplo de passaporte de pedido">
              <FotoCarro carro={CARRO} tamanho="capa" sizes="(max-width: 900px) 100vw, 560px" className="vista__foto" />
              <div className="vista__corpo">
                <div className="vista__topo">
                  <p className="label">Passaporte #0042 · exemplo</p>
                  <StatusBadge status={status} />
                </div>
                <p className="passaporte__carro">
                  {CARRO.marca} <span>{CARRO.modelo}</span>
                </p>
                <p className="passaporte__meta">
                  <span className="placa">{exibirPlaca(CARRO.placa)}</span>
                  <span>
                    {formatarData(inicio)} → {formatarData(fim)}
                  </span>
                </p>
                <div className="vista__total">
                  <span className="label">{status === 'CONTRATADO' ? 'Total do período · contratado' : 'Total estimado do período'}</span>
                  <span className="vista__numero">{formatarMoeda(CARRO.valorDiaria * DIARIAS)}</span>
                  <span className="text-soft mono">
                    {DIARIAS} diárias × {formatarMoeda(CARRO.valorDiaria)} · taxas extras: nenhuma
                  </span>
                </div>
                <LinhaDoTempo key={status} status={status} animar />
                <div className="vista__jornada" aria-live="polite">
                  <QuadroJornada status={status} />
                </div>
              </div>
            </article>
            <div className="vista__controles" role="group" aria-label="Ver o exemplo em outra etapa">
              {MOMENTOS.map((m, i) => (
                <button key={m.status} type="button" className="chip" aria-pressed={etapa === i} onClick={() => setEtapa(i)}>
                  {STATUS[m.status].label}
                </button>
              ))}
            </div>
          </div>

          <ol className="vista__momentos">
            {MOMENTOS.map((m, i) => (
              <li key={m.status} className="vista__momento">
                <span className="vista__indice mono">0{i + 1}</span>
                <h3 className="vista__titulo-momento">{m.titulo}</h3>
                <p className="text-soft">{m.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
