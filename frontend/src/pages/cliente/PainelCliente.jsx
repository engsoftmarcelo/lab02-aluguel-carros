import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, FilePlus2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge, { ORDEM_STATUS } from '../../components/ui/StatusBadge'
import { EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import LinhaDoTempo from '../../components/pedido/LinhaDoTempo'
import useCarregar from '../../hooks/useCarregar'
import { useAuth } from '../../context/AuthContext'
import { DashboardAPI, PedidosAPI } from '../../services/api'
import { exibirPlaca, formatarData, formatarMoeda } from '../../utils/formato'

const hoje = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

export default function PainelCliente() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const resumo = useCarregar(() => DashboardAPI.resumo())
  const pedidos = useCarregar(() => PedidosAPI.meus())
  const ultimo = pedidos.dados?.[0]

  return (
    <>
      <div className="pagina__cabecalho">
        <div>
          <p className="saudacao__data">{hoje}</p>
          <h1 className="pagina__titulo" style={{ marginTop: 'var(--s-2)' }}>
            Olá, {usuario?.nome?.split(' ')[0]}
          </h1>
          <p className="pagina__sub">Acompanhe seus pedidos de aluguel em um só traço.</p>
        </div>
        <Button variant="primary" icon={FilePlus2} to="/app/pedidos/novo">
          Novo pedido
        </Button>
      </div>

      {resumo.erro ? (
        <EstadoErro mensagem={resumo.erro} onTentar={resumo.recarregar} />
      ) : (
        <div className="grade grade--kpis">
          {ORDEM_STATUS.map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <Card className="kpi" traco={s === 'CONTRATADO'}>
                <StatusBadge status={s} />
                <span className="kpi__valor">{resumo.carregando ? <Skeleton width={48} height={40} /> : resumo.dados.pedidosPorStatus[s] ?? 0}</span>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <section className="secao-app" aria-labelledby="ultimo-titulo">
        <div className="secao-app__topo">
          <h2 id="ultimo-titulo" className="secao-app__titulo">
            Seu último pedido
          </h2>
          {pedidos.dados?.length > 0 && (
            <Button variant="ghost" size="sm" iconRight={ArrowRight} to="/app/pedidos">
              Ver todos ({pedidos.dados.length})
            </Button>
          )}
        </div>
        {pedidos.carregando ? (
          <Skeleton height={180} radius="var(--radius-lg)" />
        ) : pedidos.erro ? (
          <EstadoErro mensagem={pedidos.erro} onTentar={pedidos.recarregar} />
        ) : !ultimo ? (
          <EstadoVazio
            titulo="Nenhum pedido por aqui ainda"
            texto="Escolha um carro e as datas. A gente cuida do resto do traço."
            acao={
              <Button variant="primary" icon={FilePlus2} to="/app/pedidos/novo">
                Fazer meu primeiro pedido
              </Button>
            }
          />
        ) : (
          <Card traco interactive style={{ cursor: 'pointer' }} onClick={() => navigate(`/app/pedidos?id=${ultimo.id}`)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 'var(--s-5)' }}>
              <div>
                <p className="label">Pedido #{String(ultimo.id).padStart(4, '0')}</p>
                <p className="contrato__carro">
                  {ultimo.automovel.marca} {ultimo.automovel.modelo}
                </p>
                <p className="text-soft" style={{ marginTop: 6, fontSize: 'var(--fs-small)' }}>
                  <span className="placa">{exibirPlaca(ultimo.automovel.placa)}</span> · {formatarData(ultimo.dataInicio)} → {formatarData(ultimo.dataFim)}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <StatusBadge status={ultimo.status} />
                <p className="kpi__valor kpi__valor--mono" style={{ marginTop: 'var(--s-3)' }}>
                  {formatarMoeda(ultimo.valorEstimado)}
                </p>
              </div>
            </div>
            <LinhaDoTempo status={ultimo.status} />
          </Card>
        )}
      </section>
    </>
  )
}
