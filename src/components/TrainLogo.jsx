import iryoLogo from '../assets/logos/iryo.webp'
import renfeLogo from '../assets/logos/renfe.webp'

const OPERATORS = {
  renfe: { label: 'Renfe', src: renfeLogo },
  iryo: { label: 'Iryo', src: iryoLogo },
}

function detectOperator(trainType) {
  if (!trainType) return null
  const normalized = trainType.trim().toLowerCase()
  if (normalized.startsWith('ave')) return OPERATORS.renfe
  if (normalized.startsWith('iryo')) return OPERATORS.iryo
  return null
}

// Ancho fijo (no depende de la longitud del nombre del tren) para que el
// logo quede alineado entre tarjetas distintas.
export default function TrainLogo({ trainType, className = '' }) {
  const operator = detectOperator(trainType)
  if (!operator) return null

  return (
    <img
      src={operator.src}
      alt={operator.label}
      className={`inline-block h-4 w-14 shrink-0 object-contain ${className}`}
    />
  )
}
