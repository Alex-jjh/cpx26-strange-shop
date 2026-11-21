import { useState } from 'react'
import { displayImage, IMAGE_PIXELS, type ImageSize } from '../data/images'

// If the display copy is missing, fall back to the original, then to a labelled placeholder.

interface Props {
  src: string
  label: string
  size: ImageSize
  /** Above-the-fold images load immediately; everything else waits until scrolled near. */
  eager?: boolean
}

export function ProductImage({ src, label, size, eager = false }: Props) {
  const [stage, setStage] = useState<'display' | 'original' | 'failed'>('display')
  if (stage === 'failed') return <div className="img placeholder">{label}</div>
  return (
    <img
      className="img"
      src={stage === 'display' ? displayImage(src, size) : src}
      alt={label}
      width={IMAGE_PIXELS[size]}
      height={IMAGE_PIXELS[size]}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setStage((s) => (s === 'display' ? 'original' : 'failed'))}
    />
  )
}
