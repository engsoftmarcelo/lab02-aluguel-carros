import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Search } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import { EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import CarroOpcao from '../../components/pedido/CarroOpcao'
import FotoCarro from '../../components/carro/FotoCarro'
import { FolhaValores } from '../../components/pedido/Pedido'
import useCarregar from '../../hooks/useCarregar'
import { useToast } from '../../context/ToastContext'
import { AutomoveisAPI, PedidosAPI, lerErro } from '../../services/api'
import { diarias, exibirPlaca, formatarData, formatarMoeda, hojeISO } from '../../utils/formato'
import { codigoPedido } from '../../utils/jornada'

const PASSOS = ['Automóvel', 'Datas', 'Revisão']
const DEPOIS = [
  { t: 'Análise', d: 'Uma empresa ou banco parceiro avalia seu perfil financeiro e registra um parecer.' },
  { t: 'Enquanto isso', d: 'Você pode modificar o carro e as datas, ou cancelar, sem custo.' },
  { t: 'Se aprovado', d: 'O agente gera o contrato, com ou sem crédito de banco. Só aí o valor é definitivo.' },
]

/** Resumo que acompanha todas as etapas: o carro escolhido, o período e o total. */
function ResumoPedido({ carro, inicio, fim, n, total }) {
  return (
    <aside className="resumo-pedido" aria-label="Resumo do pedido">
      {carro ? (
        <>
          <FotoCarro carro={carro} tamanho="card" rotulo={false} sizes="320px" />
          <div className="resumo-pedido__corpo">
            <p className="label">
              {carro.marca} · {carro.ano}
            </p>
            <p className="resumo-pedido__modelo">{carro.modelo}</p>
            <p className="text-soft" style={{ fontSize: 'var(--fs-small)' }}>
              <span className="placa">{exibirPlaca(carro.placa)}</span> {formatarMoeda(carro.valorDiaria)}/dia
            </p>
            <dl className="resumo-pedido__linhas">
              <div>
                <dt>Período</dt>
                <dd>{n ? `${formatarData(inicio)} → ${formatarData(fim)}` : 'Defina as datas'}</dd>
              </div>
              <div>
                <dt>Diárias</dt>
                <dd className="mono">{n || '—'}</dd>
              </div>
            </dl>
            <div className="resumo-pedido__total" aria-live="polite">
              <span className="label">Total estimado</span>
              <motion.span key={total} className="resumo-pedido__numero" initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                {formatarMoeda(total)}
              </motion.span>
            </div>
          </div>
        </>
      ) : (
        <div className="resumo-pedido__vazio">
          <p className="label">Resumo</p>
          <p className="text-soft">Escolha um carro para ver o total do período aqui.</p>
        </div>
      )}
    </aside>
  )
}

export default function NovoPedido() {
  const navigate = useNavigate()
  const toast = useToast()
  const frota = useCarregar(() => AutomoveisAPI.listar())
  const [passo, setPasso] = useState(0)
  const [direcao, setDirecao] = useState(1)
  const [busca, setBusca] = useState('')
  const [carroId, setCarroId] = useState(null)
  const [inicio, setInicio] = useState(hojeISO(1))
  const [fim, setFim] = useState(hojeISO(4))
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  const carro = frota.dados?.find((c) => c.id === carroId)
  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return (frota.dados || []).filter((c) => !t || `${c.marca} ${c.modelo}`.toLowerCase().includes(t))
  }, [frota.dados, busca])

  const datasValidas = inicio && fim && inicio >= hojeISO() && fim > inicio
  const n = datasValidas ? diarias(inicio, fim) : 0
  const total = (carro?.valorDiaria || 0) * n
  const podeAvancar = (passo === 0 && carro) || (passo === 1 && datasValidas) || passo === 2

  const ir = (p, mensagem = '') => {
    setDirecao(p > passo ? 1 : -1)
    setPasso(p)
    setErro(mensagem)
  }

  const confirmar = async () => {
    setEnviando(true)
    setErro('')
    try {
      const pedido = await PedidosAPI.criar({ automovelId: carroId, dataInicio: inicio, dataFim: fim })
      toast.sucesso('Pedido enviado para análise', `Passaporte ${codigoPedido(pedido.id)} criado. Acompanhe cada etapa por ele.`)
      navigate(`/app/pedidos?id=${pedido.id}`)
    } catch (e) {
      const { mensagem } = lerErro(e)
      // conflito de datas: volta para as datas mantendo o motivo visível
      if (/reservado|data|período/i.test(mensagem)) ir(1, mensagem)
      else setErro(mensagem)
    } finally {
      setEnviando(false)
    }
  }

  const variantes = {
    entrar: (d) => ({ opacity: 0, x: 40 * d }),
    centro: { opacity: 1, x: 0 },
    sair: (d) => ({ opacity: 0, x: -40 * d }),
  }

  return (
    <>
      <div className="pagina__cabecalho">
        <div>
          <p className="label">Novo pedido · etapa {passo + 1} de 3</p>
          <h1 className="pagina__titulo">{['Escolha o carro', 'Defina as datas', 'Revise antes de enviar'][passo]}</h1>
        </div>
      </div>

      <div className="wizard__passos" aria-hidden="true">
        {PASSOS.map((p, i) => (
          <div key={p} className="wizard__passo">
            <div className="wizard__barra">
              <motion.span initial={false} animate={{ scaleX: i <= passo ? 1 : 0 }} transition={{ duration: 0.5, ease: [0.65, 0, 0.35, 1] }} />
            </div>
            <span className="label" style={{ color: i <= passo ? 'var(--text)' : undefined }}>
              0{i + 1} — {p}
            </span>
          </div>
        ))}
      </div>

      {erro && (
        <div className="alerta" role="alert" style={{ marginBottom: 'var(--s-4)' }}>
          {erro}
        </div>
      )}

      <div className={`wizard__layout${passo === 0 ? '' : ' wizard__layout--resumo'}`}>
        <div className="wizard__principal">
          <AnimatePresence mode="wait" custom={direcao} initial={false}>
            <motion.div key={passo} custom={direcao} variants={variantes} initial="entrar" animate="centro" exit="sair" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              {passo === 0 && (
                <>
                  <div className="barra-ferramentas">
                    <Input icon={Search} placeholder="Buscar por marca ou modelo" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar automóvel" />
                  </div>
                  {frota.carregando ? (
                    <div className="grade grade--cards">
                      {Array.from({ length: 6 }, (_, i) => (
                        <Skeleton key={i} height={300} radius="var(--radius-lg)" />
                      ))}
                    </div>
                  ) : frota.erro ? (
                    <EstadoErro mensagem={frota.erro} onTentar={frota.recarregar} />
                  ) : filtrados.length === 0 ? (
                    <EstadoVazio titulo="Nenhum carro encontrado" texto="Tente outra busca." />
                  ) : (
                    <div className="grade grade--cards" role="list">
                      {filtrados.map((c, i) => (
                        <motion.div key={c.id} role="listitem" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
                          <CarroOpcao carro={c} selecionado={c.id === carroId} prioridade={i < 3} onClick={() => setCarroId(c.id)} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {passo === 1 && (
                <Card>
                  <div className="form-grade form-grade--2">
                    <Input label="Retirada" type="date" icon={CalendarDays} min={hojeISO()} value={inicio} onChange={(e) => setInicio(e.target.value)} error={inicio && inicio < hojeISO() ? 'A data não pode estar no passado' : undefined} />
                    <Input label="Devolução" type="date" icon={CalendarDays} min={inicio || hojeISO(1)} value={fim} onChange={(e) => setFim(e.target.value)} error={inicio && fim && fim <= inicio ? 'Deve ser depois da retirada' : undefined} />
                  </div>
                  <p className="field__dica" style={{ marginTop: 'var(--s-4)' }}>
                    Cada dia entre a retirada e a devolução conta como uma diária. Se o carro já tiver pedido ativo no período, avisamos ao enviar e você troca as datas aqui.
                  </p>
                </Card>
              )}

              {passo === 2 && carro && (
                <div className="revisao">
                  <Card traco>
                    <FolhaValores carro={carro} dataInicio={inicio} dataFim={fim} diarias={n} total={total} />
                  </Card>
                  <div className="depois">
                    <p className="jornada__titulo">Depois de enviar</p>
                    <ol className="depois__lista">
                      {DEPOIS.map((d, i) => (
                        <li key={d.t}>
                          <span className="depois__n mono">0{i + 1}</span>
                          <span>
                            <strong>{d.t}.</strong> {d.d}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {passo > 0 && <ResumoPedido carro={carro} inicio={inicio} fim={fim} n={n} total={total} />}
      </div>

      <div className="wizard__rodape">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => (passo === 0 ? navigate('/app') : ir(passo - 1))}>
          {passo === 0 ? 'Cancelar' : 'Voltar'}
        </Button>
        {passo === 0 && carro && (
          <span className="wizard__escolha text-soft">
            {carro.modelo} · <span className="mono">{formatarMoeda(carro.valorDiaria)}/dia</span>
          </span>
        )}
        {passo < 2 ? (
          <Button variant="primary" iconRight={ArrowRight} disabled={!podeAvancar} onClick={() => ir(passo + 1)}>
            Continuar
          </Button>
        ) : (
          <Button variant="primary" icon={Check} loading={enviando} onClick={confirmar}>
            Enviar para análise
          </Button>
        )}
      </div>
    </>
  )
}
