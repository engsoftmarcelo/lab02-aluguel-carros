import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Info, Lock, Mail, Sparkles } from 'lucide-react'
import AuthLayout from './AuthLayout'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { homeDoPapel, useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { lerErro } from '../../services/api'

/** Contas de demonstração criadas pelo DataSeeder do backend (dados de teste). */
const DEMO = [
  { papel: 'Cliente', login: 'cliente@demo.com' },
  { papel: 'Empresa', login: 'empresa@demo.com' },
  { papel: 'Banco', login: 'banco@demo.com' },
]
const SENHA_DEMO = 'demo123'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const local = useLocation()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erros, setErros] = useState({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [tremer, setTremer] = useState(0)
  const [demorando, setDemorando] = useState(false)

  // servidor gratuito dormindo: depois de 4 s, explica a espera em vez de deixar o botão girando em silêncio
  useEffect(() => {
    if (!enviando) {
      setDemorando(false)
      return undefined
    }
    const t = setTimeout(() => setDemorando(true), 4000)
    return () => clearTimeout(t)
  }, [enviando])

  const enviar = async (e) => {
    e.preventDefault()
    const novos = {}
    if (!email.trim()) novos.login = 'Informe o e-mail'
    if (!senha) novos.senha = 'Informe a senha'
    setErros(novos)
    setErroGeral('')
    if (Object.keys(novos).length) {
      setTremer((n) => n + 1)
      return
    }
    setEnviando(true)
    try {
      const usuario = await login(email.trim(), senha)
      toast.sucesso(`Olá, ${usuario.nome.split(' ')[0]}`, 'Login realizado.')
      navigate(local.state?.de || homeDoPapel(usuario.papel), { replace: true })
    } catch (err) {
      const { mensagem, campos } = lerErro(err)
      setErros(campos)
      setErroGeral(mensagem)
      setTremer((n) => n + 1)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthLayout>
      <motion.div
        key={tremer}
        animate={tremer ? { x: [0, -8, 8, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        style={{ width: '100%' }}
      >
        <Card variant="vidro" traco className="auth__card">
          <div className="auth__cabecalho">
            <p className="label">Acesso</p>
            <h1>Entrar</h1>
            <p>Acompanhe seus pedidos ou avalie os da sua carteira.</p>
          </div>

          <form className="auth__form" onSubmit={enviar} noValidate>
            {params.get('sessao') === 'expirada' && !erroGeral && (
              <div className="alerta alerta--info" role="status">
                <Info aria-hidden="true" />
                Sua sessão expirou. Entre novamente para continuar.
              </div>
            )}
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

            <Input
              label="E-mail"
              type="email"
              icon={Mail}
              autoComplete="username"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={erros.login}
            />
            <Input
              label="Senha"
              type="password"
              icon={Lock}
              autoComplete="current-password"
              placeholder="••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              error={erros.senha}
            />
            <Button type="submit" variant="primary" size="lg" block loading={enviando} iconRight={ArrowRight}>
              Entrar
            </Button>
            {demorando && (
              <p className="field__dica" role="status" style={{ marginTop: 'calc(var(--s-2) * -1)' }}>
                Acordando o servidor… no plano gratuito, o primeiro acesso pode levar até 1 minuto.
              </p>
            )}

            <details className="demo">
              <summary>
                <span className="label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} aria-hidden="true" /> Contas demo
                </span>
                <span className="label" style={{ whiteSpace: 'nowrap' }}>senha {SENHA_DEMO}</span>
              </summary>
              <div className="demo__botoes">
                {DEMO.map((d) => (
                  <Button
                    key={d.login}
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEmail(d.login)
                      setSenha(SENHA_DEMO)
                      setErros({})
                      setErroGeral('')
                    }}
                  >
                    {d.papel}
                  </Button>
                ))}
              </div>
            </details>
          </form>

          <p className="auth__rodape">
            Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
          </p>
        </Card>
      </motion.div>
    </AuthLayout>
  )
}
