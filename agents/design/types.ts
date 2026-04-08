export type PostType =
  | 'hook'
  | 'educativo'
  | 'cta'
  | 'before_after'
  | 'stats'
  | 'carousel_slide'
  | 'story'
  | 'reel_script'

export type Duracion = '15s' | '30s' | '60s'

export interface ColorDecision {
  color: string
  hex: string
  uso: string
  porQue: string
}

export interface DesignBrief {
  generatedAt: Date
  postType: PostType
  objetivo: string
  rubro?: string
  concepto: string
  jerarquiaVisual: {
    primario: string
    secundario: string
    terciario?: string
  }
  copyPrincipal: string
  copySecundario: string
  colores: ColorDecision[]
  composicion: {
    estilo: string
    layout: string
    elementosVisuales: string[]
    porQue: string
  }
  razonamiento: {
    porQueElConcepto: string
    porQueLaJerarquia: string
    porQueLaComposicion: string
  }
}

export interface WeeklyFeedPost {
  dia: string
  objetivoEstrategico: string
  copy: string
  briefVisual: string
  mejorHorario: string
  hashtags: string[]
  postType: PostType
}

export interface WeeklyStory {
  dia: string
  objetivoEstrategico: string
  copy: string
  briefVisual: string
  mejorHorario: string
}

export interface ReelIdea {
  tipo: 'filmado' | 'animado'
  tema: string
  objetivoEstrategico: string
  duracion: Duracion
  briefVisual: string
}

export interface WeeklyPlan {
  generatedAt: Date
  semana: number
  focusRubro?: string
  feedPosts: WeeklyFeedPost[]
  stories: WeeklyStory[]
  reels: ReelIdea[]
  notasEstrategicas: string
}

export interface VideoScript {
  tema: string
  duracion: Duracion
  ganchoApertura: string
  puntosClave: string[]
  ctaFinal: string
  notasProduccion: {
    quesMostrarEnPantalla: string
    queFondoUsar: string
    tonoDeVoz: string
    vestuario?: string
    extras?: string
  }
}

export interface CarouselSlide {
  numero: number
  posicionNarrativa: 'intro' | 'desarrollo' | 'climax' | 'cta'
  titulo: string
  cuerpo: string
  elementoVisual: string
}

export interface DesignCritique {
  descripcion: string
  jerarquia: {
    puntaje: number
    observaciones: string
    mejoras: string[]
  }
  legibilidad: {
    puntaje: number
    observaciones: string
    mejoras: string[]
  }
  coherenciaMarca: {
    puntaje: number
    observaciones: string
    mejoras: string[]
  }
  puntajeGlobal: number
  veredicto: string
  proximosPasos: string[]
}
