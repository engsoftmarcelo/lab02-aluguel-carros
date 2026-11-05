import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ArrowRight, Building2, CalendarCheck2, CarFront, FileSignature, Landmark, Menu, ScanSearch, X } from 'lucide-react'
import Button from '../components/ui/Button'
import Logo from '../components/ui/Logo'
import StatusBadge from '../components/ui/StatusBadge'
import FotoCarro from '../components/carro/FotoCarro'
import { homeDoPapel, useAuth } from '../context/AuthContext'
import { AutomoveisAPI } from '../services/api'
import { exibirPlaca, formatarMoeda } from '../utils/formato'
import { FOTOS_FROTA } from '../utils/midiaFrota'
import { MQ_ANIMAR, Palavras, useLenis, useRevelar } from './landing/efeitos'
import TudoAVista from './landing/TudoAVista'
import '../styles/landing-arredor.css'
import '../styles/landing-vista.css'

/** Mesmos carros do DataSeeder do backend (vitrine para quem ainda não entrou). */
const FROTA_EXEMPLO = [
  { id: 1, marca: 'BYD', modelo: 'Dolphin', ano: 2024, placa: 'RTA1B23', valorDiaria: 219.9 },
  { id: 2, marca: 'Toyota', modelo: 'Corolla Cross', ano: 2025, placa: 'RTB2C34', valorDiaria: 289.9 },
  { id: 3, marca: 'Jeep', modelo: 'Compass', ano: 2024, placa: 'RTC3D45', valorDiaria: 319.9 },
  { id: 4, marca: 'Volkswagen', modelo: 'Nivus', ano: 2023, placa: 'RTD4E56', valorDiaria: 199.9 },
  { id: 5, marca: 'Honda', modelo: 'Civic Hybrid', ano: 2025, placa: 'RTE5F67', valorDiaria: 349.9 },
  { id: 6, marca: 'Fiat', modelo: 'Pulse', ano: 2024, placa: 'RTF6G78', valorDiaria: 169.9 },
]

function useFrota() {
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

/** Enquadramentos que se abrem ao entrar na tela (assinatura Arredor). Sem animação com movimento reduzido. */
function useMolduras(escopo) {
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MQ_ANIMAR, () => {
      escopo.current.querySelectorAll('[data-moldura]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(14% 18% 14% 18% round 40px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } },
        )
        const img = el.querySelector('img')
        if (img) gsap.fromTo(img, { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
      })
    })
    return () => mm.revert()
  }, [escopo])
}

