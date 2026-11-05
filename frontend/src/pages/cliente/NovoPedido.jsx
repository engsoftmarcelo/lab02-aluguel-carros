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
import useCarregar from '../../hooks/useCarregar'
import { useToast } from '../../context/ToastContext'
import { AutomoveisAPI, PedidosAPI, lerErro } from '../../services/api'
import { diarias, exibirPlaca, formatarData, formatarMoeda, hojeISO } from '../../utils/formato'

const PASSOS = ['Automóvel', 'Datas', 'Resumo']

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

  const ir = (p) => {
    setDirecao(p > passo ? 1 : -1)
    setPasso(p)
    setErro('')
  }

  const confirmar = async () => {
    setEnviando(true)
    setErro('')
    try {
      const pedido = await PedidosAPI.criar({ automovelId: carroId, dataInicio: inicio, dataFim: fim })
      toast.sucesso('Pedido enviado para análise', `Pedido #${String(pedido.id).padStart(4, '0')} criado.`)
      navigate(`/app/pedidos?id=${pedido.id}`)
    } catch (e) {
      const { mensagem } = lerErro(e)
      setErro(mensagem)
      if (/reservado|data/i.test(mensagem)) ir(1)
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
          <h1 className="pagina__titulo">{['Escolha o carro', 'Defina as datas', 'Confira e envie'][passo]}</h1>
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
                    <Skeleton key={i} height={230} radius="var(--radius-lg)" />
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
                      <CarroOpcao carro={c} selecionado={c.id === carroId} onClick={() => setCarroId(c.id)} />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {passo === 1 && (
            <div className="grade grade--2">
              <Card>
                <div className="form-grade form-grade--2">
                  <Input label="Retirada" type="date" icon={CalendarDays} min={hojeISO()} value={inicio} onChange={(e) => setInicio(e.target.value)} error={inicio && inicio < hojeISO() ? 'A data não pode estar no passado' : undefined} />
                  <Input label="Devolução" type="date" icon={CalendarDays} min={inicio || hojeISO(1)} value={fim} onChange={(e) => setFim(e.target.value)} error={inicio && fim && fim <= inicio ? 'Deve ser depois da retirada' : undefined} />
                </div>
                <p className="field__dica" style={{ marginTop: 'var(--s-4)' }}>
                  A diária conta por dia entre a retirada e a devolução. Se o carro já estiver reservado no período, avisamos ao enviar.
                </p>
              </Card>
              <div className="resumo-valor" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className="label">Valor estimado</span>
                <motion.span key={total} className="resumo-valor__numero" initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  {formatarMoeda(total)}
                </motion.span>
                <span className="text-soft mono">
                  {n} diária{n === 1 ? '' : 's'} × {formatarMoeda(carro?.valorDiaria)}
                </span>
              </div>
            </div>
          )}

          {passo === 2 && carro && (
            <Card traco>
              <dl className="info">
                <div>
                  <dt>Carro</dt>
                  <dd>
                    {carro.marca} {carro.modelo} ({carro.ano})
                  </dd>
                </div>
                <div>
                  <dt>Placa</dt>
                  <dd className="mono">{exibirPlaca(carro.placa)}</dd>
                </div>
                <div>
                  <dt>Retirada</dt>
                  <dd>{formatarData(inicio)}</dd>
                </div>
                <div>
                  <dt>Devolução</dt>
                  <dd>{formatarData(fim)}</dd>
                </div>
              </dl>
              <div className="resumo-valor" style={{ marginTop: 'var(--s-5)' }}>
                <span className="label">
                  {n} diária{n === 1 ? '' : 's'} × {formatarMoeda(carro.valorDiaria)}
                </span>
                <span className="resumo-valor__numero">{formatarMoeda(total)}</span>
              </div>
              <p className="field__dica" style={{ marginTop: 'var(--s-4)' }}>
                O pedido entra como <strong>Em análise</strong>. Uma empresa ou banco parceiro avalia sua renda e registra o parecer. Enquanto estiver em análise, você pode modificar ou cancelar.
              </p>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="wizard__rodape">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => (passo === 0 ? navigate('/app') : ir(passo - 1))}>
          {passo === 0 ? 'Cancelar' : 'Voltar'}
        </Button>
        {passo < 2 ? (
          <Button variant="primary" iconRight={ArrowRight} disabled={!podeAvancar} onClick={() => ir(passo + 1)}>
            Continuar
          </Button>
        ) : (
          <Button variant="primary" icon={Check} loading={enviando} onClick={confirmar}>
            Enviar pedido
          </Button>
        )}
      </div>
    </>
  )
}
