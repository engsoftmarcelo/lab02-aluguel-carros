import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Ban, FilePlus2, PencilLine } from 'lucide-react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Confirmar from '../../components/ui/Confirmar'
import { STATUS, ORDEM_STATUS } from '../../components/ui/StatusBadge'
import { CarregandoLista, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import { ModificarPedido, PedidoInfo, PedidoLinha, subtituloPedido, tituloPedido } from '../../components/pedido/Pedido'
import useCarregar from '../../hooks/useCarregar'
import { useToast } from '../../context/ToastContext'
import { PedidosAPI, lerErro } from '../../services/api'

export default function MeusPedidos() {
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const pedidos = useCarregar(() => PedidosAPI.meus())
  const [filtro, setFiltro] = useState('')
  const [aberto, setAberto] = useState(null)
  const [modificando, setModificando] = useState(false)
  const [cancelando, setCancelando] = useState(false)
  const [processando, setProcessando] = useState(false)

  // abre o pedido vindo da URL (?id=) — ex.: depois de criar no wizard
  useEffect(() => {
    const id = Number(params.get('id'))
    if (id && pedidos.dados) {
      const p = pedidos.dados.find((x) => x.id === id)
      if (p) setAberto(p)
    }
  }, [params, pedidos.dados])

  const contagem = useMemo(() => {
    const c = {}
    ;(pedidos.dados || []).forEach((p) => (c[p.status] = (c[p.status] || 0) + 1))
    return c
  }, [pedidos.dados])
  const lista = (pedidos.dados || []).filter((p) => !filtro || p.status === filtro)

  const atualizar = (novo) => {
    pedidos.setDados((l) => l.map((p) => (p.id === novo.id ? novo : p)))
    setAberto(novo)
  }

  const fechar = () => {
    setAberto(null)
    if (params.get('id')) setParams({}, { replace: true })
  }

  const cancelar = async () => {
    setProcessando(true)
    try {
      atualizar(await PedidosAPI.cancelar(aberto.id))
      toast.info('Pedido cancelado', 'Ele continua no seu histórico.')
      setCancelando(false)
    } catch (e) {
      toast.erro('Não foi possível cancelar', lerErro(e).mensagem)
    } finally {
      setProcessando(false)
    }
  }

  const editavel = aberto?.status === 'EM_ANALISE'

  return (
    <>
      <div className="pagina__cabecalho">
        <div>
          <p className="label">Área do cliente</p>
          <h1 className="pagina__titulo">Meus pedidos</h1>
          <p className="pagina__sub">Consulte, modifique ou cancele enquanto estiverem em análise.</p>
        </div>
        <Button variant="primary" icon={FilePlus2} to="/app/pedidos/novo">
          Novo pedido
        </Button>
      </div>

      <div className="chips" role="group" aria-label="Filtrar por status" style={{ marginBottom: 'var(--s-5)' }}>
        <button className="chip" aria-pressed={!filtro} onClick={() => setFiltro('')}>
          Todos <span className="chip__n">{pedidos.dados?.length ?? 0}</span>
        </button>
        {ORDEM_STATUS.map((s) => (
          <button key={s} className="chip" aria-pressed={filtro === s} onClick={() => setFiltro(s)}>
            {STATUS[s].label} <span className="chip__n">{contagem[s] || 0}</span>
          </button>
        ))}
      </div>

      {pedidos.carregando ? (
        <CarregandoLista />
      ) : pedidos.erro ? (
        <EstadoErro mensagem={pedidos.erro} onTentar={pedidos.recarregar} />
      ) : lista.length === 0 ? (
        <EstadoVazio
          titulo={filtro ? 'Nenhum pedido com esse status' : 'Você ainda não fez pedidos'}
          texto={filtro ? 'Escolha outro filtro.' : 'Escolha um carro e as datas para começar.'}
          acao={!filtro && <Button variant="primary" icon={FilePlus2} to="/app/pedidos/novo">Fazer pedido</Button>}
        />
      ) : (
        <ul className="lista">
          {lista.map((p, i) => (
            <PedidoLinha key={p.id} pedido={p} indice={i} onAbrir={setAberto} />
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(aberto) && !modificando && !cancelando}
        onClose={fechar}
        size="lg"
        title={aberto ? tituloPedido(aberto) : ''}
        subtitle={aberto ? subtituloPedido(aberto) : ''}
        footer={
          editavel ? (
            <>
              <Button variant="danger" icon={Ban} onClick={() => setCancelando(true)}>
                Cancelar pedido
              </Button>
              <Button variant="primary" icon={PencilLine} onClick={() => setModificando(true)}>
                Modificar
              </Button>
            </>
          ) : aberto?.status === 'CONTRATADO' ? (
            <Button variant="primary" to="/app/contratos">
              Ver contrato
            </Button>
          ) : null
        }
      >
        {aberto && <PedidoInfo pedido={aberto} />}
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

      <Confirmar
        open={cancelando}
        titulo="Cancelar este pedido?"
        texto="O pedido sai da análise e não pode ser reativado. Você pode fazer um novo quando quiser."
        confirmar="Sim, cancelar"
        perigo
        carregando={processando}
        onConfirmar={cancelar}
        onFechar={() => setCancelando(false)}
      />
    </>
  )
}
