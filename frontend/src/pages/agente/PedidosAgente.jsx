import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, FileSignature, PencilLine, Wallet, XCircle } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import { STATUS, ORDEM_STATUS } from '../../components/ui/StatusBadge'
import { CarregandoLista, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import { ModificarPedido, PedidoInfo, PedidoLinha, subtituloPedido, tituloPedido } from '../../components/pedido/Pedido'
import GerarContrato from './GerarContrato'
import useCarregar from '../../hooks/useCarregar'
import { useToast } from '../../context/ToastContext'
import { ClientesAPI, PedidosAPI, lerErro } from '../../services/api'
import { formatarCPF, formatarMoeda } from '../../utils/formato'

/** Perfil financeiro do cliente: rendimentos e quanto o aluguel compromete da renda mensal. */
function PerfilFinanceiro({ pedido }) {
  const cliente = useCarregar(() => ClientesAPI.buscar(pedido.clienteId), [pedido.clienteId])
  const renda = Number(pedido.clienteRendaTotal || 0)
  const pct = renda ? (Number(pedido.valorEstimado) / renda) * 100 : 100
  const cor = pct <= 30 ? 'var(--status-aprovado)' : pct <= 60 ? 'var(--status-em-analise)' : 'var(--status-reprovado)'
  return (
    <div className="bloco">
      <p className="bloco__titulo">
        <Wallet size={14} aria-hidden="true" /> Perfil financeiro do cliente
      </p>
      <dl className="info">
        <div>
          <dt>Cliente</dt>
          <dd>{pedido.clienteNome}</dd>
        </div>
        <div>
          <dt>CPF</dt>
          <dd className="mono">{formatarCPF(pedido.clienteCpf)}</dd>
        </div>
        <div>
          <dt>Profissão</dt>
          <dd>{pedido.clienteProfissao}</dd>
        </div>
        <div>
          <dt>Renda total</dt>
          <dd className="mono">{formatarMoeda(renda)}</dd>
        </div>
      </dl>
      <div style={{ marginTop: 'var(--s-4)' }}>
        {cliente.carregando ? (
          <Skeleton height={40} />
        ) : cliente.dados?.rendimentos?.length ? (
          <ul className="lista" style={{ gap: 4 }}>
            {cliente.dados.rendimentos.map((r) => (
              <li key={r.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-small)' }}>
                <span className="text-soft">{r.entidadeEmpregadora}</span>
                <span className="mono">{formatarMoeda(r.valor)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-soft" style={{ fontSize: 'var(--fs-small)' }}>
            Nenhum rendimento declarado.
          </p>
        )}
      </div>
      <div style={{ marginTop: 'var(--s-4)' }}>
        <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-small)' }}>
          <span className="text-soft">Aluguel ÷ renda mensal</span>
          <span className="mono" style={{ color: cor, fontWeight: 600 }}>
            {renda ? `${pct.toFixed(1)}%` : 'sem renda'}
          </span>
        </p>
        <div className="barra-renda" aria-hidden="true">
          <span style={{ width: `${Math.min(100, pct)}%`, background: cor }} />
        </div>
      </div>
    </div>
  )
}

export default function PedidosAgente() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const filtro = params.get('status') || ''
  const pedidos = useCarregar(() => PedidosAPI.todos(), [])
  const [aberto, setAberto] = useState(null)
  const [parecer, setParecer] = useState('')
  const [erroParecer, setErroParecer] = useState('')
  const [avaliando, setAvaliando] = useState(null)
  const [modificando, setModificando] = useState(false)
  const [contratando, setContratando] = useState(false)

  useEffect(() => {
    const id = Number(params.get('id'))
    if (id && pedidos.dados) {
      const p = pedidos.dados.find((x) => x.id === id)
      if (p) setAberto(p)
    }
  }, [params, pedidos.dados])

  useEffect(() => {
    setParecer('')
    setErroParecer('')
  }, [aberto?.id])

  const contagem = {}
  ;(pedidos.dados || []).forEach((p) => (contagem[p.status] = (contagem[p.status] || 0) + 1))
  const lista = (pedidos.dados || []).filter((p) => !filtro || p.status === filtro)

  const filtrar = (s) => setParams(s ? { status: s } : {}, { replace: true })
  const atualizar = (novo) => {
    pedidos.setDados((l) => l.map((p) => (p.id === novo.id ? novo : p)))
    setAberto(novo)
  }
  const fechar = () => {
    setAberto(null)
    if (params.get('id')) {
      const novo = new URLSearchParams(params)
      novo.delete('id')
      setParams(novo, { replace: true })
    }
  }

  const avaliar = async (aprovado) => {
    if (!parecer.trim()) {
      setErroParecer('Escreva o parecer antes de decidir.')
      return
    }
    setAvaliando(aprovado ? 'aprovar' : 'reprovar')
    try {
      const novo = await PedidosAPI.avaliar(aberto.id, aprovado, parecer.trim())
      atualizar(novo)
      toast.sucesso(aprovado ? 'Pedido aprovado' : 'Pedido reprovado', aprovado ? 'Ele já pode virar contrato.' : 'O cliente verá o seu parecer.')
    } catch (e) {
      toast.erro('Não foi possível avaliar', lerErro(e).mensagem)
    } finally {
      setAvaliando(null)
    }
  }

  const s = aberto?.status
  const rodape =
    s === 'EM_ANALISE' ? (
      <>
        <Button variant="ghost" icon={PencilLine} onClick={() => setModificando(true)}>
          Modificar
        </Button>
        <Button variant="danger" icon={XCircle} loading={avaliando === 'reprovar'} disabled={Boolean(avaliando)} onClick={() => avaliar(false)}>
          Reprovar
        </Button>
        <Button variant="primary" icon={CheckCircle2} loading={avaliando === 'aprovar'} disabled={Boolean(avaliando)} onClick={() => avaliar(true)}>
          Aprovar
        </Button>
      </>
    ) : s === 'APROVADO' ? (
      <>
        <Button variant="ghost" icon={PencilLine} onClick={() => setModificando(true)}>
          Modificar
        </Button>
        <Button variant="primary" icon={FileSignature} onClick={() => setContratando(true)}>
          Gerar contrato
        </Button>
      </>
    ) : null

  return (
    <>
      <div className="pagina__cabecalho">
        <div>
          <p className="label">Área do agente</p>
          <h1 className="pagina__titulo">Pedidos</h1>
          <p className="pagina__sub">Analise a renda, registre o parecer e transforme aprovados em contrato.</p>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Filtrar por status" style={{ marginBottom: 'var(--s-5)' }}>
        <button className="chip" aria-pressed={!filtro} onClick={() => filtrar('')}>
          Todos <span className="chip__n">{pedidos.dados?.length ?? 0}</span>
        </button>
        {ORDEM_STATUS.map((st) => (
          <button key={st} className="chip" aria-pressed={filtro === st} onClick={() => filtrar(st)}>
            {STATUS[st].label} <span className="chip__n">{contagem[st] || 0}</span>
          </button>
        ))}
      </div>

      {pedidos.carregando ? (
        <CarregandoLista />
      ) : pedidos.erro ? (
        <EstadoErro mensagem={pedidos.erro} onTentar={pedidos.recarregar} />
      ) : lista.length === 0 ? (
        <EstadoVazio titulo="Nenhum pedido aqui" texto={filtro ? 'Nenhum pedido com esse status no momento.' : 'Quando clientes fizerem pedidos, eles aparecem nesta fila.'} />
      ) : (
        <ul className="lista">
          {lista.map((p, i) => (
            <PedidoLinha key={p.id} pedido={p} indice={i} mostrarCliente onAbrir={setAberto} />
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(aberto) && !modificando && !contratando}
        onClose={fechar}
        size="lg"
        title={aberto ? tituloPedido(aberto) : ''}
        subtitle={aberto ? `${subtituloPedido(aberto)} · ${aberto.clienteNome}` : ''}
        footer={rodape}
      >
        {aberto && (
          <>
            <PerfilFinanceiro pedido={aberto} />
            <PedidoInfo pedido={aberto} />
            {s === 'EM_ANALISE' && (
              <div className="bloco">
                <label className="field__label" htmlFor="parecer">
                  Parecer financeiro (obrigatório)
                </label>
                <textarea
                  id="parecer"
                  className="textarea"
                  style={{ marginTop: 'var(--s-2)' }}
                  maxLength={1000}
                  placeholder="Ex.: renda compatível; aluguel compromete 14% da renda mensal."
                  value={parecer}
                  onChange={(e) => {
                    setParecer(e.target.value)
                    setErroParecer('')
                  }}
                  aria-invalid={Boolean(erroParecer)}
                />
                {erroParecer && (
                  <span className="field__erro" role="alert">
                    {erroParecer}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </Modal>

      <ModificarPedido
        pedido={aberto}
        open={modificando}
        onFechar={() => setModificando(false)}
        onSalvo={(novo) => {
          atualizar(novo)
          setModificando(false)
        }}
      />

      <GerarContrato
        pedido={aberto}
        open={contratando}
        onFechar={() => setContratando(false)}
        onGerado={(contrato) => {
          atualizar({ ...aberto, status: 'CONTRATADO', contratoId: contrato.id })
          setContratando(false)
        }}
      />
    </>
  )
}
