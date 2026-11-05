import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Car, Hash, PencilLine, Plus, Search, Tag, Trash2 } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import Confirmar from '../../components/ui/Confirmar'
import { EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import CarroOpcao from '../../components/pedido/CarroOpcao'
import useCarregar from '../../hooks/useCarregar'
import { useToast } from '../../context/ToastContext'
import { AutomoveisAPI, lerErro } from '../../services/api'
import { mascaraPlaca, PAPEL_LABEL } from '../../utils/formato'

const VAZIO = { matricula: '', ano: String(new Date().getFullYear()), marca: '', modelo: '', placa: '', valorDiaria: '' }

function CarroForm({ carro, open, onFechar, onSalvo }) {
  const toast = useToast()
  const editando = Boolean(carro)
  const [form, setForm] = useState(VAZIO)
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return
    setErros({})
    setErro('')
    setForm(carro ? { matricula: carro.matricula, ano: String(carro.ano), marca: carro.marca, modelo: carro.modelo, placa: carro.placa, valorDiaria: String(carro.valorDiaria) } : VAZIO)
  }, [open, carro])

  const mudar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: campo === 'placa' ? mascaraPlaca(e.target.value) : e.target.value }))
    setErros((x) => ({ ...x, [campo]: undefined }))
  }

  const salvar = async (e) => {
    e?.preventDefault()
    setSalvando(true)
    setErro('')
    setErros({})
    try {
      const corpo = { ...form, ano: Number(form.ano), valorDiaria: Number(form.valorDiaria) }
      const salvo = editando ? await AutomoveisAPI.atualizar(carro.id, corpo) : await AutomoveisAPI.criar(corpo)
      toast.sucesso(editando ? 'Automóvel atualizado' : 'Automóvel cadastrado', `${salvo.marca} ${salvo.modelo}`)
      onSalvo(salvo, editando)
    } catch (err) {
      const { mensagem, campos } = lerErro(err)
      setErro(mensagem)
      setErros(campos)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onFechar}
      title={editando ? 'Editar automóvel' : 'Novo automóvel'}
      subtitle={editando ? `${carro.marca} ${carro.modelo}` : 'Ele passa a ser propriedade do seu cadastro.'}
      footer={
        <>
          <Button variant="ghost" onClick={onFechar}>
            Voltar
          </Button>
          <Button variant="primary" loading={salvando} onClick={salvar}>
            {editando ? 'Salvar' : 'Cadastrar'}
          </Button>
        </>
      }
    >
      <form className="form-grade form-grade--2" onSubmit={salvar} noValidate>
        {erro && (
          <div className="alerta span-2" role="alert">
            {erro}
          </div>
        )}
        <Input label="Marca" icon={Car} value={form.marca} onChange={mudar('marca')} error={erros.marca} />
        <Input label="Modelo" value={form.modelo} onChange={mudar('modelo')} error={erros.modelo} />
        <Input label="Placa" icon={Tag} placeholder="ABC1D23" value={form.placa} onChange={mudar('placa')} error={erros.placa} hint="Padrão antigo ou Mercosul" />
        <Input label="Matrícula (Renavam)" icon={Hash} value={form.matricula} onChange={mudar('matricula')} error={erros.matricula} />
        <Input label="Ano" type="number" icon={CalendarDays} min="1950" max={new Date().getFullYear() + 1} value={form.ano} onChange={mudar('ano')} error={erros.ano} />
        <Input label="Diária (R$)" type="number" min="0.01" step="0.01" value={form.valorDiaria} onChange={mudar('valorDiaria')} error={erros.valorDiaria} />
      </form>
    </Modal>
  )
}

export default function Frota() {
  const toast = useToast()
  const frota = useCarregar(() => AutomoveisAPI.listar())
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState(null)
  const [criando, setCriando] = useState(false)
  const [excluindo, setExcluindo] = useState(null)
  const [processando, setProcessando] = useState(false)

  const lista = useMemo(() => {
    const t = busca.trim().toLowerCase()
    return (frota.dados || []).filter((c) => !t || `${c.marca} ${c.modelo} ${c.placa}`.toLowerCase().includes(t))
  }, [frota.dados, busca])

  const excluir = async () => {
    setProcessando(true)
    try {
      await AutomoveisAPI.excluir(excluindo.id)
      frota.setDados((l) => l.filter((c) => c.id !== excluindo.id))
      toast.info('Automóvel excluído', `${excluindo.marca} ${excluindo.modelo}`)
      setExcluindo(null)
    } catch (e) {
      toast.erro('Não foi possível excluir', lerErro(e).mensagem)
      setExcluindo(null)
    } finally {
      setProcessando(false)
    }
  }

  return (
    <>
      <div className="pagina__cabecalho">
        <div>
          <p className="label">Área do agente</p>
          <h1 className="pagina__titulo">Frota</h1>
          <p className="pagina__sub">Matrícula, ano, marca, modelo, placa e diária de cada automóvel.</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setCriando(true)}>
          Novo automóvel
        </Button>
      </div>

      <div className="barra-ferramentas">
        <Input icon={Search} placeholder="Buscar por marca, modelo ou placa" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar automóvel" />
        <span className="label">{lista.length} automóvel(is)</span>
      </div>

      {frota.carregando ? (
        <div className="grade grade--cards">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} height={250} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : frota.erro ? (
        <EstadoErro mensagem={frota.erro} onTentar={frota.recarregar} />
      ) : lista.length === 0 ? (
        <EstadoVazio titulo="Nenhum automóvel" texto={busca ? 'Tente outra busca.' : 'Cadastre o primeiro carro da frota.'} />
      ) : (
        <div className="grade grade--cards">
          {lista.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
              <CarroOpcao
                as="article"
                carro={c}
                rodape={
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 'var(--s-3)' }}>
                    <span className="label" title={c.proprietarioNome}>
                      Dono: {PAPEL_LABEL[c.tipoProprietario]} · {c.proprietarioNome?.split(' ')[0]}
                    </span>
                    <span style={{ display: 'flex', gap: 4 }}>
                      <Button variant="ghost" size="sm" icon={PencilLine} aria-label={`Editar ${c.modelo}`} onClick={() => setEditando(c)} />
                      <Button variant="ghost" size="sm" icon={Trash2} aria-label={`Excluir ${c.modelo}`} onClick={() => setExcluindo(c)} />
                    </span>
                  </span>
                }
              />
            </motion.div>
          ))}
        </div>
      )}

      <CarroForm
        open={criando || Boolean(editando)}
        carro={editando}
        onFechar={() => {
          setCriando(false)
          setEditando(null)
        }}
        onSalvo={(salvo, foiEdicao) => {
          frota.setDados((l) => (foiEdicao ? l.map((c) => (c.id === salvo.id ? salvo : c)) : [...l, salvo]))
          setCriando(false)
          setEditando(null)
        }}
      />

      <Confirmar
        open={Boolean(excluindo)}
        titulo={`Excluir ${excluindo ? `${excluindo.marca} ${excluindo.modelo}` : ''}?`}
        texto="Automóveis que já têm pedidos registrados não podem ser excluídos."
        confirmar="Excluir"
        perigo
        carregando={processando}
        onConfirmar={excluir}
        onFechar={() => setExcluindo(null)}
      />
    </>
  )
}
