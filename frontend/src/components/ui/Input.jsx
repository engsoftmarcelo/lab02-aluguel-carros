import { forwardRef, useId, useState } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

/** Campo de texto com rótulo, ícone, dica e erro acessíveis. type="password" ganha botão de mostrar. */
const Input = forwardRef(function Input({ label, icon: Icon, error, hint, type = 'text', className = '', id, ...props }, ref) {
  const autoId = useId()
  const inputId = id || autoId
  const [mostrar, setMostrar] = useState(false)
  const ehSenha = type === 'password'
  const descricao = [error && `${inputId}-erro`, hint && `${inputId}-dica`].filter(Boolean).join(' ') || undefined

  return (
    <div className={`field ${error ? 'field--erro' : ''} ${className}`}>
      {label && (
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className={`field__control ${Icon ? 'field__control--icon' : ''}`}>
        {Icon && <Icon className="field__icon" aria-hidden="true" />}
        <input
          ref={ref}
          id={inputId}
          type={ehSenha && mostrar ? 'text' : type}
          className="input"
          aria-invalid={error ? true : undefined}
          aria-describedby={descricao}
          {...props}
        />
        {ehSenha && (
          <button
            type="button"
            className="input-toggle"
            onClick={() => setMostrar((v) => !v)}
            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {hint && !error && (
        <span id={`${inputId}-dica`} className="field__dica">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${inputId}-erro`} className="field__erro" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  )
})

export default Input
