import { useState } from 'react'

/** Shows the product image, or a labelled placeholder until real images are added to /public/products. */
export function ProductImage({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <div className="img placeholder">{label}</div>
  return <img className="img" src={src} alt={label} loading="lazy" decoding="async" onError={() => setFailed(true)} />
}
