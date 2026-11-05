import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Cadastro from './pages/auth/Cadastro'
import AppShell from './components/layout/AppShell'
import RotaProtegida, { SomenteVisitante } from './routes/RotaProtegida'
import PainelCliente from './pages/cliente/PainelCliente'
import NovoPedido from './pages/cliente/NovoPedido'
import MeusPedidos from './pages/cliente/MeusPedidos'
import Perfil from './pages/cliente/Perfil'
import Contratos from './pages/Contratos'
import PainelAgente from './pages/agente/PainelAgente'
import PedidosAgente from './pages/agente/PedidosAgente'
import Clientes from './pages/agente/Clientes'
import Frota from './pages/agente/Frota'

/** Rotas: landing pública, auth para visitantes, /app (cliente) e /agente (empresa/banco) protegidas por papel. */
export default function App() {
  return (
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
  )
}
