import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays, CircleCheck, CircleDashed, MessageSquareQuote, Navigation, ReceiptText } from 'lucide-react'
import StatusBadge, { STATUS } from '../ui/StatusBadge'
import FotoCarro from '../carro/FotoCarro'
import { codigoPedido, jornadaDoPedido } from '../../utils/jornada'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import LinhaDoTempo from './LinhaDoTempo'
import { AutomoveisAPI, PedidosAPI, lerErro } from '../../services/api'
import { diarias, exibirPlaca, formatarData, formatarMoeda, hojeISO } from '../../utils/formato'
import { useToast } from '../../context/ToastContext'

/** Linha clicável de um pedido nas listas. */
export function PedidoLinha({ pedido, onAbrir, mostrarCliente, indice = 0 }) {
  const p = pedido
  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(indice, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <button type="button" className="linha-item linha-item--foto" onClick={() => onAbrir(p)}>
        <FotoCarro carro={p.automovel} tamanho="mini" sizes="96px" />
        <div>
          <p className="linha-item__titulo">
            {p.automovel.marca} {p.automovel.modelo} <span className="placa" style={{ marginLeft: 6 }}>{exibirPlaca(p.automovel.placa)}</span>
          </p>
          <p className="linha-item__meta">
            <span className="mono">#{String(p.id).padStart(4, '0')}</span>
            {mostrarCliente && <span>{p.clienteNome}</span>}
            <span>
              <span className="nowrap">{formatarData(p.dataInicio)}</span> → <span className="nowrap">{formatarData(p.dataFim)}</span>
            </span>
            <span className="nowrap">
              {p.diarias} diária{p.diarias > 1 ? 's' : ''}
            </span>
          </p>
        </div>
        <div className="linha-item__direita">
          <StatusBadge status={p.status} />
          <span className="linha-item__valor">{formatarMoeda(p.valorEstimado)}</span>
          <ArrowRight size={18} className="linha-item__seta" aria-hidden="true" />
        </div>
      </button>
    </motion.li>
  )
}

/**
 * "Folha à vista": total primeiro, composição logo abaixo e o que NÃO existe neste sistema
 * dito com todas as letras (sem cobrança agora, sem taxas extras). Reusada no wizard.
 */
export function FolhaValores({ carro, dataInicio, dataFim, diarias: n, total, contratado }) {
  return (
    <div className="folha">
      <div className="folha__total">
        <span className="label">{contratado ? 'Total do período · contratado' : 'Total estimado do período'}</span>
        <span className="folha__numero">{formatarMoeda(total)}</span>
      </div>
      <dl className="folha__linhas">
        <div>
          <dt>Período</dt>
          <dd>
            <span className="nowrap">{formatarData(dataInicio)}</span> → <span className="nowrap">{formatarData(dataFim)}</span>
          </dd>
        </div>
        <div>
          <dt>Diárias</dt>
          <dd className="mono">
            {n} × {formatarMoeda(carro?.valorDiaria)}
          </dd>
        </div>
        <div>
          <dt>Taxas extras</dt>
          <dd>Nenhuma. O total é só diárias × valor da diária.</dd>
        </div>
        <div>
          <dt>Cobrança agora</dt>
          <dd>Nenhuma. Pedido não gera pagamento; as condições finais ficam no contrato.</dd>
        </div>
      </dl>
    </div>
  )
}

