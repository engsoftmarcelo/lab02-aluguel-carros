import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Building2,
  FileText,
  IdCard,
  Landmark,
  Lock,
  Mail,
  MapPin,
  Plus,
  Trash2,
  User,
  UserRound,
} from 'lucide-react'
import AuthLayout from './AuthLayout'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { homeDoPapel, useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { lerErro } from '../../services/api'
import { mascaraCNPJ, mascaraCPF, somenteDigitos } from '../../utils/formato'

const MAX_RENDIMENTOS = 3
const ABAS = [
  { id: 'cliente', label: 'Sou cliente', icon: UserRound },
  { id: 'agente', label: 'Sou agente', icon: Building2 },
]

const vazioCliente = { nome: '', login: '', senha: '', endereco: '', rg: '', cpf: '', profissao: '' }
const vazioAgente = { nome: '', login: '', senha: '', endereco: '', cnpj: '', tipo: 'EMPRESA' }

let seqRendimento = 0
const novoRendimento = () => ({ chave: ++seqRendimento, entidadeEmpregadora: '', valor: '' })

/** Validação local rápida (o backend valida tudo de novo). */
function validarBase(d) {
  const e = {}
  if (!d.nome.trim()) e.nome = 'Informe o nome'
  if (!d.login.trim()) e.login = 'Informe o e-mail'
  else if (!/^\S+@\S+\.\S+$/.test(d.login.trim())) e.login = 'E-mail inválido'
  if (d.senha.length < 6) e.senha = 'Mínimo de 6 caracteres'
  if (!d.endereco.trim()) e.endereco = 'Informe o endereço'
  return e
}

function Contador({ total }) {
  return (
    <span className="contador" aria-label={`${total} de ${MAX_RENDIMENTOS} rendimentos`}>
      <span className="contador__pontos" aria-hidden="true">
        {Array.from({ length: MAX_RENDIMENTOS }, (_, i) => (
          <span key={i} className={`contador__ponto ${i < total ? 'contador__ponto--cheio' : ''}`} />
        ))}
      </span>
      {total}/{MAX_RENDIMENTOS}
    </span>
  )
}

export default function Cadastro() {
  const { registrarCliente, registrarAgente } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [aba, setAba] = useState('cliente')
  const [cliente, setCliente] = useState(vazioCliente)
  const [agente, setAgente] = useState(vazioAgente)
  const [rendimentos, setRendimentos] = useState([novoRendimento()])
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)

  const mudarCliente = (campo) => (e) => {
    const v = campo === 'cpf' ? mascaraCPF(e.target.value) : e.target.value
    setCliente((c) => ({ ...c, [campo]: v }))
    setErros((x) => ({ ...x, [campo]: undefined }))
  }
  const mudarAgente = (campo) => (e) => {
    const v = campo === 'cnpj' ? mascaraCNPJ(e.target.value) : e.target.value
    setAgente((a) => ({ ...a, [campo]: v }))
    setErros((x) => ({ ...x, [campo]: undefined }))
  }
  const mudarRendimento = (chave, campo, valor) =>
    setRendimentos((lista) => lista.map((r) => (r.chave === chave ? { ...r, [campo]: valor } : r)))

  const trocarAba = (id) => {
    setAba(id)
    setErros({})
    setErroGeral('')
  }

  const concluir = (usuario) => {
    toast.sucesso('Conta criada', `Bem-vindo(a) à Arredor, ${usuario.nome.split(' ')[0]}.`)
    navigate(homeDoPapel(usuario.papel), { replace: true })
  }

  const enviar = async (e) => {
    e.preventDefault()
    setErroGeral('')
    let novos
    if (aba === 'cliente') {
      novos = validarBase(cliente)
      if (!cliente.rg.trim()) novos.rg = 'Informe o RG'
      if (somenteDigitos(cliente.cpf).length !== 11) novos.cpf = 'CPF deve ter 11 dígitos'
      if (!cliente.profissao.trim()) novos.profissao = 'Informe a profissão'
      rendimentos.forEach((r, i) => {
        const preenchido = r.entidadeEmpregadora.trim() || r.valor !== ''
        if (preenchido && !r.entidadeEmpregadora.trim()) novos[`rendimentos[${i}].entidadeEmpregadora`] = 'Informe a empresa'
        if (preenchido && (r.valor === '' || Number(r.valor) < 0)) novos[`rendimentos[${i}].valor`] = 'Valor inválido'
      })
    } else {
      novos = validarBase(agente)
      if (somenteDigitos(agente.cnpj).length !== 14) novos.cnpj = 'CNPJ deve ter 14 dígitos'
    }
    setErros(novos)
    if (Object.keys(novos).length) {
      setErroGeral('Revise os campos destacados.')
      return
    }

    setEnviando(true)
    try {
      if (aba === 'cliente') {
        const lista = rendimentos
          .filter((r) => r.entidadeEmpregadora.trim())
          .map((r) => ({ entidadeEmpregadora: r.entidadeEmpregadora.trim(), valor: Number(r.valor) }))
        concluir(await registrarCliente({ ...cliente, login: cliente.login.trim(), rendimentos: lista }))
      } else {
        concluir(await registrarAgente({ ...agente, login: agente.login.trim() }))
      }
    } catch (err) {
      const { mensagem, campos } = lerErro(err)
      setErros(campos)
      setErroGeral(mensagem)
    } finally {
      setEnviando(false)
    }
  }

  const dados = aba === 'cliente' ? cliente : agente
  const mudar = aba === 'cliente' ? mudarCliente : mudarAgente

  return (
    <AuthLayout>
      <Card variant="vidro" traco className="auth__card auth__card--largo">
        <div className="auth__cabecalho">
          <p className="label">Cadastro</p>
          <h1>Criar conta</h1>
          <p>O acesso à Arredor exige cadastro e login.</p>
        </div>

        <div className="abas" role="tablist" aria-label="Tipo de conta" style={{ marginBottom: 'var(--s-5)' }}>
          {ABAS.map((a) => {
            const Icone = a.icon
            const ativa = aba === a.id
            return (
              <button
                key={a.id}
                type="button"
                role="tab"
                className="aba"
                aria-selected={ativa}
                aria-controls="form-cadastro"
                onClick={() => trocarAba(a.id)}
              >
                {ativa && <motion.span layoutId="aba-cadastro" className="aba__fundo" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                <span className="aba__texto">
                  <Icone size={16} aria-hidden="true" />
                  {a.label}
                </span>
              </button>
            )
          })}
        </div>

        <form id="form-cadastro" className="auth__form" onSubmit={enviar} noValidate>
          <AnimatePresence>
            {erroGeral && (
              <motion.div
                className="alerta"
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertTriangle aria-hidden="true" />
                {erroGeral}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="auth__grid auth__grid--2">
            <Input label={aba === 'cliente' ? 'Nome completo' : 'Razão social'} icon={aba === 'cliente' ? User : Building2} value={dados.nome} onChange={mudar('nome')} error={erros.nome} autoComplete={aba === 'cliente' ? 'name' : 'organization'} />
            <Input label="E-mail (login)" type="email" icon={Mail} value={dados.login} onChange={mudar('login')} error={erros.login} autoComplete="email" />
            <Input label="Senha" type="password" icon={Lock} value={dados.senha} onChange={mudar('senha')} error={erros.senha} hint="Mínimo de 6 caracteres" autoComplete="new-password" />
            <Input label="Endereço" icon={MapPin} value={dados.endereco} onChange={mudar('endereco')} error={erros.endereco} autoComplete="street-address" />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {aba === 'cliente' ? (
              <motion.div
                key="cliente"
                className="auth__form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="auth__grid auth__grid--2">
                  <Input label="CPF" icon={IdCard} inputMode="numeric" placeholder="000.000.000-00" value={cliente.cpf} onChange={mudarCliente('cpf')} error={erros.cpf} />
                  <Input label="RG" icon={FileText} value={cliente.rg} onChange={mudarCliente('rg')} error={erros.rg} />
                </div>
                <Input label="Profissão" icon={Briefcase} value={cliente.profissao} onChange={mudarCliente('profissao')} error={erros.profissao} autoComplete="organization-title" />

                <fieldset className="rendimentos" style={{ margin: 0 }}>
                  <div className="rendimentos__topo">
                    <legend className="field__label" style={{ padding: 0 }}>
                      Rendimentos (empregadores)
                    </legend>
                    <Contador total={rendimentos.length} />
                  </div>
                  {erros.rendimentos && <span className="field__erro">{erros.rendimentos}</span>}
                  <AnimatePresence initial={false}>
                    {rendimentos.map((r, i) => (
                      <motion.div
                        key={r.chave}
                        className="rendimento"
                        layout
                        initial={{ opacity: 0, height: 0, y: -8 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, x: 24 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Input
                          label={`Entidade empregadora ${i + 1}`}
                          value={r.entidadeEmpregadora}
                          onChange={(e) => mudarRendimento(r.chave, 'entidadeEmpregadora', e.target.value)}
                          error={erros[`rendimentos[${i}].entidadeEmpregadora`]}
                        />
                        <Input
                          label="Valor (R$)"
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={r.valor}
                          onChange={(e) => mudarRendimento(r.chave, 'valor', e.target.value)}
                          error={erros[`rendimentos[${i}].valor`]}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          icon={Trash2}
                          aria-label={`Remover rendimento ${i + 1}`}
                          onClick={() => setRendimentos((lista) => lista.filter((x) => x.chave !== r.chave))}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {rendimentos.length < MAX_RENDIMENTOS ? (
                    <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={() => setRendimentos((l) => [...l, novoRendimento()])}>
                      Adicionar rendimento
                    </Button>
                  ) : (
                    <p className="field__dica">Limite de {MAX_RENDIMENTOS} rendimentos atingido.</p>
                  )}
                </fieldset>
              </motion.div>
            ) : (
              <motion.div
                key="agente"
                className="auth__form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <Input label="CNPJ" icon={IdCard} inputMode="numeric" placeholder="00.000.000/0000-00" value={agente.cnpj} onChange={mudarAgente('cnpj')} error={erros.cnpj} />
                <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend className="field__label" style={{ marginBottom: 'var(--s-2)' }}>
                    Tipo de agente
                  </legend>
                  <div className="tipos">
                    <label className="tipo">
                      <input type="radio" name="tipo" value="EMPRESA" checked={agente.tipo === 'EMPRESA'} onChange={mudarAgente('tipo')} />
                      <Building2 size={22} aria-hidden="true" />
                      <span className="tipo__nome">Empresa</span>
                      <span className="tipo__desc">Avalia pedidos e gere a frota.</span>
                    </label>
                    <label className="tipo">
                      <input type="radio" name="tipo" value="BANCO" checked={agente.tipo === 'BANCO'} onChange={mudarAgente('tipo')} />
                      <Landmark size={22} aria-hidden="true" />
                      <span className="tipo__nome">Banco</span>
                      <span className="tipo__desc">Avalia e concede crédito.</span>
                    </label>
                  </div>
                </fieldset>
              </motion.div>
            )}
          </AnimatePresence>

          <Button type="submit" variant="primary" size="lg" block loading={enviando} iconRight={ArrowRight}>
            Criar conta
          </Button>
        </form>

        <p className="auth__rodape">
          Já tem conta? <Link to="/entrar">Entrar</Link>
        </p>
      </Card>
    </AuthLayout>
  )
}
