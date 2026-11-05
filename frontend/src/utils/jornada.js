/**
 * "Tudo à vista": para cada status do pedido, o que já está definido, o que ainda falta
 * e o próximo passo — sempre fiel ao que o sistema realmente faz (sem cobrança, retirada
 * ou assinatura digital, que não existem no LAB02).
 */
const JORNADA = {
  EM_ANALISE: {
    definido: ['Carro e período escolhidos', 'Valor estimado calculado (diárias × valor da diária)'],
    falta: ['Análise financeira por uma empresa ou banco parceiro', 'Parecer registrado pelo agente'],
    proximo: {
      CLIENTE: 'Aguarde o parecer. Enquanto o pedido estiver em análise, você pode modificar ou cancelar.',
      AGENTE: 'Avalie o perfil financeiro do cliente e aprove ou reprove, sempre com parecer.',
    },
  },
  APROVADO: {
    definido: ['Parecer positivo registrado', 'Carro e período mantidos'],
    falta: ['Geração do contrato pelo agente (com ou sem crédito de banco)'],
    proximo: {
      CLIENTE: 'Seu pedido foi aprovado. O valor só se torna definitivo quando o contrato for gerado.',
      AGENTE: 'Gere o contrato: defina de quem será a propriedade e, se for banco, o crédito.',
    },
  },
  CONTRATADO: {
    definido: ['Contrato gerado e vinculado ao pedido', 'Proprietário do automóvel atualizado conforme o contrato'],
    falta: [],
    proximo: {
      CLIENTE: 'Tudo certo. Consulte o contrato para ver as condições e, se houver, as parcelas.',
      AGENTE: 'Contrato emitido. Ele fica disponível para consulta em Contratos.',
    },
  },
  REPROVADO: {
    definido: ['Análise concluída com parecer negativo'],
    falta: [],
    proximo: {
      CLIENTE: 'O motivo está no parecer abaixo. Você pode fazer um novo pedido quando quiser.',
      AGENTE: 'Pedido encerrado. Ele continua no histórico com o parecer registrado.',
    },
  },
  CANCELADO: {
    definido: ['Pedido cancelado pelo cliente durante a análise'],
    falta: [],
    proximo: {
      CLIENTE: 'Este pedido não pode ser reativado, mas continua no seu histórico.',
      AGENTE: 'Pedido encerrado pelo cliente. Nenhuma ação é necessária.',
    },
  },
}

export function jornadaDoPedido(status, perspectiva = 'CLIENTE') {
  const j = JORNADA[status] || JORNADA.EM_ANALISE
  return { ...j, proximo: j.proximo[perspectiva] || j.proximo.CLIENTE }
}

/** Código curto do pedido, igual em todas as telas. */
export const codigoPedido = (id) => `#${String(id).padStart(4, '0')}`

/** Pedido "em foco" no painel: primeiro um em andamento, senão o mais recente. */
export function pedidoEmFoco(pedidos = []) {
  return pedidos.find((p) => p.status === 'EM_ANALISE' || p.status === 'APROVADO') || pedidos[0]
}
