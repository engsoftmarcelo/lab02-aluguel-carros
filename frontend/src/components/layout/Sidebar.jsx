import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import Logo from '../ui/Logo'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { PAPEL_LABEL } from '../../utils/formato'
import { NAV_AGENTE, NAV_CLIENTE } from './navegacao'

function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] || '') + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

/** Item de navegação com a marca terracota animada indicando a página atual. */
function ItemNav({ item, idGrupo }) {
  const Icone = item.icon
  return (
    <NavLink to={item.to} end={item.end} className="navlink">
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId={idGrupo}
              className="navlink__traco"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
          <Icone size={18} aria-hidden="true" />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function UsuarioChip({ usuario }) {
  return (
    <div className="usuario-chip">
      <span className="usuario-chip__avatar" aria-hidden="true">
        {iniciais(usuario?.nome)}
      </span>
      <div style={{ minWidth: 0 }}>
        <p className="usuario-chip__nome">{usuario?.nome}</p>
        <p className="label">{PAPEL_LABEL[usuario?.papel]}</p>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const { usuario, isAgente, logout } = useAuth()
  const navigate = useNavigate()
  const itens = isAgente ? NAV_AGENTE : NAV_CLIENTE

  const sair = () => {
    logout()
    navigate('/entrar', { replace: true })
  }

  return (
    <>
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="sidebar__logo">
          <Logo to={isAgente ? '/agente' : '/app'} />
        </div>
        <p className="label sidebar__secao">{isAgente ? 'Área do agente' : 'Área do cliente'}</p>
        <nav className="sidebar__nav">
          {itens.map((item) => (
            <ItemNav key={item.to} item={item} idGrupo="traco-sidebar" />
          ))}
        </nav>
        <div className="sidebar__usuario">
          <UsuarioChip usuario={usuario} />
          <Button variant="ghost" size="sm" icon={LogOut} onClick={sair} block>
            Sair
          </Button>
        </div>
      </aside>

      <nav className="barra-inferior" aria-label="Navegação principal">
        {itens.map((item) => (
          <ItemNav key={item.to} item={item} idGrupo="traco-barra" />
        ))}
      </nav>
    </>
  )
}
