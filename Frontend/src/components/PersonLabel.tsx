import type { Corda, CordaTitle } from '../api/types'
import CordaBadge from './CordaBadge'

interface PersonLabelProps {
  /** Person, guest, or owner-candidate — anything with corda/title/name. */
  person: {
    corda?: Corda | null
    title?: CordaTitle | null
    nickname: string
  }
  /** Show only the nickname, without badge/title (compact chips). */
  compact?: boolean
}

/**
 * The canonical way to render a person's name: corda badge ("emoji") +
 * Portuguese title + nickname. Titles stay in Portuguese and are shown before
 * the name everywhere ("instructor ABC").
 */
export default function PersonLabel({ person, compact = false }: PersonLabelProps) {
  if (compact) {
    return <span className="person-label">{person.nickname}</span>
  }
  return (
    <span className="person-label">
      <CordaBadge corda={person.corda} label={false} />
      {person.title && <span className="person-title">{person.title}</span>}
      <span className="person-nickname">{person.nickname}</span>
    </span>
  )
}