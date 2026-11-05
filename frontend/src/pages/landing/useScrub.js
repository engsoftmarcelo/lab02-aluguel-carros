import { useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MQ_ANIMAR } from './efeitos'
import { ajustarCanvas, carregarSequencia, desenhar, quadroMaisProximo, SEQUENCIAS } from './quadros'

/**
 * Prende (pin) a seção e liga o quadro do canvas ao progresso do scroll (1:1; a suavização vem do Lenis).
 * montarTimeline(tl) adiciona as legendas/sobreposições na mesma linha do tempo.
 * Com movimento reduzido nada disso roda: a seção mostra a imagem estática.
 */
export default function useScrub({ nome, secaoRef, canvasRef, duracao = '+=300%', montarTimeline }) {
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add(MQ_ANIMAR, () => {
      const canvas = canvasRef.current
      const total = SEQUENCIAS[nome].total
      const estado = { quadro: 0, desenhado: -1 }
      const seq = carregarSequencia(nome)

      const pintar = () => {
        const img = quadroMaisProximo(seq.imagens, estado.quadro)
        if (img) {
          desenhar(canvas, img)
          estado.desenhado = estado.quadro
        }
      }
      const redimensionar = () => {
        ajustarCanvas(canvas)
        pintar()
      }
      redimensionar()
      // repinta quando quadros novos chegam (o primeiro aparece assim que carregar)
      const ouvinte = () => {
        if (estado.desenhado !== estado.quadro) pintar()
      }
      seq.ouvintes.add(ouvinte)
      window.addEventListener('resize', redimensionar)

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: secaoRef.current,
          start: 'top top',
          end: duracao,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const q = Math.min(total - 1, Math.round(self.progress * (total - 1)))
            if (q !== estado.quadro) {
              estado.quadro = q
              requestAnimationFrame(pintar)
            }
          },
        },
      })
      tl.to({}, { duration: 1 }) // garante duração 1 = progresso total
      montarTimeline?.(tl, secaoRef.current)

      return () => {
        seq.ouvintes.delete(ouvinte)
        window.removeEventListener('resize', redimensionar)
      }
    })
    const t = setTimeout(() => ScrollTrigger.refresh(), 300)
    return () => {
      clearTimeout(t)
      mm.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
