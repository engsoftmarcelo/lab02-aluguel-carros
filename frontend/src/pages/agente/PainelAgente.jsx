import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import { STATUS, ORDEM_STATUS } from '../../components/ui/StatusBadge'
import { CarregandoLista, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import { PedidoLinha } from '../../components/pedido/Pedido'
import useCarregar from '../../hooks/useCarregar'
import { useAuth } from '../../context/AuthContext'
import { DashboardAPI, PedidosAPI } from '../../services/api'
import { formatarMoeda, PAPEL_LABEL } from '../../utils/formato'

const COR = {
  EM_ANALISE: '#E8C46A',
  APROVADO: '#5E9C77',
  CONTRATADO: '#A64132',
  REPROVADO: '#D9776B',
  CANCELADO: '#B9AFA6',
}

function Kpi({ rotulo, valor, mono, traco, i }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
      <Card className="kpi" traco={traco}>
        <span className="label">{rotulo}</span>
        <span className={`kpi__valor ${mono ? 'kpi__valor--mono' : ''}`}>{valor ?? <Skeleton width={64} height={36} />}</span>
      </Card>
    </motion.div>
  )
}

function DicaGrafico({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bloco" style={{ padding: '8px 12px' }}>
      <p className="label">{d.nome}</p>
      <p className="mono" style={{ fontWeight: 600 }}>
        {d.total} pedido{d.total === 1 ? '' : 's'}
      </p>
    </div>
  )
}

export default function PainelAgente() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const resumo = useCarregar(() => DashboardAPI.resumo())
  const fila = useCarregar(() => PedidosAPI.todos('EM_ANALISE'))
  const r = resumo.dados
  const grafico = ORDEM_STATUS.map((s) => ({ status: s, nome: STATUS[s].label, total: r?.pedidosPorStatus?.[s] ?? 0 }))

  return (
    <>
      <div className="pagina__cabecalho">
        <div>
          <p className="label">
            {PAPEL_LABEL[usuario?.papel]} · {usuario?.nome}
          </p>
          <h1 className="pagina__titulo">Painel de análise</h1>
          <p className="pagina__sub">Pedidos, contratos e crédito de toda a carteira.</p>
        </div>
        <Button variant="primary" iconRight={ArrowRight} to="/agente/pedidos?status=EM_ANALISE">
          Analisar pedidos
        </Button>
      </div>

      {resumo.erro ? (
        <EstadoErro mensagem={resumo.erro} onTentar={resumo.recarregar} />
      ) : (
        <div className="grade grade--kpis">
          <Kpi i={0} rotulo="Pedidos" valor={r?.totalPedidos} />
          <Kpi i={1} rotulo="Aguardando análise" valor={r?.pedidosPorStatus?.EM_ANALISE} />
          <Kpi i={2} rotulo="Contratos" valor={r?.totalContratos} traco />
          <Kpi i={3} rotulo="Valor contratado" valor={r && formatarMoeda(r.valorContratado)} mono />
          <Kpi i={4} rotulo="Crédito concedido" valor={r && formatarMoeda(r.valorFinanciado)} mono />
          <Kpi i={5} rotulo="Clientes · Frota" valor={r && `${r.totalClientes} · ${r.totalAutomoveis}`} />
        </div>
      )}

      <div className="grade secao-app" style={{ alignItems: 'start', gap: 'var(--s-7)' }}>
        <Card>
          <div className="secao-app__topo">
            <h2 className="secao-app__titulo">Pedidos por status</h2>
          </div>
          {resumo.carregando ? (
            <Skeleton height={300} />
          ) : (
            <div className="grafico" role="img" aria-label={grafico.map((g) => `${g.nome}: ${g.total}`).join(', ')}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grafico} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#ECDCC8" vertical={false} />
                  <XAxis dataKey="nome" tick={{ fill: '#6B5A50', fontSize: 11, fontFamily: 'Source Sans 3 Variable' }} axisLine={{ stroke: '#D9C4AB' }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#6B5A50', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(166,65,50,0.06)' }} content={<DicaGrafico />} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={56} animationDuration={900}>
                    {grafico.map((g) => (
                      <Cell key={g.status} fill={COR[g.status]} style={{ cursor: 'pointer' }} onClick={() => navigate(`/agente/pedidos?status=${g.status}`)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <div>
          <div className="secao-app__topo">
            <h2 className="secao-app__titulo">Aguardando análise</h2>
            <Button variant="ghost" size="sm" to="/agente/pedidos?status=EM_ANALISE" iconRight={ArrowRight}>
              Fila
            </Button>
          </div>
          {fila.carregando ? (
            <CarregandoLista linhas={3} />
          ) : fila.erro ? (
            <EstadoErro mensagem={fila.erro} onTentar={fila.recarregar} />
          ) : fila.dados.length === 0 ? (
            <EstadoVazio titulo="Fila zerada" texto="Nenhum pedido aguardando análise agora." />
          ) : (
            <ul className="lista">
              {fila.dados.slice(0, 5).map((p, i) => (
                <PedidoLinha key={p.id} pedido={p} indice={i} mostrarCliente onAbrir={() => navigate(`/agente/pedidos?id=${p.id}`)} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
