import { useCallback, useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Carregamento from './landing/Carregamento'
import Hero from './landing/Hero'
import Tecnologia from './landing/Tecnologia'
import { ComoFunciona, CtaFinal, Frota, Numeros, Parceiros, Rodape, useFrota } from './landing/Secoes'
import { Cursor, ProgressoScroll, useLenis } from './landing/efeitos'
import '../styles/landing.css'

/** Landing cinematográfica TRAÇO. */
export default function Landing() {
  const [pronto, setPronto] = useState(false)
  const aoCarregar = useCallback(() => setPronto(true), [])
  const frota = useFrota()
  useLenis()

  return (
    <div className="landing">
      <Carregamento onPronto={aoCarregar} />
      <ProgressoScroll />
      <Cursor />
      <Navbar />
      <main>
        <Hero pronto={pronto} />
        <ComoFunciona />
        <Tecnologia />
        <Numeros frota={frota.length} />
        <Frota frota={frota} />
        <Parceiros />
        <CtaFinal />
      </main>
      <Rodape />
    </div>
  )
}
