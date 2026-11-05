/** Sequências de quadros (extraídas dos vídeos do Google Flow com ffmpeg). */
export const SEQUENCIAS = {
  hero: { pasta: '/frames/hero', total: 158, estatica: '/img/hero-still.webp' },
  tech: { pasta: '/frames/tech', total: 111, estatica: '/frames/tech/111.webp' },
}

const cache = {}

const url = (seq, i) => `${seq.pasta}/${String(i + 1).padStart(3, '0')}.webp`

/**
 * Carrega uma sequência com prioridade: quadro 1, depois 1 a cada 4 (o scrub já fica utilizável), depois o resto.
 * onProgresso(0..1) informa o carregamento real. Resultado cacheado por sequência.
 */
export function carregarSequencia(nome, onProgresso) {
  if (cache[nome]) {
    cache[nome].ouvintes.add(onProgresso)
    onProgresso?.(cache[nome].progresso)
    return cache[nome]
  }
  const seq = SEQUENCIAS[nome]
  const imagens = new Array(seq.total).fill(null)
  const estado = { imagens, progresso: 0, ouvintes: new Set(onProgresso ? [onProgresso] : []) }
  cache[nome] = estado

  const ordem = [0]
  for (let i = 4; i < seq.total; i += 4) ordem.push(i)
  for (let i = 1; i < seq.total; i++) if (!ordem.includes(i)) ordem.push(i)

  let carregados = 0
  let proximo = 0
  const PARALELO = 6

  const avisar = () => {
    estado.progresso = carregados / seq.total
    estado.ouvintes.forEach((fn) => fn?.(estado.progresso))
  }

  const carregarProximo = () => {
    if (proximo >= ordem.length) return
    const indice = ordem[proximo++]
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => {
      imagens[indice] = img
      carregados++
      avisar()
      carregarProximo()
    }
    img.onerror = () => {
      carregados++
      avisar()
      carregarProximo()
    }
    img.src = url(seq, indice)
  }
  for (let k = 0; k < PARALELO; k++) carregarProximo()
  return estado
}

/** Quadro carregado mais próximo do índice pedido (enquanto o resto ainda chega). */
export function quadroMaisProximo(imagens, indice) {
  if (imagens[indice]) return imagens[indice]
  for (let d = 1; d < imagens.length; d++) {
    if (imagens[indice - d]) return imagens[indice - d]
    if (imagens[indice + d]) return imagens[indice + d]
  }
  return null
}

/** Desenha a imagem cobrindo o canvas (no retrato, encaixa pela largura com zoom para o carro não sumir). */
export function desenhar(canvas, img) {
  if (!canvas || !img) return
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const retrato = h > w
  const escala = retrato ? (w / img.width) * 1.55 : Math.max(w / img.width, h / img.height)
  const dw = img.width * escala
  const dh = img.height * escala
  const x = (w - dw) / 2
  const y = retrato ? h * 0.76 - dh / 2 : (h - dh) / 2
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(img, x, y, dw, dh)
}

/** Ajusta a resolução do canvas ao tamanho na tela (DPR limitado a 1.5 por performance). */
export function ajustarCanvas(canvas) {
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const r = canvas.getBoundingClientRect()
  canvas.width = Math.round(r.width * dpr)
  canvas.height = Math.round(r.height * dpr)
}
