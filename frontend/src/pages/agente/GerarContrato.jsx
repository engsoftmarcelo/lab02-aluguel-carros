import { useEffect, useState } from 'react'
import { Building2, Landmark, UserRound } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { PedidosAPI, lerErro } from '../../services/api'
import { formatarMoeda, parcelaPrice } from '../../utils/formato'

const TIPOS = [
  { v: 'CLIENTE', l: 'Cliente', d: 'O carro passa a ser do cliente.', icon: UserRound },
  { v: 'EMPRESA', l: 'Empresa', d: 'Fica com a empresa locadora.', icon: Building2 },
  { v: 'BANCO', l: 'Banco', d: 'Fica registrado em nome do banco.', icon: Landmark },
]

/** Gera o contrato de um pedido aprovado. Banco pode associar um contrato de crédito (Tabela Price). */
export default function GerarContrato({ pedido, open, onFechar, onGerado }) {
  const { isBanco, usuario } = useAuth()
  const toast = useToast()
  const [tipo, setTipo] = useState('CLIENTE')
  const [comCredito, setComCredito] = useState(false)
  const [credito, setCredito] = useState({ valorFinanciado: '', taxaJuros: '1.99', parcelas: '12' })
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open || !pedido) return
    setTipo('CLIENTE')
    setComCredito(false)
    setCredito({ valorFinanciado: String(pedido.valorEstimado), taxaJuros: '1.99', parcelas: '12' })
    setErro('')
    setErros({})
  }, [open, pedido])

  const parcela = parcelaPrice(credito.valorFinanciado, credito.taxaJuros, credito.parcelas)

  const gerar = async () => {
    setSalvando(true)
    setErro('')
    setErros({})
    try {
      const corpo = {
        tipoPropriedade: tipo,
        credito: comCredito
          ? { valorFinanciado: Number(credito.valorFinanciado), taxaJuros: Number(credito.taxaJuros), parcelas: Number(credito.parcelas) }
          : null,
      }
      const contrato = await PedidosAPI.gerarContrato(pedido.id, corpo)
      toast.sucesso('Contrato gerado', `Contrato #${String(contrato.id).padStart(4, '0')} assinado${contrato.credito ? ' com crédito' : ''}.`)
      onGerado(contrato)
    } catch (e) {
      const { mensagem, campos } = lerErro(e)
      setErro(mensagem)
      setErros(Object.fromEntries(Object.entries(campos).map(([k, v]) => [k.replace('credito.', ''), v])))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onFechar}
      size="lg"
      title="Gerar contrato"
      subtitle={pedido ? `Pedido #${String(pedido.id).padStart(4, '0')} · ${pedido.clienteNome} · ${formatarMoeda(pedido.valorEstimado)}` : ''}
      footer={
        <>
          <Button variant="ghost" onClick={onFechar}>
            Voltar
          </Button>
          <Button variant="primary" loading={salvando} onClick={gerar}>
            Assinar contrato
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
        <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="field__label" style={{ marginBottom: 'var(--s-2)' }}>
            Propriedade do automóvel após o contrato
          </legend>
          <div className="tipos" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            {TIPOS.map((t) => {
              const Icone = t.icon
              const bloqueado = t.v === 'BANCO' && !isBanco
              return (
                <label key={t.v} className="tipo" style={bloqueado ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}>
                  <input type="radio" name="tipoPropriedade" value={t.v} checked={tipo === t.v} disabled={bloqueado} onChange={() => setTipo(t.v)} />
                  <Icone size={20} aria-hidden="true" />
                  <span className="tipo__nome">{t.l}</span>
                  <span className="tipo__desc">{bloqueado ? 'Só um banco pode registrar.' : t.d}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        {isBanco ? (
          <div className="bloco">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={comCredito} onChange={(e) => setComCredito(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent)' }} />
              <span>
                <strong>Conceder crédito</strong> <span className="text-soft">— contrato de crédito do {usuario?.nome}</span>
              </span>
            </label>
            {comCredito && (
              <div style={{ marginTop: 'var(--s-4)' }}>
                <div className="form-grade form-grade--3">
                  <Input label="Valor financiado (R$)" type="number" min="0.01" step="0.01" max={pedido?.valorEstimado} value={credito.valorFinanciado} onChange={(e) => setCredito((c) => ({ ...c, valorFinanciado: e.target.value }))} error={erros.valorFinanciado} />
                  <Input label="Juros (% ao mês)" type="number" min="0" max="20" step="0.01" value={credito.taxaJuros} onChange={(e) => setCredito((c) => ({ ...c, taxaJuros: e.target.value }))} error={erros.taxaJuros} />
                  <Input label="Parcelas" type="number" min="1" max="120" step="1" value={credito.parcelas} onChange={(e) => setCredito((c) => ({ ...c, parcelas: e.target.value }))} error={erros.parcelas} />
                </div>
                <div className="resumo-valor" style={{ marginTop: 'var(--s-4)' }}>
                  <span className="label">Parcela pela Tabela Price</span>
                  <span>
                    <span className="resumo-valor__numero">
                      {credito.parcelas || 0}× {formatarMoeda(parcela)}
                    </span>
                    <span className="text-soft mono" style={{ display: 'block', textAlign: 'right', marginTop: 6 }}>
                      total {formatarMoeda(parcela * Number(credito.parcelas || 0))}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="field__dica">Contratos de crédito só podem ser concedidos por bancos.</p>
        )}
      </div>
    </Modal>
  )
}