/* =============================== Cabeçalho =============================== */
function Cabecalho() {
  const { autenticado, usuario } = useAuth()
  const [aberto, setAberto] = useState(false)
  const [solido, setSolido] = useState(false)
  useEffect(() => {
    const aoRolar = () => setSolido(window.scrollY > 24)
    aoRolar()
    window.addEventListener('scroll', aoRolar, { passive: true })
    return () => window.removeEventListener('scroll', aoRolar)
  }, [])
  const links = [
    ['#como-funciona', 'Como funciona'],
    ['#tudo-a-vista', 'Tudo à vista'],
    ['#frota', 'Frota'],
    ['#parceiros', 'Empresas e bancos'],
  ]
  return (
    <header className={`cab ${solido ? 'cab--solido' : ''}`}>
      <div className="container cab__inner">
        <Logo animado />
        <nav className={`cab__nav ${aberto ? 'cab__nav--aberto' : ''}`} aria-label="Seções">
          {links.map(([href, t]) => (
            <a key={href} href={href} onClick={() => setAberto(false)}>
              {t}
            </a>
          ))}
        </nav>
        <div className="cab__acoes">
          {autenticado ? (
            <Button variant="primary" size="sm" to={homeDoPapel(usuario?.papel)}>
              Ir para o painel
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/entrar" className="cab__entrar">
                Entrar
              </Button>
              <Button variant="primary" size="sm" to="/cadastro">
                Criar conta
              </Button>
            </>
          )}
          <button type="button" className="cab__menu" aria-expanded={aberto} aria-label={aberto ? 'Fechar menu' : 'Abrir menu'} onClick={() => setAberto((v) => !v)}>
            {aberto ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}

/* =============================== 01 — Abertura =============================== */
function Abertura({ frota }) {
  const raiz = useRef(null)
  const { autenticado, usuario } = useAuth()
  const destino = autenticado ? homeDoPapel(usuario?.papel) : '/cadastro'

  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MQ_ANIMAR, () => {
      const el = raiz.current
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from(el.querySelectorAll('.palavra'), { yPercent: 115, duration: 1, stagger: 0.06 }, 0.15)
        .from(el.querySelectorAll('[data-entra]'), { y: 24, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.45)
        .fromTo(el.querySelector('.abertura__principal'), { clipPath: 'inset(18% 22% 18% 22% round 60px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.5 }, 0.1)
        .from(el.querySelector('.abertura__principal img'), { scale: 1.25, duration: 1.8 }, 0.1)
        .fromTo(el.querySelector('.abertura__secundaria'), { clipPath: 'inset(50% 50% 50% 50% round 30px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.2 }, 0.6)
        .from(el.querySelector('.abertura__ficha'), { y: 40, opacity: 0, rotate: -3, duration: 1 }, 0.9)

      // as molduras se afastam devagar com o scroll (profundidade sem sequestrar a rolagem)
      gsap.to(el.querySelector('.abertura__secundaria'), { yPercent: -18, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to(el.querySelector('.abertura__ficha'), { yPercent: -40, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
    })
    return () => mm.revert()
  }, [])

  const destaque = frota.find((c) => /corolla/i.test(c.modelo)) || frota[0]
  const segundo = frota.find((c) => /nivus/i.test(c.modelo)) || frota[1]

  return (
    <section ref={raiz} className="abertura" aria-labelledby="abertura-titulo">
      <div className="container abertura__grade">
        <div className="abertura__texto">
          <p className="label" data-entra>
            Aluguel de carros · pedidos analisados por empresas e bancos
          </p>
          <h1 id="abertura-titulo" className="display abertura__titulo">
            <Palavras texto="Seu próximo lugar começa aqui." destaque={[2]} />
          </h1>
          <p className="abertura__sub" data-entra>
            Escolha um carro de verdade, veja o total antes de enviar e acompanhe a análise até o contrato. Sem cobrança no pedido, sem letra miúda.
          </p>
          <div className="abertura__ctas" data-entra>
            <Button variant="primary" size="lg" to={destino} icon={CarFront}>
              Escolher carro
            </Button>
            <Button variant="secondary" size="lg" to={autenticado ? destino : '/entrar'} iconRight={ArrowRight}>
              Acompanhar pedido
            </Button>
          </div>
          <ul className="abertura__provas" data-entra>
            <li>
              <strong>{frota.length}</strong> carros na frota
            </li>
            <li>
              <strong>Total</strong> antes de enviar
            </li>
            <li>
              <strong>Parecer</strong> por escrito
            </li>
          </ul>
        </div>

        <div className="abertura__colagem">
          <FotoCarro carro={destaque} tamanho="capa" prioridade sizes="(max-width: 900px) 100vw, 640px" rotulo={false} className="abertura__principal" />
          <FotoCarro carro={segundo} tamanho="capa" sizes="260px" rotulo={false} className="abertura__secundaria" />
          <div className="abertura__ficha" aria-hidden="true">
            <div className="abertura__ficha-topo">
              <span className="label">Pedido #0042</span>
              <StatusBadge status="EM_ANALISE" />
            </div>
            <p className="abertura__ficha-carro">
              {destaque.marca} {destaque.modelo}
            </p>
            <p className="abertura__ficha-total">{formatarMoeda(destaque.valorDiaria * 3)}</p>
            <p className="abertura__ficha-sub">3 diárias × {formatarMoeda(destaque.valorDiaria)} · taxas extras: nenhuma</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* =============================== 02 — Como funciona =============================== */
const PASSOS = [
  { icon: CarFront, t: 'Escolha o carro', d: 'Cada card é um automóvel de verdade, com placa e diária. Não é "categoria similar".' },
  { icon: CalendarCheck2, t: 'Defina as datas', d: 'O total do período aparece antes de enviar: diárias × valor da diária.' },
  { icon: ScanSearch, t: 'Análise', d: 'Uma empresa ou banco parceiro avalia sua renda e registra um parecer.' },
  { icon: FileSignature, t: 'Contrato', d: 'Aprovado, o pedido vira contrato, com ou sem crédito de banco.' },
]

function ComoFunciona() {
  const raiz = useRef(null)
  useRevelar(raiz)
  return (
    <section ref={raiz} id="como-funciona" className="secao" aria-labelledby="como-titulo">
      <div className="container">
        <p className="label" data-revelar>
          <span className="accent">01</span> — Como funciona
        </p>
        <h2 id="como-titulo" className="display secao__titulo" data-palavras>
          <Palavras texto="Do carro escolhido ao contrato, em quatro passos." destaque={[2]} />
        </h2>
        <ol className="passos-a">
          {PASSOS.map((p, i) => {
            const Icone = p.icon
            return (
              <li key={p.t} className="passo-a" data-revelar data-atraso={i * 0.08}>
                <span className="passo-a__n">0{i + 1}</span>
                <span className="passo-a__icone" aria-hidden="true">
                  <Icone size={22} />
                </span>
                <h3 className="passo-a__titulo">{p.t}</h3>
                <p className="text-soft">{p.d}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

/* =============================== 04 — Frota =============================== */
function Frota({ frota }) {
  const raiz = useRef(null)
  useRevelar(raiz)
  useMolduras(raiz)
  const { autenticado, usuario } = useAuth()
  const destino = autenticado ? homeDoPapel(usuario?.papel) : '/cadastro'
  return (
    <section ref={raiz} id="frota" className="secao secao--azul" aria-labelledby="frota-titulo">
      <div className="container">
        <div className="frota-a__topo">
          <div>
            <p className="label" data-revelar>
              <span className="accent">03</span> — Frota
            </p>
            <h2 id="frota-titulo" className="display secao__titulo" data-palavras>
              <Palavras texto="Escolha pelo carro, não pela categoria." destaque={[3]} />
            </h2>
          </div>
          <p className="text-soft frota-a__nota" data-revelar>
            Cada pedido é de um automóvel específico, com placa. As fotos são ilustrativas do modelo; cor e estado da unidade podem variar.
          </p>
        </div>
        <ul className="frota-a">
          {frota.map((c, i) => (
            <li key={c.id} className="frota-a__card" data-revelar data-atraso={(i % 3) * 0.06}>
              <div className="frota-a__moldura" data-moldura>
                <FotoCarro carro={c} tamanho="card" sizes="(max-width: 700px) 100vw, 420px" rotulo={false} />
              </div>
              <div className="frota-a__dados">
                <div>
                  <p className="label">
                    {c.marca} · {c.ano}
                  </p>
                  <p className="frota-a__modelo">{c.modelo}</p>
                </div>
                <div className="frota-a__preco">
                  <span className="frota-a__diaria">{formatarMoeda(c.valorDiaria)}</span>
                  <span className="label">por dia</span>
                </div>
              </div>
              <p className="frota-a__rodape">
                <span className="placa">{exibirPlaca(c.placa)}</span>
                <span className="text-soft">3 dias = {formatarMoeda(c.valorDiaria * 3)}</span>
              </p>
            </li>
          ))}
        </ul>
        <div className="frota-a__cta" data-revelar>
          <Button variant="primary" size="lg" to={destino} iconRight={ArrowRight}>
            Escolher meu carro
          </Button>
        </div>
      </div>
    </section>
  )
}

/* =============================== 05 — Empresas e bancos =============================== */
function Parceiros() {
  const raiz = useRef(null)
  useRevelar(raiz)
  useMolduras(raiz)
  const cards = [
    {
      icon: Building2,
      tipo: 'Empresas',
      titulo: 'Avalie pedidos e cuide da frota.',
      itens: ['Fila de pedidos com o perfil financeiro do cliente', 'Aprovação ou reprovação sempre com parecer', 'Cadastro e manutenção dos automóveis'],
      carro: { marca: 'Jeep', modelo: 'Compass' },
    },
    {
      icon: Landmark,
      tipo: 'Bancos',
      titulo: 'Conceda crédito no mesmo fluxo.',
      itens: ['Contrato de crédito vinculado ao aluguel', 'Parcela pela Tabela Price, juros e total pago à vista', 'O carro pode ficar registrado em nome do banco'],
      carro: { marca: 'Honda', modelo: 'Civic' },
    },
  ]
  return (
    <section ref={raiz} id="parceiros" className="secao" aria-labelledby="parceiros-titulo">
      <div className="container">
        <p className="label" data-revelar>
          <span className="accent">04</span> — Para empresas e bancos
        </p>
        <h2 id="parceiros-titulo" className="display secao__titulo" data-palavras>
          <Palavras texto="Do outro lado do pedido." destaque={[4]} />
        </h2>
        <div className="parceiros-a">
          {cards.map((c, i) => {
            const Icone = c.icon
            return (
              <article key={c.tipo} className={`parceiro-a ${i % 2 ? 'parceiro-a--inverso' : ''}`}>
                <div className="parceiro-a__moldura" data-moldura>
                  <FotoCarro carro={c.carro} tamanho="capa" sizes="(max-width: 900px) 100vw, 600px" rotulo={false} />
                </div>
                <div className="parceiro-a__texto" data-revelar>
                  <p className="label parceiro-a__tipo">
                    <Icone size={16} className="accent" aria-hidden="true" /> {c.tipo}
                  </p>
                  <h3 className="parceiro-a__titulo">{c.titulo}</h3>
                  <ul className="parceiro-a__lista">
                    {c.itens.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>
        <div className="parceiros-a__cta" data-revelar>
          <Button variant="secondary" to="/cadastro" iconRight={ArrowRight}>
            Cadastrar minha empresa ou banco
          </Button>
        </div>
      </div>
    </section>
  )
}

/* =============================== 06 — Convite final + rodapé =============================== */
function Convite() {
  const raiz = useRef(null)
  useRevelar(raiz)
  useMolduras(raiz)
  return (
    <section ref={raiz} className="convite-a" aria-labelledby="convite-titulo">
      <div className="container convite-a__grade">
        <div className="convite-a__moldura" data-moldura>
          <FotoCarro carro={{ marca: 'BYD', modelo: 'Dolphin' }} tamanho="capa" sizes="(max-width: 900px) 100vw, 640px" rotulo={false} />
        </div>
        <div className="convite-a__texto">
          <p className="label" data-revelar>
            <span className="accent">05</span> — Comece agora
          </p>
          <h2 id="convite-titulo" className="display convite-a__titulo" data-palavras>
            <Palavras texto="Tem vida acontecendo logo ali." destaque={[4]} />
          </h2>
          <p className="text-soft" data-revelar>
            Crie a conta uma vez, com seus dados e até três rendimentos. Depois é só escolher o carro e acompanhar.
          </p>
          <div className="abertura__ctas" data-revelar>
            <Button variant="primary" size="lg" to="/cadastro" iconRight={ArrowRight}>
              Criar conta
            </Button>
            <Button variant="ghost" size="lg" to="/entrar">
              Já tenho conta
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Rodape() {
  return (
    <footer className="rodape-a">
      <div className="container rodape-a__grade">
        <div>
          <Logo />
          <p className="text-soft" style={{ marginTop: 'var(--s-3)', maxWidth: 340 }}>
            Seu próximo lugar começa aqui.
          </p>
        </div>
        <nav aria-label="Rodapé" className="rodape-a__links">
          <a href="#como-funciona">Como funciona</a>
          <a href="#tudo-a-vista">Tudo à vista</a>
          <a href="#frota">Frota</a>
          <a href="#parceiros">Empresas e bancos</a>
          <a href="/entrar">Entrar</a>
          <a href="/cadastro">Criar conta</a>
        </nav>
        <div className="rodape-a__creditos">
          <p className="label">LAB02 — DIAW · Engenharia de Software · PUC Minas</p>
          <details className="rodape__fotos">
            <summary className="label">Créditos das fotos</summary>
            <p className="text-soft">Fotos ilustrativas dos modelos, do Wikimedia Commons, redimensionadas e com ajuste leve de cor:</p>
            <ul>
              {FOTOS_FROTA.map((f) => (
                <li key={f.chave}>
                  <a href={f.credito.pagina} target="_blank" rel="noreferrer">
                    {f.chave.replace(/-/g, ' ')}
                  </a>{' '}
                  — {f.credito.autor},{' '}
                  <a href={f.credito.licencaUrl} target="_blank" rel="noreferrer">
                    {f.credito.licenca}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </footer>
  )
}

/** Landing ARREDOR: editorial, fotografia real em molduras que se abrem, clareza nos valores. */
export default function Landing() {
  const frota = useFrota()
  useLenis()
  return (
    <div className="landing-a">
      <a href="#conteudo-landing" className="pular">
        Pular para o conteúdo
      </a>
      <Cabecalho />
      <main id="conteudo-landing">
        <Abertura frota={frota} />
        <ComoFunciona />
        <TudoAVista />
        <Frota frota={frota} />
        <Parceiros />
        <Convite />
      </main>
      <Rodape />
    </div>
  )
}
