'use client'
import { useState, useRef, useCallback } from 'react'
import { markOpenedAction } from '@/app/actions/days'

type Props = { dayNumber: number; title: string; alreadyOpened: boolean; isPreview?: boolean }

type Recipe = {
  occasion: string
  occasionSub?: string
  emoji: string
  name: string
  serves: string
  time: string
  accentColor: string
  ingredients: string[]
  steps: string[]
  note?: string
}

const RECIPES: Recipe[] = [
  {
    occasion: "For When We're Moving In",
    occasionSub: 'To eat on the floor 🏠',
    emoji: '🍝',
    name: 'Spaghetti Aglio e Olio',
    serves: '2 personas',
    time: '20 min',
    accentColor: '#c0392b',
    ingredients: [
      '200 g de spaghetti',
      '5–6 dientes de ajo, en láminas finas',
      '4 cdas de aceite de oliva',
      'Hojuelas de chile al gusto',
      'Sal y pimienta',
      'Parmesano rallado',
      'Un puñito de perejil fresco',
    ],
    steps: [
      'Hierve el spaghetti en agua con sal hasta que esté al dente. Guarda ½ taza del agua de cocción.',
      'Mientras tanto, calienta el aceite a fuego medio-bajo. Agrega el ajo y cocina suavemente hasta que esté dorado (sin quemarlo).',
      'Añade las hojuelas de chile, luego la pasta escurrida directamente al sartén.',
      'Agrega un chorrito del agua de pasta y mezcla bien hasta que todo se integre y quede sedoso.',
      'Sirve en platos (o en el piso) con parmesano y perejil por encima.',
    ],
    note: 'Vino opcional pero muy recomendado. 🍷',
  },
  {
    occasion: 'For When Feeling Nostalgic',
    occasionSub: 'Una receta de la isla 🌴',
    emoji: '🍚',
    name: 'Arroz con Gandules',
    serves: '2 personas',
    time: '35 min',
    accentColor: '#27ae60',
    ingredients: [
      '1 taza de arroz blanco de grano largo',
      '1 lata de gandules verdes (escurridos)',
      '2 cdas de sofrito (del tarro está bien)',
      '1 sobre de Sazón con achiote',
      '1½ taza de caldo de pollo',
      '2 cdas de salsa de tomate',
      'Sal al gusto',
      'Un chorrito de aceite de oliva',
    ],
    steps: [
      'En una olla mediana, calienta el aceite a fuego medio. Agrega el sofrito y cocina 2 minutos hasta que suelte su aroma.',
      'Agrega la salsa de tomate y el sobre de Sazón. Mezcla bien.',
      'Añade el arroz y revuelve para cubrirlo con el sofrito.',
      'Agrega el caldo de pollo y los gandules. Prueba de sal.',
      'Sube el fuego hasta que hierva, luego bájalo al mínimo y tapa la olla.',
      'Cocina 20 minutos sin abrir. Destapa, esponja con un tenedor y sirve.',
    ],
    note: 'Para tener un sabor de tu casa que los dos extrañamos tanto.',
  },
  {
    occasion: 'For After Exams',
    occasionSub: 'Porque no los merecemos 🎓',
    emoji: '🥞',
    name: 'Crêpes Caseros',
    serves: '2 personas (8–10 crêpes)',
    time: '30 min',
    accentColor: '#8e44ad',
    ingredients: [
      '1 taza de harina',
      '2 huevos',
      '1¼ taza de leche',
      '2 cdas de mantequilla derretida',
      '1 cda de azúcar',
      'Una pizca de sal',
      '— Rellenos dulces: Nutella, fresas, plátano, azúcar + limón',
      '— Rellenos salados: queso, jamón, huevo',
    ],
    steps: [
      'Mezcla la harina, azúcar y sal. Agrega los huevos y la mitad de la leche; bate hasta que no haya grumos.',
      'Añade el resto de la leche y la mantequilla derretida. La mezcla debe quedar líquida y sin grumos. Deja reposar 10 min.',
      'Calienta un sartén antiadherente a fuego medio-alto. Agrega un poco de mantequilla.',
      'Vierte un cucharón pequeño de mezcla y gira el sartén rápido para que se extienda finita.',
      'Cocina 1–2 min hasta que los bordes se despeguen, voltea y cocina 30 segundos más.',
      'Repite con el resto. Rellena con lo que quieran y dobla en triángulos o en rollito.',
    ],
    note: 'Que no se prenda fuego la cocina.',
  },
  {
    occasion: "For When We're Tired of Going Out",
    occasionSub: 'Shrimp imported from Seaport',
    emoji: '🍤',
    name: 'Shrimp Scampi',
    serves: '2 personas',
    time: '20 min',
    accentColor: '#e67e22',
    ingredients: [
      '300 g de camarones pelados y limpios',
      '200 g de linguine o spaghetti',
      '4 dientes de ajo picados',
      '3 cdas de mantequilla',
      '2 cdas de aceite de oliva',
      '½ taza de vino blanco seco (o caldo de pollo)',
      'Jugo de 1 limón',
      'Hojuelas de chile al gusto',
      'Sal, pimienta y perejil fresco',
    ],
    steps: [
      'Hierve la pasta en agua con sal hasta que esté al dente. Guarda ½ taza del agua de cocción.',
      'Seca los camarones con papel. Sazónalos con sal, pimienta y chile.',
      'Calienta el aceite en un sartén a fuego alto. Cocina los camarones 1–2 min por lado hasta que estén rosados. Retira y reserva.',
      'En el mismo sartén, baja el fuego a medio. Derrite la mantequilla y agrega el ajo. Cocina 1 min sin que se queme.',
      'Añade el vino y el jugo de limón. Deja reducir 2 minutos.',
      'Regresa los camarones y la pasta al sartén. Mezcla bien, agrega un chorrito del agua de pasta si falta cremosidad.',
      'Sirve con perejil picado por encima.',
    ],
    note: 'Para quedarnos en casa y ver una peli.',
  },
  {
    occasion: "For When I'm Missing Home",
    occasionSub: 'Un pedacito de Argentina 🇦🇷',
    emoji: '🍗',
    name: 'Milanesa',
    serves: '2 personas',
    time: '30 min',
    accentColor: '#2980b9',
    ingredients: [
      '2 pechugas de pollo (o bifes de res finos)',
      '2 huevos',
      '1 taza de pan rallado',
      'Ajo en polvo, sal y pimienta',
      'Jugo de ½ limón',
      'Aceite para freír',
    ],
    steps: [
      'Si usas pechuga, córtala horizontalmente para que quede fina. Golpéala un poco con la mano o un rodillo.',
      'Bate los huevos con sal, pimienta y ajo en polvo en un plato hondo.',
      'Mezcla el pan rallado con una pizca de sal en otro plato.',
      'Pasa cada milanesa por el huevo, luego por el pan rallado, presionando bien para que se adhiera.',
      'Calienta bastante aceite en un sartén a fuego medio-alto. Fríe cada milanesa 3–4 min por lado hasta que esté dorada.',
      'Escurre en papel, exprime limón por encima y sirve con ensalada o papas.',
    ],
    note: 'Con amor, desde Buenos Aires.',
  },
]