/** O que já está definido, o que falta e o próximo passo — fiel ao status real. */
export function QuadroJornada({ status, perspectiva = 'CLIENTE' }) {
  const j = jornadaDoPedido(status, perspectiva)
  return (
    <div className="jornada">
      <div className="jornada__colunas">
        <div>
          <p className="jornada__titulo">Já está definido</p>
          <ul className="jornada__lista">
            {j.definido.map((t) => (
              <li key={t}>
                <CircleCheck size={16} className="jornada__ok" aria-hidden="true" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="jornada__titulo">Ainda falta</p>
          {j.falta.length ? (
            <ul className="jornada__lista">
              {j.falta.map((t) => (
                <li key={t}>
                  <CircleDashed size={16} className="jornada__pendente" aria-hidden="true" /> {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-soft jornada__nada">Nada pendente neste pedido.</p>
          )}
        </div>
      </div>
      <p className="jornada__proximo">
        <Navigation size={16} aria-hidden="true" />
        <span>
          <strong>Próximo passo.</strong> {j.proximo}
        </span>
      </p>
    </div>
  )
}

/** Passaporte do pedido (detalhe do cliente e do agente): foto, código, andamento e valores à vista. */
export function PedidoInfo({ pedido, perspectiva = 'CLIENTE' }) {
  const p = pedido
  return (
    <>
      <div className="passaporte">
        <FotoCarro carro={p.automovel} tamanho="capa" prioridade sizes="(max-width: 700px) 100vw, 320px" />
        <div className="passaporte__dados">
          <p className="label">Passaporte {codigoPedido(p.id)}</p>
          <p className="passaporte__carro">
            {p.automovel.marca} <span>{p.automovel.modelo}</span>
          </p>
          <p className="passaporte__meta">
            <span>{p.automovel.ano}</span>
            <span className="placa">{exibirPlaca(p.automovel.placa)}</span>
          </p>
          <div className="passaporte__linha">
            <LinhaDoTempo status={p.status} animar />
          </div>
        </div>
      </div>
      <div className="bloco">
        <p className="bloco__titulo">
          <ReceiptText size={14} aria-hidden="true" /> Valores à vista
        </p>
        <FolhaValores carro={p.automovel} dataInicio={p.dataInicio} dataFim={p.dataFim} diarias={p.diarias} total={p.valorEstimado} contratado={p.status === 'CONTRATADO'} />
      </div>
      <div className="bloco">
        <QuadroJornada status={p.status} perspectiva={perspectiva} />
      </div>
      {(p.parecer || p.agenteAvaliadorNome) && (
        <div className="bloco">
          <p className="bloco__titulo">
            <MessageSquareQuote size={14} aria-hidden="true" /> Parecer do agente
          </p>
          {p.parecer && <p className="parecer">“{p.parecer}”</p>}
          {p.agenteAvaliadorNome && (
            <p className="label" style={{ marginTop: 'var(--s-3)' }}>
              Avaliado por {p.agenteAvaliadorNome}
            </p>
          )}
        </div>
      )}
    </>
  )
}

/** Título do modal de detalhe. */
export function tituloPedido(p) {
  return `Pedido #${String(p.id).padStart(4, '0')}`
}

export function subtituloPedido(p) {
  return `${STATUS[p.status]?.label || p.status} · criado em ${formatarData(p.criadoEm)}`
}

/** Modal para modificar automóvel e período (cliente em análise; agente em análise ou aprovado). */
export function ModificarPedido({ pedido, open, onFechar, onSalvo }) {
  const toast = useToast()
  const [carros, setCarros] = useState([])
  const [form, setForm] = useState({ automovelId: '', dataInicio: '', dataFim: '' })
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open || !pedido) return
    setForm({ automovelId: String(pedido.automovel.id), dataInicio: pedido.dataInicio, dataFim: pedido.dataFim })
    setErro('')
    AutomoveisAPI.listar().then(setCarros).catch(() => setCarros([pedido.automovel]))
  }, [open, pedido])

  const carro = useMemo(() => carros.find((c) => String(c.id) === form.automovelId), [carros, form.automovelId])
  const n = form.dataInicio && form.dataFim && form.dataFim > form.dataInicio ? diarias(form.dataInicio, form.dataFim) : 0

  const salvar = async () => {
    setErro('')
    setSalvando(true)
    try {
      const atualizado = await PedidosAPI.modificar(pedido.id, { automovelId: Number(form.automovelId), dataInicio: form.dataInicio, dataFim: form.dataFim })
      toast.sucesso('Pedido modificado', `Novo valor estimado: ${formatarMoeda(atualizado.valorEstimado)}.`)
      onSalvo(atualizado)
    } catch (e) {
      setErro(lerErro(e).mensagem)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onFechar}
      title="Modificar pedido"
      subtitle="Troque o carro ou as datas. O valor é recalculado."
      footer={
        <>
          <Button variant="ghost" onClick={onFechar}>
            Voltar
          </Button>
          <Button variant="primary" loading={salvando} onClick={salvar} disabled={!n}>
            Salvar alterações
          </Button>
        </>
      }
    >
      <div className="form-grade">
        {erro && (
          <div className="alerta" role="alert">
            {erro}
          </div>
        )}
        <Select
          label="Automóvel"
          value={form.automovelId}
          onChange={(e) => setForm((f) => ({ ...f, automovelId: e.target.value }))}
          options={carros.map((c) => ({ value: String(c.id), label: `${c.marca} ${c.modelo} · ${exibirPlaca(c.placa)} · ${formatarMoeda(c.valorDiaria)}/dia` }))}
        />
        <div className="form-grade form-grade--2">
          <Input label="Retirada" type="date" icon={CalendarDays} min={hojeISO()} value={form.dataInicio} onChange={(e) => setForm((f) => ({ ...f, dataInicio: e.target.value }))} />
          <Input label="Devolução" type="date" icon={CalendarDays} min={form.dataInicio || hojeISO(1)} value={form.dataFim} onChange={(e) => setForm((f) => ({ ...f, dataFim: e.target.value }))} />
        </div>
        <div className="resumo-valor">
          <span className="label">
            {n || 0} diária{n === 1 ? '' : 's'} × {formatarMoeda(carro?.valorDiaria)}
          </span>
          <span className="resumo-valor__numero">{formatarMoeda((carro?.valorDiaria || 0) * n)}</span>
        </div>
      </div>
    </Modal>
  )
}
