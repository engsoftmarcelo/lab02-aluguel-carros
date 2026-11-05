import { forwardRef } from 'react'
import { Link } from 'react-router-dom'

/** Botão do design system. variant: primary | secondary | ghost | danger. Aceita `to` (vira Link). */
const Button = forwardRef(function Button(
  { variant = 'secondary', size, block, loading, icon: Icon, iconRight: IconRight, to, children, className = '', disabled, ...props },
  ref,
) {
  const classes = ['btn', `btn--${variant}`, size && `btn--${size}`, block && 'btn--block', !children && 'btn--icon', className]
    .filter(Boolean)
    .join(' ')
  const conteudo = (
    <>
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : Icon && <Icon size={18} aria-hidden="true" />}
      {children}
      {IconRight && !loading && <IconRight size={18} aria-hidden="true" />}
    </>
  )
  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {conteudo}
      </Link>
    )
  }
  return (
    <button ref={ref} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {conteudo}
    </button>
  )
})

export default Button
