import { useEffect, useState } from 'react'
import { Briefcase, FileText, IdCard, Lock, Mail, MapPin, PencilLine, Search, Trash2, User, UserPlus } from 'lucide-react'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Modal from '../../components/ui/Modal'
import Confirmar from '../../components/ui/Confirmar'
import { CarregandoLista, EstadoErro, EstadoVazio } from '../../components/ui/Estados'
import RendimentosEditor, { novoRendimento, paraApi } from '../../components/forms/RendimentosEditor'
import useCarregar from '../../hooks/useCarregar'
import { useToast } from '../../context/ToastContext'
import { ClientesAPI, lerErro } from '../../services/api'
import { formatarCPF, formatarMoeda, mascaraCPF } from '../../utils/formato'

const VAZIO = { nome: '', login: '', senha: '', endereco: '', rg: '', cpf: '', profissao: '' }

/** Formulário de cliente (criar ou editar) usado pelo agente. */
function ClienteForm({ cliente, open, onFechar, onSalvo }) {
  const toast = useToast()
  const editando = Boolean(cliente)
  const [form, setForm] = useState(VAZIO)
  const [rendimentos, setRendimentos] = useState([])
  const [erros, setErros] = useState({})
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return
    setErros({})
    setErro('')
    if (cliente) {
      setForm({ nome: cliente.nome, login: cliente.login, senha: '', endereco: cliente.endereco, rg: cliente.rg, cpf: mascaraCPF(cliente.cpf), profissao: cliente.profissao })
      setRendimentos(cliente.rendimentos.map((r) => novoRendimento(r)))
    } else {
      setForm(VAZIO)
      setRendimentos([novoRendimento()])
    }
  }, [open, cliente])

  const mudar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: campo === 'cpf' ? mascaraCPF(e.target.value) : e.target.value }))
    setErros((x) => ({ ...x, [campo]: undefined }))
  }

  const salvar = async (e) => {
    e?.preventDefault()
    setSalvando(true)
    setErro('')
    setErros({})
    try {
      const corpo = { ...form, senha: form.senha || undefined, rendimentos: paraApi(rendimentos) }
      const salvo = editando ? await ClientesAPI.atualizar(cliente.id, corpo) : await ClientesAPI.criar(corpo)
      toast.sucesso(editando ? 'Cliente atualizado' : 'Cliente cadastrado', salvo.nome)
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
      size="lg"
      title={editando ? 'Editar cliente' : 'Novo cliente'}
      subtitle={editando ? cliente.nome : 'Cadastre um cliente com até 3 rendimentos.'}
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
      <form className="form-grade" onSubmit={salvar} noValidate>
        {erro && (
          <div className="alerta" role="alert">
            {erro}
          </div>
        )}
        <div className="form-grade form-grade--2">
          <Input label="Nome completo" icon={User} value={form.nome} onChange={mudar('nome')} error={erros.nome} />
          <Input label="E-mail (login)" type="email" icon={Mail} value={form.login} onChange={mudar('login')} error={erros.login} />
          <Input label={editando ? 'Nova senha (opcional)' : 'Senha'} type="password" icon={Lock} value={form.senha} onChange={mudar('senha')} error={erros.senha} autoComplete="new-password" />
          <Input label="Endereço" icon={MapPin} value={form.endereco} onChange={mudar('endereco')} error={erros.endereco} />
          <Input label="CPF" icon={IdCard} value={form.cpf} onChange={mudar('cpf')} error={erros.cpf} />
          <Input label="RG" icon={FileText} value={form.rg} onChange={mudar('rg')} error={erros.rg} />
          <Input label="Profissão" icon={Briefcase} value={form.profissao} onChange={mudar('profissao')} error={erros.profissao} className="span-2" />
        </div>
        <RendimentosEditor itens={rendimentos} onChange={setRendimentos} erros={erros} />
      </form>
    </Modal>
  )
}

