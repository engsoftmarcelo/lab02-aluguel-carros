import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FilePlus2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge, { ORDEM_STATUS, STATUS } from '../../components/ui/StatusBadge'
import { EstadoErro } from '../../components/ui/Estados'
import LinhaDoTempo from '../../components/pedido/LinhaDoTempo'
import FotoCarro from '../../components/carro/FotoCarro'
import useCarregar from '../../hooks/useCarregar'
import { useAuth } from '../../context/AuthContext'
import { AutomoveisAPI, DashboardAPI, PedidosAPI } from '../../services/api'
import { exibirPlaca, formatarData, formatarMoeda } from '../../utils/formato'
import { codigoPedido, jornadaDoPedido, pedidoEmFoco } from '../../utils/jornada'

const hoje = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
const EASE = [0.16, 1, 0.3, 1]

/** O pedido que importa agora: carro, situação, total e o próximo passo — antes de qualquer número. */
function PedidoEmFoco({ pedido: p }) {
  const j = jornadaDoPedido(p.status, 'CLIENTE')
  const andamento = p.status === 'EM_ANALISE' || p.status === 'APROVADO'
  return (
    <Link to={`/app/pedidos?id=${p.id}`} className="foco" aria-label={`Abrir pedido ${codigoPedido(p.id)}: ${p.automovel.marca} ${p.automovel.modelo}, ${STATUS[p.status]?.label}`}>
      <FotoCarro carro={p.automovel} tamanho="capa" prioridade sizes="(max-width: 900px) 100vw, 560px" className="foco__foto" />
      <div className="foco__corpo">
        <div className="foco__topo">
          <p className="label">
            {andamento ? 'Em andamento' : 'Último pedido'} · {codigoPedido(p.id)}
          </p>
          <StatusBadge status={p.status} />
        </div>
        <p className="foco__carro">
          {p.automovel.marca} <span>{p.automovel.modelo}</span>
        </p>
        <p className="foco__meta">
          <span className="placa">{exibirPlaca(p.automovel.placa)}</span>
          <span>
            <span className="nowrap">{formatarData(p.dataInicio)}</span> → <span className="nowrap">{formatarData(p.dataFim)}</span>
          </span>
        </p>
        <div className="foco__total">
          <span className="label">{p.status === 'CONTRATADO' ? 'Total contratado' : 'Total estimado'}</span>
          <span className="foco__numero">{formatarMoeda(p.valorEstimado)}</span>
          <span className="text-soft mono" style={{ fontSize: 'var(--fs-small)' }}>
            {p.diarias} × {formatarMoeda(p.automovel.valorDiaria)}
          </span>
        </div>
        <LinhaDoTempo status={p.status} animar />
        <p className="foco__proximo">
          <strong>Próximo passo.</strong> {j.proximo}
        </p>
        <span className="foco__abrir">
          Abrir passaporte <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}

/** Sem pedidos: convite com a frota real em vez de uma caixa vazia. */
function ConviteFrota() {
  const frota = useCarregar(() => AutomoveisAPI.listar())
  const carros = (frota.dados || []).slice(0, 3)
  return (
    <Card traco className="convite">
      <div>
        <p className="label">Seu primeiro pedido</p>
        <p className="convite__titulo">Escolha um carro. O total aparece antes de você enviar.</p>
        <p className="text-soft">Nenhuma cobrança é feita no pedido: uma empresa ou banco parceiro analisa e você acompanha cada etapa aqui.</p>
        <Button variant="primary" icon={FilePlus2} to="/app/pedidos/novo" style={{ marginTop: 'var(--s-5)' }}>
          Fazer meu primeiro pedido
        </Button>
      </div>
      <div className="convite__frota" aria-hidden="true">
        {carros.map((c) => (
          <FotoCarro key={c.id} carro={c} tamanho="card" rotulo={false} sizes="200px" />
        ))}
      </div>
    </Card>
  )
}

export default function PainelCliente() {
  const { usuario } = useAuth()
  const resumo = useCarregar(() => DashboardAPI.resumo())
  const pedidos = useCarregar(() => PedidosAPI.meus())
  const foco = pedidoEmFoco(pedidos.dados || [])

  return (
    <>
      <div className="pagina__cabecalho">
        <div>
          <p className="saudacao__data">{hoje}</p>
          <h1 className="pagina__titulo" style={{ marginTop: 'var(--s-2)' }}>
            Olá, {usuario?.nome?.split(' ')[0]}
          </h1>
          <p className="pagina__sub">Seu pedido, o total e o próximo passo — tudo à vista.</p>
        </div>
        <Button variant="primary" icon={FilePlus2} to="/app/pedidos/novo">
          Novo pedido
        </Button>
      </div>

      <section aria-labelledby="foco-titulo">
        <h2 id="foco-titulo" className="sr-only">
          Pedido em foco
        </h2>
        {pedidos.carregando ? (
          <Skeleton height={340} radius="var(--radius-lg)" />
        ) : pedidos.erro ? (
          <EstadoErro mensagem={pedidos.erro} onTentar={pedidos.recarregar} />
        ) : !foco ? (
          <ConviteFrota />
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <PedidoEmFoco pedido={foco} />
          </motion.div>
        )}
      </section>

      <section className="secao-app" aria-labelledby="historico-titulo">
        <div className="secao-app__topo">
          <h2 id="historico-titulo" className="secao-app__titulo">
            Seu histórico
          </h2>
          {pedidos.dados?.length > 0 && (
            <Button variant="ghost" size="sm" iconRight={ArrowRight} to="/app/pedidos">
              Ver todos ({pedidos.dados.length})
            </Button>
          )}
        </div>
        {resumo.erro ? (
          <EstadoErro mensagem={resumo.erro} onTentar={resumo.recarregar} />
        ) : (
          <div className="grade grade--kpis">
            {ORDEM_STATUS.map((s, i) => (
              <motion.div key={s} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: EASE }}>
                <Card className="kpi kpi--compacto">
                  <StatusBadge status={s} />
                  <span className="kpi__valor">{resumo.carregando ? <Skeleton width={48} height={40} /> : resumo.dados.pedidosPorStatus[s] ?? 0}</span>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
