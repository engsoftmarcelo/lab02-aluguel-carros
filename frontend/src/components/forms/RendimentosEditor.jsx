import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

export const MAX_RENDIMENTOS = 3
let seq = 0
export const novoRendimento = (r = {}) => ({ chave: ++seq, entidadeEmpregadora: r.entidadeEmpregadora || '', valor: r.valor ?? '' })

/** Editor de rendimentos (máximo 3) com adicionar/remover animado. */
export default function RendimentosEditor({ itens, onChange, erros = {} }) {
  const mudar = (chave, campo, valor) => onChange(itens.map((r) => (r.chave === chave ? { ...r, [campo]: valor } : r)))
  return (
    <fieldset className="rendimentos" style={{ margin: 0 }}>
      <div className="rendimentos__topo">
        <legend className="field__label" style={{ padding: 0 }}>
          Rendimentos (empregadores)
        </legend>
        <span className="contador" aria-label={`${itens.length} de ${MAX_RENDIMENTOS}`}>
          <span className="contador__pontos" aria-hidden="true">
            {Array.from({ length: MAX_RENDIMENTOS }, (_, i) => (
              <span key={i} className={`contador__ponto ${i < itens.length ? 'contador__ponto--cheio' : ''}`} />
            ))}
          </span>
          {itens.length}/{MAX_RENDIMENTOS}
        </span>
      </div>
      {erros.rendimentos && <span className="field__erro">{erros.rendimentos}</span>}
      <AnimatePresence initial={false}>
        {itens.map((r, i) => (
          <motion.div
            key={r.chave}
            className="rendimento"
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0, x: 24 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Input
              label={`Entidade empregadora ${i + 1}`}
              value={r.entidadeEmpregadora}
              onChange={(e) => mudar(r.chave, 'entidadeEmpregadora', e.target.value)}
              error={erros[`rendimentos[${i}].entidadeEmpregadora`]}
            />
            <Input
              label="Valor (R$)"
              type="number"
              min="0"
              step="0.01"
              value={r.valor}
              onChange={(e) => mudar(r.chave, 'valor', e.target.value)}
              error={erros[`rendimentos[${i}].valor`]}
            />
            <Button type="button" variant="ghost" icon={Trash2} aria-label={`Remover rendimento ${i + 1}`} onClick={() => onChange(itens.filter((x) => x.chave !== r.chave))} />
          </motion.div>
        ))}
      </AnimatePresence>
      {itens.length < MAX_RENDIMENTOS ? (
        <Button type="button" variant="secondary" size="sm" icon={Plus} onClick={() => onChange([...itens, novoRendimento()])}>
          Adicionar rendimento
        </Button>
      ) : (
        <p className="field__dica">Limite de {MAX_RENDIMENTOS} rendimentos atingido.</p>
      )}
    </fieldset>
  )
}

/** Converte o estado do editor para o formato da API (ignora linhas vazias). */
export const paraApi = (itens) =>
  itens.filter((r) => r.entidadeEmpregadora.trim()).map((r) => ({ entidadeEmpregadora: r.entidadeEmpregadora.trim(), valor: Number(r.valor || 0) }))