export default function Clientes() {
  const toast = useToast()
  const [busca, setBusca] = useState('')
  const [termo, setTermo] = useState('')
  const clientes = useCarregar(() => ClientesAPI.listar(termo), [termo])
  const [editando, setEditando] = useState(null)
  const [criando, setCriando] = useState(false)
  const [excluindo, setExcluindo] = useState(null)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setTermo(busca.trim()), 300)
    return () => clearTimeout(t)
  }, [busca])

  const excluir = async () => {
    setProcessando(true)
    try {
      await ClientesAPI.excluir(excluindo.id)
      clientes.setDados((l) => l.filter((c) => c.id !== excluindo.id))
      toast.info('Cliente excluído', excluindo.nome)
      setExcluindo(null)
    } catch (e) {
      toast.erro('Não foi possível excluir', lerErro(e).mensagem)
    } finally {
      setProcessando(false)
    }
  }

  return (
    <>
      <div className="pagina__cabecalho">
        <div>
          <p className="label">Área do agente</p>
          <h1 className="pagina__titulo">Clientes</h1>
          <p className="pagina__sub">Cadastro completo: dados, profissão e rendimentos usados na análise.</p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={() => setCriando(true)}>
          Novo cliente
        </Button>
      </div>

      <div className="barra-ferramentas">
        <Input icon={Search} placeholder="Buscar por nome ou CPF" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar cliente" />
        <span className="label">{clientes.dados?.length ?? 0} cliente(s)</span>
      </div>

      {clientes.carregando && !clientes.dados ? (
        <CarregandoLista linhas={5} altura={52} />
      ) : clientes.erro ? (
        <EstadoErro mensagem={clientes.erro} onTentar={clientes.recarregar} />
      ) : clientes.dados.length === 0 ? (
        <EstadoVazio titulo={termo ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'} texto={termo ? 'Tente outro nome ou CPF.' : undefined} />
      ) : (
        <div className="tabela-janela">
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col">Cliente</th>
                <th scope="col">CPF</th>
                <th scope="col">Profissão</th>
                <th scope="col">Rendimentos</th>
                <th scope="col" style={{ textAlign: 'right' }}>
                  Renda total
                </th>
                <th scope="col">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.dados.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.nome}</strong>
                    <div className="text-soft">{c.login}</div>
                  </td>
                  <td className="mono">{formatarCPF(c.cpf)}</td>
                  <td>{c.profissao}</td>
                  <td className="mono">{c.rendimentos.length}/3</td>
                  <td className="mono" style={{ textAlign: 'right' }}>
                    {formatarMoeda(c.rendaTotal)}
                  </td>
                  <td>
                    <div className="tabela__acoes">
                      <Button variant="ghost" size="sm" icon={PencilLine} aria-label={`Editar ${c.nome}`} onClick={() => setEditando(c)} />
                      <Button variant="ghost" size="sm" icon={Trash2} aria-label={`Excluir ${c.nome}`} onClick={() => setExcluindo(c)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClienteForm
        open={criando || Boolean(editando)}
        cliente={editando}
        onFechar={() => {
          setCriando(false)
          setEditando(null)
        }}
        onSalvo={(salvo, foiEdicao) => {
          clientes.setDados((l) => (foiEdicao ? l.map((c) => (c.id === salvo.id ? salvo : c)) : [salvo, ...l]))
          setCriando(false)
          setEditando(null)
        }}
      />

      <Confirmar
        open={Boolean(excluindo)}
        titulo={`Excluir ${excluindo?.nome || ''}?`}
        texto="O cadastro e os pedidos encerrados do cliente serão apagados. Clientes com pedido em análise, aprovado ou contratado não podem ser excluídos."
        confirmar="Excluir"
        perigo
        carregando={processando}
        onConfirmar={excluir}
        onFechar={() => setExcluindo(null)}
      />
    </>
  )
}
