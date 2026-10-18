import { describe, expect, it, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { useI18n } from '../i18n/I18nContext'
import { renderWithProviders } from './testUtils'

function Probe() {
  const { t, setLang } = useI18n()
  return (
    <div>
      <p data-testid="label">{t('nav.calendar')}</p>
      <button onClick={() => setLang('en')}>to-en</button>
      <button onClick={() => setLang('pt')}>to-pt</button>
    </div>
  )
}

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults to Russian and switches languages', () => {
    renderWithProviders(<Probe />)

    expect(screen.getByTestId('label')).toHaveTextContent('Календарь')

    fireEvent.click(screen.getByText('to-en'))
    expect(screen.getByTestId('label')).toHaveTextContent('Calendar')

    fireEvent.click(screen.getByText('to-pt'))
    expect(screen.getByTestId('label')).toHaveTextContent('Calendário')
  })

  it('persists the selected language', () => {
    renderWithProviders(<Probe />)
    fireEvent.click(screen.getByText('to-en'))
    expect(localStorage.getItem('abadaglobal.lang')).toBe('en')
  })
})