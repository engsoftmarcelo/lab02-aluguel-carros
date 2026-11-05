/**
 * Manifesto de fotos da frota (somente front-end; a API não guarda mídia).
 * Cada foto é ILUSTRATIVA do modelo: não mostra a unidade, a cor nem o estado do carro alugado.
 * Origem: Wikimedia Commons, licenças Creative Commons, com autor e página registrados abaixo
 * (créditos exibidos no rodapé da landing e no README). Tratamento: redimensionadas para WebP
 * (720 e 1400 px) com leve ajuste de contraste/saturação.
 */
export const FOTOS_FROTA = [
  {
    chave: 'byd-dolphin',
    marca: /byd/i,
    modelo: /dolphin/i,
    posicao: '45% 62%',
    credito: {
      autor: 'Mateusmatsuda',
      licenca: 'CC BY 4.0',
      licencaUrl: 'https://creativecommons.org/licenses/by/4.0/',
      pagina: 'https://commons.wikimedia.org/wiki/File:BYD_DOLPHIN_EV_FRONT.jpg',
    },
  },
  {
    chave: 'toyota-corolla-cross',
    marca: /toyota/i,
    modelo: /corolla\s*cross/i,
    posicao: '50% 66%',
    credito: {
      autor: 'Alexander-93',
      licenca: 'CC BY-SA 4.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      pagina: 'https://commons.wikimedia.org/wiki/File:Toyota_Corolla_Cross_Hybrid_1X7A1861.jpg',
    },
  },
  {
    chave: 'jeep-compass',
    marca: /jeep/i,
    modelo: /compass/i,
    posicao: '55% 56%',
    credito: {
      autor: 'Alexander Migl',
      licenca: 'CC BY-SA 4.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      pagina: 'https://commons.wikimedia.org/wiki/File:Jeep_Compass_(MP)_PHEV_Facelift_1X7A0140.jpg',
    },
  },
  {
    chave: 'volkswagen-nivus',
    marca: /volks|vw/i,
    modelo: /nivus/i,
    posicao: '40% 62%',
    credito: {
      autor: 'Mateusmatsuda',
      licenca: 'CC BY-SA 4.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      pagina: 'https://commons.wikimedia.org/wiki/File:Volkswagen_Nivus_Brazil_front.jpg',
    },
  },
  {
    chave: 'honda-civic',
    marca: /honda/i,
    modelo: /civic/i,
    posicao: '55% 62%',
    credito: {
      autor: 'Chanokchon',
      licenca: 'CC BY-SA 4.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      pagina: 'https://commons.wikimedia.org/wiki/File:2024_Honda_Civic_e-HEV_EL%2B.jpg',
    },
  },
  {
    chave: 'fiat-pulse',
    marca: /fiat/i,
    modelo: /pulse/i,
    posicao: '52% 62%',
    credito: {
      autor: 'Just a Man',
      licenca: 'CC BY 4.0',
      licencaUrl: 'https://creativecommons.org/licenses/by/4.0/',
      pagina: 'https://commons.wikimedia.org/wiki/File:2024_Fiat_Pulse_1.0_Turbo_200_Audace_(front).jpg',
    },
  },
]

/** Foto ilustrativa do modelo (por marca + modelo) ou null — carros cadastrados depois caem no traço. */
export function fotoDoCarro(carro) {
  if (!carro) return null
  const f = FOTOS_FROTA.find((x) => x.marca.test(carro.marca || '') && x.modelo.test(carro.modelo || ''))
  if (!f) return null
  return {
    ...f,
    src: `/frota/${f.chave}-720.webp`,
    srcSet: `/frota/${f.chave}-720.webp 720w, /frota/${f.chave}-1400.webp 1400w`,
  }
}
