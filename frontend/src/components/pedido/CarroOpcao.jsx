import { Check } from 'lucide-react'
import FotoCarro, { TracoCarro } from '../carro/FotoCarro'
import { exibirPlaca, formatarMoeda } from '../../utils/formato'

export { TracoCarro }

/** Card de automóvel selecionável (wizard) ou informativo (frota): foto do modelo + dados comparáveis. */
export default function CarroOpcao({ carro, selecionado, onClick, rodape, prioridade, as: Tag = 'button' }) {
  const props = Tag === 'button' ? { type: 'button', onClick, 'aria-pressed': Boolean(selecionado) } : {}
  return (
    <Tag className="carro-op" {...props}>
      <FotoCarro carro={carro} tamanho="card" prioridade={prioridade} rotulo={false} sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 400px" />
      {selecionado && (
        <span className="carro-op__check" aria-hidden="true">
          <Check size={14} />
        </span>
      )}
      <span className="carro-op__corpo">
        <span className="label">
          {carro.marca} · {carro.ano}
        </span>
        <span className="carro-op__modelo">{carro.modelo}</span>
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
      </span>
    </Tag>
  )
}
