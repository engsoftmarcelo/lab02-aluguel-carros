import { useState } from 'react'
import { fotoDoCarro } from '../../utils/midiaFrota'

/** O traço do carro (fallback quando o modelo não tem foto). */
export function TracoCarro({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 64 28" fill="none" aria-hidden="true">
      <path d="M2 21H17C22 21 23.5 11.5 31 9.5C38.5 7.5 46 10.5 51 15.5L54.5 19C55.6 20.1 57.1 21 58.7 21H62" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/**
 * Foto ilustrativa do modelo num enquadramento que se abre (assinatura Arredor).
 * - tamanho: 'card' (16:10), 'capa' (passaporte/painel), 'mini' (listas).
 * - prioridade: true só para a imagem principal visível (sem lazy loading).
 * Sem foto (modelo cadastrado depois) ou se a imagem falhar: painel azul com o desenho do carro.
 */
export default function FotoCarro({ carro, tamanho = 'card', sizes = '(max-width: 700px) 100vw, 360px', prioridade = false, rotulo = true, className = '' }) {
  const foto = fotoDoCarro(carro)
  const [falhou, setFalhou] = useState(false)
  const nome = carro ? `${carro.marca} ${carro.modelo}` : 'automóvel'
  const classes = ['foto-carro', `foto-carro--${tamanho}`, className].filter(Boolean).join(' ')

  if (!foto || falhou) {
    return (
      <div className={`${classes} foto-carro--traco`} aria-hidden="true">
        <TracoCarro className="foto-carro__traco" />
      </div>
    )
  }

  return (
    <figure className={classes}>
      <img
        src={foto.src}
        srcSet={foto.srcSet}
        sizes={sizes}
        alt={tamanho === 'mini' ? '' : `Foto ilustrativa de um ${nome}`}
        loading={prioridade ? 'eager' : 'lazy'}
        fetchPriority={prioridade ? 'high' : undefined}
        decoding="async"
        style={{ objectPosition: foto.posicao }}
        onError={() => setFalhou(true)}
      />
      {rotulo && tamanho !== 'mini' && <figcaption className="foto-carro__rotulo">Foto ilustrativa do modelo</figcaption>}
    </figure>
  )
}
