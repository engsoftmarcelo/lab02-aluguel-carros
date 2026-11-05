import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowRight, Building2, FilePlus2, Landmark, ScanSearch, Signature, UserPlus } from 'lucide-react'
import Button from '../../components/ui/Button'
import Logo from '../../components/ui/Logo'
import { useAuth } from '../../context/AuthContext'
import { AutomoveisAPI } from '../../services/api'
import { exibirPlaca, formatarMoeda } from '../../utils/formato'
import { Letras, MQ_ANIMAR, Palavras, useRevelar } from './efeitos'

/* =============================== 02 — Como funciona =============================== */
const PASSOS = [
  { icon: UserPlus, t: 'Cadastro', d: 'Seus dados, profissão e até três rendimentos. Uma vez só.' },
  { icon: FilePlus2, t: 'Pedido', d: 'Escolha o carro e as datas. O valor estimado aparece na hora.' },
  { icon: ScanSearch, t: 'Análise', d: 'Uma empresa ou banco parceiro avalia e registra o parecer.' },
  { icon: Signature, t: 'Contrato', d: 'Aprovado, o pedido vira contrato, com ou sem crédito.' },
]

export function ComoFunciona() {
  const raiz = useRef(null)
  useRevelar(raiz, {
    extra: (el) => {
      const passos = el.querySelectorAll('.passo')
      gsap.fromTo(
        el.querySelector('.passos__linha-luz'),
        { '--progresso': 0 },
        {
          '--progresso': 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el.querySelector('.passos'),
            start: 'top 75%',
            end: 'bottom 55%',
            scrub: true,
            onUpdate: (self) => {
              passos.forEach((p, i) => p.classList.toggle('passo--aceso', self.progress >= i / (passos.length - 1) - 0.02))
            },
          },
        },
      )
    },
  })

  return (
    <section ref={raiz} id="como-funciona" className="secao" aria-labelledby="como-titulo">
      <div className="container">
        <p className="label" data-revelar>
          <span className="accent">02</span> — Como funciona
        </p>
        <h2 id="como-titulo" className="display secao__titulo" data-palavras>
          <Palavras texto="Um traço do pedido ao contrato." destaque={[1]} />
        </h2>
        <ol className="passos">
          <span className="passos__linha" aria-hidden="true">
            <span className="passos__linha-luz" />
          </span>
          {PASSOS.map((p, i) => {
            const Icone = p.icon
            return (
              <li key={p.t} className="passo" data-revelar data-atraso={i * 0.07}>
                <span className="passo__no" aria-hidden="true">
                  <Icone size={18} />
                </span>
                <p className="label">0{i + 1}</p>
                <p className="passo__titulo">{p.t}</p>
                <p className="text-soft">{p.d}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/* =============================== 04 — Números =============================== */
function Contador({ valor, sufixo = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    el.textContent = `${valor}${sufixo}`
    const mm = gsap.matchMedia()
    mm.add(MQ_ANIMAR, () => {
      el.textContent = `0${sufixo}`
      const obj = { v: 0 }
      gsap.to(obj, {
        v: valor,
        duration: 1.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => {
          el.textContent = `${Math.round(obj.v)}${sufixo}`
        },
      })
    })
    return () => mm.revert()
  }, [valor, sufixo])
  return <span ref={ref} className="numero__valor display" />
}

export function Numeros({ frota }) {
  const raiz = useRef(null)
  useRevelar(raiz)
  const fatos = [
    { v: frota, s: '', t: 'modelos na frota', d: 'Cadastrados por empresas e bancos parceiros.' },
    { v: 5, s: '', t: 'status rastreados', d: 'Em análise, aprovado, reprovado, cancelado e contratado.' },
    { v: 3, s: '', t: 'perfis de acesso', d: 'Cliente, empresa e banco, cada um com sua área.' },
    { v: 120, s: 'x', t: 'parcelas no crédito', d: 'Limite de parcelamento nos contratos com banco.' },
  ]
  return (
    <section ref={raiz} className="secao secao--numeros" aria-labelledby="numeros-titulo">
      <div className="container">
        <p className="label" data-revelar>
          <span className="accent">04</span> — Em números
        </p>
        <h2 id="numeros-titulo" className="sr-only">
          Em números
        </h2>
        <dl className="numeros">
          {fatos.map((f, i) => (
            <div key={f.t} className="numero" data-revelar data-atraso={i * 0.07}>
              <dd>
                <Contador valor={f.v} sufixo={f.s} />
              </dd>
              <dt>
                <span className="numero__titulo">{f.t}</span>
                <span className="text-soft">{f.d}</span>
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/* =============================== 05 — Frota =============================== */
/** Mesmos carros do DataSeeder do backend (usados quando o visitante não está logado). */
export const FROTA_EXEMPLO = [
  { id: 1, marca: 'BYD', modelo: 'Dolphin', ano: 2024, placa: 'RTA1B23', valorDiaria: 219.9 },
  { id: 2, marca: 'Toyota', modelo: 'Corolla Cross', ano: 2025, placa: 'RTB2C34', valorDiaria: 289.9 },
  { id: 3, marca: 'Jeep', modelo: 'Compass', ano: 2024, placa: 'RTC3D45', valorDiaria: 319.9 },
  { id: 4, marca: 'Volkswagen', modelo: 'Nivus', ano: 2023, placa: 'RTD4E56', valorDiaria: 199.9 },
  { id: 5, marca: 'Honda', modelo: 'Civic Hybrid', ano: 2025, placa: 'RTE5F67', valorDiaria: 349.9 },
  { id: 6, marca: 'Fiat', modelo: 'Pulse', ano: 2024, placa: 'RTF6G78', valorDiaria: 169.9 },
]

export function useFrota() {
  const { autenticado } = useAuth()
  const [frota, setFrota] = useState(FROTA_EXEMPLO)
  useEffect(() => {
    if (!autenticado) return
    AutomoveisAPI.listar()
      .then((lista) => lista.length && setFrota(lista))
      .catch(() => {})
  }, [autenticado])
  return frota
}

function CartaoCarro({ carro, indice }) {
  const ref = useRef(null)
  const inclinar = (e) => {
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`)
  }
  const soltar = () => {
    ref.current.style.setProperty('--rx', '0deg')
    ref.current.style.setProperty('--ry', '0deg')
  }
  return (
    <li className="carro" ref={ref} onMouseMove={inclinar} onMouseLeave={soltar} data-cursor>
      <div className="carro__topo">
        <span className="label">{String(indice + 1).padStart(2, '0')}</span>
        <span className="label">{carro.ano}</span>
      </div>
      <p className="carro__marca label">{carro.marca}</p>
      <p className="carro__modelo display">{carro.modelo}</p>
      <svg className="carro__traco" viewBox="0 0 64 28" fill="none" aria-hidden="true">
        <path d="M2 21H17C22 21 23.5 11.5 31 9.5C38.5 7.5 46 10.5 51 15.5L54.5 19C55.6 20.1 57.1 21 58.7 21H62" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <div className="carro__base">
        <span className="carro__placa mono">{exibirPlaca(carro.placa)}</span>
        <span>
          <span className="carro__diaria mono">{formatarMoeda(carro.valorDiaria)}</span>
          <span className="label"> /dia</span>
        </span>
      </div>
    </li>
  )
}

export function Frota({ frota }) {
  const raiz = useRef(null)
  const trilho = useRef(null)
  useRevelar(raiz)

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(`${MQ_ANIMAR} and (min-width: 900px)`, () => {
      const distancia = () => Math.max(0, trilho.current.scrollWidth - window.innerWidth + 48)
      gsap.to(trilho.current, {
        x: () => -distancia(),
        ease: 'none',
        scrollTrigger: {
          trigger: raiz.current,
          start: 'top top',
          end: () => `+=${distancia()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
    })
    return () => mm.revert()
  }, [frota.length])

  return (
    <section ref={raiz} id="frota" className="secao frota" aria-labelledby="frota-titulo">
      <div className="container frota__cabecalho">
        <p className="label" data-revelar>
          <span className="accent">05</span> — Frota
        </p>
        <h2 id="frota-titulo" className="display secao__titulo" data-palavras>
          <Palavras texto="Escolha o seu. A gente traça o resto." destaque={[2]} />
        </h2>
      </div>
      <div className="frota__janela">
        <ul ref={trilho} className="frota__trilho">
          {frota.map((c, i) => (
            <CartaoCarro key={c.id} carro={c} indice={i} />
          ))}
          <li className="carro carro--cta">
            <p className="display carro__modelo">Sua vez.</p>
            <p className="text-soft">Crie a conta e faça o primeiro pedido em minutos.</p>
            <Button variant="primary" to="/cadastro" iconRight={ArrowRight}>
              Fazer pedido
            </Button>
          </li>
        </ul>
      </div>
    </section>
  )
}

/* =============================== 06 — Empresas e bancos =============================== */
export function Parceiros() {
  const raiz = useRef(null)
  useRevelar(raiz, {
    extra: (el) => {
      el.querySelectorAll('.parceiro__imagem').forEach((img, i) => {
        gsap.fromTo(
          img,
          { clipPath: i === 0 ? 'polygon(0 0, 0 0, 0 100%, 0 100%)' : 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' },
          { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: img, start: 'top 80%', once: true } },
        )
        gsap.fromTo(img.querySelector('img'), { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    },
  })

  const cards = [
    {
      icon: Building2,
      tipo: 'Empresas',
      titulo: 'Avalie pedidos e gerencie a frota.',
      itens: ['Fila de pedidos com o perfil financeiro do cliente', 'Aprovação ou reprovação com parecer registrado', 'Cadastro e manutenção dos automóveis'],
      img: '/img/foto-interior.webp',
      alt: 'Interior noturno do carro conceito com painel de luz âmbar',
    },
    {
      icon: Landmark,
      tipo: 'Bancos',
      titulo: 'Conceda crédito no mesmo fluxo.',
      itens: ['Contrato de crédito vinculado ao aluguel', 'Taxa, parcelas e valor da parcela calculados na hora', 'O carro pode ficar registrado em nome do banco'],
      img: '/img/foto-farol.webp',
      alt: 'Farol de LED âmbar com gotas de chuva na lataria preta',
    },
  ]

  return (
    <section ref={raiz} id="parceiros" className="secao" aria-labelledby="parceiros-titulo">
      <div className="container">
        <p className="label" data-revelar>
          <span className="accent">06</span> — Para empresas e bancos
        </p>
        <h2 id="parceiros-titulo" className="display secao__titulo" data-palavras>
          <Palavras texto="Do outro lado do traço." destaque={[4]} />
        </h2>
        <div className="parceiros">
          {cards.map((c) => {
            const Icone = c.icon
            return (
              <article key={c.tipo} className="parceiro">
                <div className="parceiro__imagem">
                  <img src={c.img} alt={c.alt} loading="lazy" />
                </div>
                <div className="parceiro__texto" data-revelar>
                  <p className="label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icone size={16} className="accent" aria-hidden="true" /> {c.tipo}
                  </p>
                  <h3 className="parceiro__titulo">{c.titulo}</h3>
                  <ul className="parceiro__lista">
                    {c.itens.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>
        <div className="parceiros__cta" data-revelar>
          <Button variant="secondary" to="/cadastro" iconRight={ArrowRight}>
            Cadastrar minha empresa ou banco
          </Button>
        </div>
      </div>
    </section>
  )
}

/* =============================== 07 — CTA final + rodapé =============================== */
export function CtaFinal() {
  const raiz = useRef(null)
  useRevelar(raiz, {
    extra: (el) => {
      gsap.fromTo(el.querySelector('.cta__fundo img'), { scale: 1.15, yPercent: -6 }, { scale: 1, yPercent: 6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    },
  })
  return (
    <section ref={raiz} className="cta" aria-labelledby="cta-titulo">
      <div className="cta__fundo" aria-hidden="true">
        <img src="/img/foto-perfil.webp" alt="" loading="lazy" />
      </div>
      <div className="container cta__conteudo">
        <p className="label" data-revelar>
          <span className="accent">07</span> — Comece agora
        </p>
        <h2 id="cta-titulo" className="display cta__titulo" data-letras>
          <Letras texto="Seu próximo carro começa com um traço." />
        </h2>
        <div className="hero__ctas" data-revelar>
          <Button variant="primary" size="lg" to="/cadastro" iconRight={ArrowRight}>
            Criar conta
          </Button>
          <Button variant="secondary" size="lg" to="/entrar">
            Já tenho conta
          </Button>
        </div>
      </div>
    </section>
  )
}

export function Rodape() {
  return (
    <footer className="rodape">
      <div className="container rodape__grade">
        <div>
          <Logo />
          <p className="text-soft" style={{ marginTop: 'var(--s-3)', maxWidth: 360 }}>
            O carro certo, no traço certo.
          </p>
        </div>
        <nav aria-label="Rodapé" className="rodape__links">
          <a href="#como-funciona">Como funciona</a>
          <a href="#frota">Frota</a>
          <a href="#parceiros">Empresas e bancos</a>
          <a href="/entrar">Entrar</a>
          <a href="/cadastro">Criar conta</a>
        </nav>
        <div className="rodape__creditos">
          <p className="label">LAB02 — DIAW · Engenharia de Software · PUC Minas</p>
          <p className="text-soft">Imagens e vídeos gerados com Google Flow (Veo/Imagen) a partir de prompts próprios. Carro conceito sem marca.</p>
        </div>
      </div>
    </footer>
  )
}
