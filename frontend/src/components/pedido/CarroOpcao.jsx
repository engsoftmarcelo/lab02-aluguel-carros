import { Check } from 'lucide-react'
import { exibirPlaca, formatarMoeda } from '../../utils/formato'

export function TracoCarro({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 28" fill="none" aria-hidden="true">
      <path d="M2 21H17C22 21 23.5 11.5 31 9.5C38.5 7.5 46 10.5 51 15.5L54.5 19C55.6 20.1 57.1 21 58.7 21H62" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** Card de automóvel selecionável (wizard) ou informativo (frota). */
export default function CarroOpcao({ carro, selecionado, onClick, rodape, as: Tag = 'button' }) {
  const props = Tag === 'button' ? { type: 'button', onClick, 'aria-pressed': Boolean(selecionado) } : {}
  return (
    <Tag className="carro-op" {...props}>
      {selecionado && (
        <span className="carro-op__check" aria-hidden="true">
          <Check size={14} />
        </span>
      )}
      <span className="label">
        {carro.marca} · {carro.ano}
      </span>
      <span className="carro-op__modelo">{carro.modelo}</span>
      <TracoCarro className="carro-op__traco" />
      <span className="carro-op__base">
        <span className="placa">{exibirPlaca(carro.placa)}</span>
        <span>
          <span className="mono" style={{ fontWeight: 600 }}>
            {formatarMoeda(carro.valorDiaria)}
          </span>
          <span className="label"> /dia</span>
        </span>
      </span>
      {rodape}
    </Tag>
  )
}