// page 0 = title, pages 1–5 = recipes
const TOTAL_PAGES = RECIPES.length + 1

function TitlePage() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 28px',
      background: 'linear-gradient(160deg, #fffdf5 0%, #fdf3e3 100%)',
      textAlign: 'center',
      position: 'relative',
    }}>
      {/* Decorative border */}
      <div style={{
        position: 'absolute', inset: 14,
        border: '1.5px solid #d4b896',
        borderRadius: 8,
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', inset: 18,
        border: '0.5px solid #e8d4be',
        borderRadius: 6,
        pointerEvents: 'none',
      }}/>

      <div style={{ fontSize: 52, marginBottom: 24 }}>🍳</div>

      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: 11,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: '#b08060',
        margin: '0 0 14px',
      }}>Una colección de</p>

      <h1 style={{
        fontFamily: 'Georgia, serif',
        fontSize: 28,
        fontWeight: 700,
        color: '#2a1a0a',
        lineHeight: 1.25,
        margin: '0 0 8px',
      }}>Recetas Para</h1>
      <h1 style={{
        fontFamily: 'Georgia, serif',
        fontSize: 36,
        fontWeight: 700,
        color: '#c0392b',
        lineHeight: 1.1,
        margin: '0 0 32px',
      }}>Pierce</h1>

      <div style={{ width: 48, height: 1.5, background: '#d4b896', margin: '0 auto 28px' }}/>

      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: 13,
        fontStyle: 'italic',
        color: '#8a6a4a',
        margin: '0 0 6px',
      }}>para cocinar juntos</p>
      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: 13,
        fontStyle: 'italic',
        color: '#8a6a4a',
        margin: '0 0 36px',
      }}>en nuestro estudio ♥</p>

      <div style={{ width: 48, height: 1.5, background: '#d4b896', margin: '0 auto 28px' }}/>

      <p style={{
        fontFamily: 'Georgia, serif',
        fontSize: 12,
        color: '#b08060',
        margin: 0,
      }}>by Nico</p>

      <div style={{ marginTop: 40, display: 'flex', gap: 10, opacity: 0.45 }}>
        {['🍝','🍚','🥞','🍤','🍗'].map((e,i) => (
          <span key={i} style={{ fontSize: 16 }}>{e}</span>
        ))}
      </div>
    </div>
  )
}

