import { forwardRef, useId } from 'react'
import { AlertCircle } from 'lucide-react'

/** Select nativo estilizado. options: [{ value, label }]. */
const Select = forwardRef(function Select({ label, options = [], error, placeholder, className = '', id, ...props }, ref) {
  const autoId = useId()
  const selectId = id || autoId
  return (
    <div className={`field ${error ? 'field--erro' : ''} ${className}`}>
      {label && (
        <label className="field__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className="select"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${selectId}-erro` : undefined}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${selectId}-erro`} className="field__erro" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  )
})

export default Select
