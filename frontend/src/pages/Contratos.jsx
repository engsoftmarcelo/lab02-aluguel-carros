import { motion } from 'framer-motion'
import { Landmark } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import FotoCarro from '../components/carro/FotoCarro'
import { CarregandoLista, EstadoErro, EstadoVazio } from '../components/ui/Estados'
import useCarregar from '../hooks/useCarregar'
import { useAuth } from '../context/AuthContext'
import { ContratosAPI } from '../services/api'
import { exibirPlaca, formatarData, formatarMoeda, PAPEL_LABEL } from '../utils/formato'

/** Contratos: o cliente vê os seus; o agente vê todos. */
export default function Contratos() {
  const { isAgente } = useAuth()
  const contratos = useCarregar(() => (isAgente ? ContratosAPI.todos() : ContratosAPI.meus()), [isAgente])

  return (
    <>
      <div className="pagina__cabecalho">
        <div>
          <p className="label">{isAgente ? 'Área do agente' : 'Área do cliente'}</p>
          <h1 className="pagina__titulo">Contratos</h1>
          <p className="pagina__sub">{isAgente ? 'Todos os contratos firmados a partir de pedidos aprovados.' : 'Seus pedidos que viraram contrato, com todas as condições à vista.'}</p>
        </div>
      </div>

      {contratos.carregando ? (
        <CarregandoLista linhas={3} altura={220} />
      ) : contratos.erro ? (
        <EstadoErro mensagem={contratos.erro} onTentar={contratos.recarregar} />
      ) : contratos.dados.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum contrato ainda"
          texto={isAgente ? 'Gere um contrato a partir de um pedido aprovado.' : 'Quando um pedido seu for aprovado e contratado, ele aparece aqui.'}
          acao={isAgente && <Button variant="secondary" to="/agente/pedidos?status=APROVADO">Ver pedidos aprovados</Button>}
        />
      ) : (
        <div className="grade" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {contratos.dados.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <Card traco className="contrato">
                <FotoCarro carro={{ marca: c.automovel, modelo: c.automovel }} tamanho="card" sizes="(max-width: 700px) 100vw, 420px" className="contrato__foto" />
                <div className="contrato__topo">
                  <div>
                    <p className="label">
                      Contrato #{String(c.id).padStart(4, '0')} · pedido #{String(c.pedidoId).padStart(4, '0')}
                    </p>
                    <p className="contrato__carro">{c.automovel}</p>
                  </div>
                  <span className="placa">{exibirPlaca(c.placa)}</span>
                </div>
                <dl className="info">
                  {isAgente && (
                    <div>
                      <dt>Cliente</dt>
                      <dd>{c.clienteNome}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Período</dt>
                    <dd>
                      {formatarData(c.dataInicio)} → {formatarData(c.dataFim)}
                    </dd>
                  </div>
                  <div>
                    <dt>Valor do aluguel</dt>
                    <dd className="mono">{formatarMoeda(c.valorAluguel)}</dd>
                  </div>
                  <div>
                    <dt>Assinado em</dt>
                    <dd>{formatarData(c.dataAssinatura)}</dd>
                  </div>
                  <div>
                    <dt>Propriedade</dt>
                    <dd>{PAPEL_LABEL[c.tipoPropriedade]}</dd>
                  </div>
                  <div>
                    <dt>Proprietário</dt>
                    <dd>{c.proprietarioAtual || '—'}</dd>
                  </div>
                </dl>
                {c.credito ? (
                  <div className="credito">
                    <p className="bloco__titulo" style={{ color: 'var(--accent)' }}>
                      <Landmark size={14} aria-hidden="true" /> Crédito · {c.credito.bancoNome}
                    </p>
                    <p className="kpi__valor kpi__valor--mono">
                      {c.credito.parcelas}× {formatarMoeda(c.credito.valorParcela)}
                    </p>
                    <p className="text-soft" style={{ fontSize: 'var(--fs-small)', marginTop: 4 }}>
                      Financiado {formatarMoeda(c.credito.valorFinanciado)} a {Number(c.credito.taxaJuros).toLocaleString('pt-BR')}% a.m. (Tabela Price)
                    </p>
                    <dl className="folha__linhas" style={{ marginTop: 'var(--s-3)' }}>
                      <div>
                        <dt>Total pago</dt>
                        <dd className="mono">{formatarMoeda(c.credito.totalPago)}</dd>
                      </div>
                      <div>
                        <dt>Custo do crédito</dt>
                        <dd className="mono">{formatarMoeda(Number(c.credito.totalPago) - Number(c.credito.valorFinanciado))} em juros</dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <p className="label">Sem crédito bancário</p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  )
}
