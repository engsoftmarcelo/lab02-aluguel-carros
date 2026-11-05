import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import RotaProtegida, { SomenteVisitante } from './routes/RotaProtegida'

// Cada área é um pedaço separado do bundle: quem só vê a landing não baixa os painéis (e vice-versa).
const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/auth/Login'))
const Cadastro = lazy(() => import('./pages/auth/Cadastro'))
const AppShell = lazy(() => import('./components/layout/AppShell'))
const PainelCliente = lazy(() => import('./pages/cliente/PainelCliente'))
const NovoPedido = lazy(() => import('./pages/cliente/NovoPedido'))
const MeusPedidos = lazy(() => import('./pages/cliente/MeusPedidos'))
const Perfil = lazy(() => import('./pages/cliente/Perfil'))
const Contratos = lazy(() => import('./pages/Contratos'))
const PainelAgente = lazy(() => import('./pages/agente/PainelAgente'))
const PedidosAgente = lazy(() => import('./pages/agente/PedidosAgente'))
const Clientes = lazy(() => import('./pages/agente/Clientes'))
const Frota = lazy(() => import('./pages/agente/Frota'))

function Carregando() {
  return (
    <div className="carregando-rota" role="status" aria-label="Carregando">
      <span />
    </div>
  )
}

/** Rotas: landing pública, auth para visitantes, /app (cliente) e /agente (empresa/banco) protegidas por papel. */
export default function App() {
  return (
    <Suspense fallback={<Carregando />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/entrar"
        element={
          <SomenteVisitante>
            <Login />
          </SomenteVisitante>
        }
      />
      <Route
        path="/cadastro"
        element={
          <SomenteVisitante>
            <Cadastro />
          </SomenteVisitante>
        }
      />

      <Route element={<RotaProtegida papeis={['CLIENTE']} />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<PainelCliente />} />
          <Route path="pedidos/novo" element={<NovoPedido />} />
          <Route path="pedidos" element={<MeusPedidos />} />
          <Route path="contratos" element={<Contratos />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Route>

      <Route element={<RotaProtegida papeis={['EMPRESA', 'BANCO']} />}>
        <Route path="/agente" element={<AppShell />}>
          <Route index element={<PainelAgente />} />
          <Route path="pedidos" element={<PedidosAgente />} />
          <Route path="contratos" element={<Contratos />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="frota" element={<Frota />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  )
}
