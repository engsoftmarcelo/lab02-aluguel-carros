import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, FileText, IdCard, Lock, MapPin, Save, Trash2, User } from 'lucide-react'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import Confirmar from '../../components/ui/Confirmar'
import { EstadoErro } from '../../components/ui/Estados'
import RendimentosEditor, { novoRendimento, paraApi } from '../../components/forms/RendimentosEditor'
import useCarregar from '../../hooks/useCarregar'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { ClientesAPI, lerErro } from '../../services/api'
import { formatarMoeda, mascaraCPF } from '../../utils/formato'

export default function Perfil() {
  const { atualizarUsuario, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const dados = useCarregar(() => ClientesAPI.meusDados())
  const [form, setForm] = useState(null)
  const [rendimentos, setRendimentos] = useState([])
  const [erros, setErros] = useState({})
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [processando, setProcessando] = useState(false)

  useEffect(() => {
    if (!dados.dados) return
    const c = dados.dados
    setForm({ nome: c.nome, login: c.login, senha: '', endereco: c.endereco, rg: c.rg, cpf: mascaraCPF(c.cpf), profissao: c.profissao })
    setRendimentos(c.rendimentos.map((r) => novoRendimento(r)))
  }, [dados.dados])

  const mudar = (campo) => (e) => {
    setForm((f) => ({ ...f, [campo]: campo === 'cpf' ? mascaraCPF(e.target.value) : e.target.value }))
    setErros((x) => ({ ...x, [campo]: undefined }))
  }

  const salvar = async (e) => {
    e.preventDefault()
    setSalvando(true)
    setErros({})
    try {
      const corpo = { ...form, senha: form.senha || undefined, rendimentos: paraApi(rendimentos) }
      const atualizado = await ClientesAPI.atualizarMeusDados(corpo)
      dados.setDados(atualizado)
      atualizarUsuario({ nome: atualizado.nome, login: atualizado.login, endereco: atualizado.endereco })
      toast.sucesso('Dados atualizados', 'Seu cadastro foi salvo.')
    } catch (err) {
      const { mensagem, campos } = lerErro(err)
      setErros(campos)
      toast.erro('Não foi possível salvar', mensagem)
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async () => {
    setProcessando(true)
    try {
      await ClientesAPI.excluirMinhaConta()
      logout()
      toast.info('Conta excluída', 'Sentiremos sua falta.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.erro('Não foi possível excluir', lerErro(err).mensagem)
      setExcluindo(false)
    } finally {
      setProcessando(false)
    }
  }

  const renda = rendimentos.reduce((s, r) => s + Number(r.valor || 0), 0)

  return (
    <>
      <div className="pagina__cabecalho">
        <div>
          <p className="label">Área do cliente</p>
          <h1 className="pagina__titulo">Meus dados</h1>
          <p className="pagina__sub">Seus dados e rendimentos são usados na análise financeira dos pedidos.</p>
        </div>
      </div>

      {dados.erro ? (
        <EstadoErro mensagem={dados.erro} onTentar={dados.recarregar} />
      ) : !form ? (
        <Skeleton height={520} radius="var(--radius-lg)" />
      ) : (
        <form onSubmit={salvar} noValidate>
          <div className="grade" style={{ alignItems: 'start', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))' }}>
            <Card>
              <p className="bloco__titulo">Dados pessoais</p>
              <div className="form-grade form-grade--2">
                <Input label="Nome completo" icon={User} value={form.nome} onChange={mudar('nome')} error={erros.nome} className="span-2" />
                <Input label="E-mail (login)" type="email" value={form.login} onChange={mudar('login')} error={erros.login} />
                <Input label="Nova senha (opcional)" type="password" icon={Lock} value={form.senha} onChange={mudar('senha')} error={erros.senha} hint="Deixe vazio para manter" autoComplete="new-password" />
                <Input label="CPF" icon={IdCard} value={form.cpf} onChange={mudar('cpf')} error={erros.cpf} />
                <Input label="RG" icon={FileText} value={form.rg} onChange={mudar('rg')} error={erros.rg} />
                <Input label="Profissão" icon={Briefcase} value={form.profissao} onChange={mudar('profissao')} error={erros.profissao} />
                <Input label="Endereço" icon={MapPin} value={form.endereco} onChange={mudar('endereco')} error={erros.endereco} />
              </div>
            </Card>
            <div className="form-grade">
              <RendimentosEditor itens={rendimentos} onChange={setRendimentos} erros={erros} />
              <div className="resumo-valor">
                <span className="label">Renda total declarada</span>
                <span className="kpi__valor kpi__valor--mono">{formatarMoeda(renda)}</span>
              </div>
            </div>
          </div>
          <div className="wizard__rodape">
            <Button type="button" variant="danger" icon={Trash2} onClick={() => setExcluindo(true)}>
              Excluir minha conta
            </Button>
            <Button type="submit" variant="primary" icon={Save} loading={salvando}>
              Salvar alterações
            </Button>
          </div>
        </form>
      )}

      <Confirmar
        open={excluindo}
        titulo="Excluir sua conta?"
        texto="Seus dados e pedidos encerrados serão apagados. Não é possível excluir se houver pedido em análise, aprovado ou contratado."
        confirmar="Excluir definitivamente"
        perigo
        carregando={processando}
        onConfirmar={excluir}
        onFechar={() => setExcluindo(false)}
      />
    </>
  )
}
