import QRCode from 'qrcode'
import { useEffect, useState } from 'react'

export default function QrCode({ value, size = 220, className = '', alt = '' }) {
  // Guardamos junto al valor para el que se generó: así, mientras cambia
  // `value`/`size`, mostramos el estado de carga en vez de un QR desfasado.
  const [generated, setGenerated] = useState({ value: null, dataUrl: null })

  useEffect(() => {
    let active = true
    QRCode.toDataURL(value, { width: size, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
      .then((url) => {
        if (active) setGenerated({ value, dataUrl: url })
      })
      .catch(() => {
        if (active) setGenerated({ value, dataUrl: null })
      })
    return () => {
      active = false
    }
  }, [value, size])

  const dataUrl = generated.value === value ? generated.dataUrl : null

  if (!dataUrl) {
    return (
      <div
        className={`animate-pulse rounded-lg bg-slate-100 ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <img
      src={dataUrl}
      alt={alt}
      width={size}
      height={size}
      className={className}
    />
  )
}