function RecipePage({ recipe, pageNum }: { recipe: Recipe; pageNum: number }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Occasion banner */}
      <div style={{ background: recipe.accentColor, padding: '12px 20px 10px', flexShrink: 0 }}>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 2px', fontFamily: 'Georgia, serif' }}>
          {recipe.occasion}
        </p>
        {recipe.occasionSub && (
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>{recipe.occasionSub}</p>
        )}
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 16px', background: '#fffdf5' }}>
        {/* Recipe header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, paddingBottom: 12, borderBottom: '1px dashed #e0ceb4' }}>
          <span style={{ fontSize: 34 }}>{recipe.emoji}</span>
          <div>
            <h2 style={{ color: '#2a1a0a', fontSize: 17, fontWeight: 700, margin: '0 0 3px', fontFamily: 'Georgia, serif' }}>{recipe.name}</h2>
            <p style={{ color: '#9a8070', fontSize: 11, margin: 0 }}>👥 {recipe.serves} &nbsp;·&nbsp; ⏱ {recipe.time}</p>
          </div>
        </div>

        {/* Ingredients */}
        <p style={{ color: recipe.accentColor, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>Ingredientes</p>
        <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {recipe.ingredients.map((ing, i) => (
            <li key={i} style={{ display: 'flex', gap: 7, color: '#3a2a1a', fontSize: 12, lineHeight: 1.5, fontFamily: 'Georgia, serif' }}>
              <span style={{ color: recipe.accentColor, fontWeight: 700, flexShrink: 0 }}>·</span>{ing}
            </li>
          ))}
        </ul>

        {/* Steps */}
        <p style={{ color: recipe.accentColor, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, margin: '0 0 8px', fontFamily: 'Georgia, serif' }}>Preparación</p>
        <ol style={{ margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {recipe.steps.map((step, i) => (
            <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{
                flexShrink: 0, width: 19, height: 19, borderRadius: '50%',
                background: recipe.accentColor, color: 'white',
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 1,
              }}>{i + 1}</span>
              <span style={{ color: '#3a2a1a', fontSize: 12, lineHeight: 1.6, fontFamily: 'Georgia, serif' }}>{step}</span>
            </li>
          ))}
        </ol>

        {recipe.note && (
          <p style={{
            padding: '9px 12px',
            background: `${recipe.accentColor}12`,
            borderLeft: `3px solid ${recipe.accentColor}`,
            borderRadius: '0 6px 6px 0',
            color: '#5a3a2a',
            fontSize: 12,
            fontStyle: 'italic',
            lineHeight: 1.6,
            margin: 0,
            fontFamily: 'Georgia, serif',
          }}>
            {recipe.note}
          </p>
        )}
      </div>

      {/* Page number */}
      <div style={{ padding: '6px 0', textAlign: 'center', borderTop: '1px solid #e8d4be', background: '#fdf8f0', flexShrink: 0 }}>
        <span style={{ color: '#c0a888', fontSize: 10, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>— {pageNum} —</span>
      </div>
    </div>
  )
}

export function CookbookReveal({ dayNumber, title, alreadyOpened, isPreview }: Props) {
  const [opened,    setOpened]    = useState(alreadyOpened)
  const [opening,   setOpening]   = useState(false)
  const [page,      setPage]      = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [isExiting, setIsExiting] = useState(false)
  const markedRef = useRef(alreadyOpened)

  async function handleOpen() {
    setOpening(true)
    if (!markedRef.current && !isPreview) { await markOpenedAction(dayNumber); markedRef.current = true }
    setTimeout(() => setOpened(true), 500)
  }

  const goTo = useCallback((next: number) => {
    if (isExiting || next === page || next < 0 || next >= TOTAL_PAGES) return
    setDirection(next > page ? 'forward' : 'backward')
    setIsExiting(true)
    setTimeout(() => {
      setPage(next)
      setIsExiting(false)
    }, 300)
  }, [isExiting, page])

  // ── Sealed ───────────────────────────────────────────────────────────────────
  if (!opened) return (
    <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5ede0', padding: '0 24px' }}>
      <button
        onClick={handleOpen}
        disabled={opening}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          background: 'none', border: 'none', cursor: opening ? 'default' : 'pointer',
          transition: 'all 0.4s ease',
          transform: opening ? 'scale(1.12)' : 'scale(1)',
          opacity: opening ? 0 : 1,
        }}
      >
        <div style={{ fontSize: 80 }}>📖</div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#b08060', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 6px', fontWeight: 600 }}>Día {dayNumber}</p>
          <h1 style={{ color: '#3a2a1a', fontSize: 24, fontWeight: 800, margin: '0 0 10px' }}>{title}</h1>
          <p style={{ color: '#a09080', fontSize: 14, margin: 0 }}>Toca para abrir el libro</p>
        </div>
      </button>
    </div>
  )

  // ── Revealed ─────────────────────────────────────────────────────────────────
  const exitAnim   = direction === 'forward' ? 'page-exit-fwd'  : 'page-exit-bwd'
  const enterAnim  = direction === 'forward' ? 'page-enter-fwd' : 'page-enter-bwd'

  return (
    <div style={{ minHeight: '100svh', background: '#e8dcc8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '0 0 80px' }}>
      <style>{`
        @keyframes page-exit-fwd  { from { transform: perspective(900px) rotateY(0deg);   opacity: 1; } to { transform: perspective(900px) rotateY(-90deg); opacity: 0; } }
        @keyframes page-enter-fwd { from { transform: perspective(900px) rotateY(90deg);  opacity: 0; } to { transform: perspective(900px) rotateY(0deg);   opacity: 1; } }
        @keyframes page-exit-bwd  { from { transform: perspective(900px) rotateY(0deg);   opacity: 1; } to { transform: perspective(900px) rotateY(90deg);  opacity: 0; } }
        @keyframes page-enter-bwd { from { transform: perspective(900px) rotateY(-90deg); opacity: 0; } to { transform: perspective(900px) rotateY(0deg);   opacity: 1; } }
      `}</style>

      {/* Back link */}
      <div style={{ width: '100%', maxWidth: 480, padding: '14px 16px 0', display: 'flex', alignItems: 'center' }}>
        <a href="/home" style={{ color: '#8a6a4a', fontSize: 12, textDecoration: 'none', opacity: 0.8 }}>← Calendario</a>
      </div>

      {/* Book */}
      <div style={{ width: '100%', maxWidth: 480, margin: '12px 16px 0' }}>
        <div style={{
          display: 'flex',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '4px 4px 0 #c8b89a, 6px 6px 0 #bfaa8e, -2px 0 8px rgba(0,0,0,0.15), 4px 4px 24px rgba(0,0,0,0.25)',
          minHeight: 560,
          animation: `${isExiting ? exitAnim : enterAnim} 0.3s ease both`,
          transformOrigin: direction === 'forward' ? 'left center' : 'right center',
        }}>
          {/* Spine */}
          <div style={{
            width: 14, flexShrink: 0,
            background: 'linear-gradient(to right, #7a4a2a, #a06840, #8a5830)',
            boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.2)',
          }}/>

          {/* Page content — keyed so React remounts it on page change, restarting the enter animation */}
          <div key={page} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fffdf5' }}>
            {page === 0
              ? <TitlePage />
              : <RecipePage recipe={RECIPES[page - 1]} pageNum={page} />
            }
          </div>

          {/* Right page-stack effect */}
          <div style={{ width: 6, flexShrink: 0, background: 'linear-gradient(to right, #f0e8d8, #e8dcc8, #ddd0bc)' }}/>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(232,220,200,0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #d4c0a0',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 50,
      }}>
        <button
          onClick={() => goTo(page - 1)}
          disabled={page === 0}
          style={{
            background: 'none', border: 'none',
            cursor: page === 0 ? 'default' : 'pointer',
            color: page === 0 ? '#c8b899' : '#5a3a1a',
            fontSize: 20, padding: '4px 14px',
            fontFamily: 'Georgia, serif',
          }}
        >‹ Anterior</button>

        <span style={{ color: '#8a6a4a', fontSize: 11, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          {page === 0 ? 'Portada' : `Receta ${page}`}
        </span>

        <button
          onClick={() => goTo(page + 1)}
          disabled={page === TOTAL_PAGES - 1}
          style={{
            background: 'none', border: 'none',
            cursor: page === TOTAL_PAGES - 1 ? 'default' : 'pointer',
            color: page === TOTAL_PAGES - 1 ? '#c8b899' : '#5a3a1a',
            fontSize: 20, padding: '4px 14px',
            fontFamily: 'Georgia, serif',
          }}
        >Siguiente ›</button>
      </div>
    </div>
  )
}
