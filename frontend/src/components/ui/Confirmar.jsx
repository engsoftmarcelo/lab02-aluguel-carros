import Modal from './Modal'
import Button from './Button'

/** Diálogo de confirmação para ações destrutivas. */
export default function Confirmar({ open, titulo, texto, confirmar = 'Confirmar', perigo, carregando, onConfirmar, onFechar }) {
  return (
    <Modal
      open={open}
      onClose={onFechar}
      title={titulo}
      footer={
        <>
          <Button variant="ghost" onClick={onFechar}>
            Voltar
          </Button>
          <Button variant={perigo ? 'danger' : 'primary'} loading={carregando} onClick={onConfirmar}>
            {confirmar}
          </Button>
        </>
      }
    >
      <p className="text-soft">{texto}</p>
    </Modal>
  )
}
