import type { Corda } from '../api/types'
import { CORDA_COLORS, CORDA_LABELS } from '../utils/corda'

interface CordaBadgeProps {
  corda: Corda | null | undefined
  /** Renders only the two color stripes (small); default is a chip with label. */
  label?: boolean
}

/**
 * The drawn "emoji" of a corda: two small stripes with the belt colors.
 * The title attribute carries the Portuguese belt name. Titles and belt names
 * are never localized.
 */
export default function CordaBadge({ corda, label = true }: CordaBadgeProps) {
  if (!corda) return null
  const [c1, c2] = CORDA_COLORS[corda]
  return (
    <span
      className="corda-badge"
      title={CORDA_LABELS[corda]}
      aria-label={CORDA_LABELS[corda]}
    >
      <span className="corda-badge-stripe" style={{ backgroundColor: c1 }} />
      <span
        className="corda-badge-stripe"
        style={{ backgroundColor: c2, borderLeft: '1px solid rgba(0,0,0,0.18)' }}
      />
      {label && <span className="corda-badge-label">{CORDA_LABELS[corda]}</span>}
    </span>
  )
}