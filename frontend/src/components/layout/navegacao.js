import { Car, FilePlus2, FileSignature, LayoutDashboard, ListChecks, UserRound, Users } from 'lucide-react'

/** Itens de navegação do app por papel. */
export const NAV_CLIENTE = [
  { to: '/app', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/app/pedidos/novo', label: 'Novo pedido', icon: FilePlus2 },
  { to: '/app/pedidos', label: 'Meus pedidos', icon: ListChecks, end: true },
  { to: '/app/contratos', label: 'Contratos', icon: FileSignature },
  { to: '/app/perfil', label: 'Meus dados', icon: UserRound },
]

export const NAV_AGENTE = [
  { to: '/agente', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/agente/pedidos', label: 'Pedidos', icon: ListChecks },
  { to: '/agente/contratos', label: 'Contratos', icon: FileSignature },
  { to: '/agente/clientes', label: 'Clientes', icon: Users },
  { to: '/agente/frota', label: 'Frota', icon: Car },
]
