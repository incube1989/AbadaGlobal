import type { Corda } from '../api/types'

/** Portuguese display name of each corda (never translated). */
export const CORDA_LABELS: Record<Corda, string> = {
  crua: 'Crua',
  'crua-amarela': 'Crua-Amarela',
  amarela: 'Amarela',
  'amarela-laranja': 'Amarela-Laranja',
  laranja: 'Laranja',
  'laranja-azul': 'Laranja-Azul',
  azul: 'Azul',
  'azul-verde': 'Azul-Verde',
  verde: 'Verde',
  'verde-roxa': 'Verde-Roxa',
  roxa: 'Roxa',
  'roxa-marrom': 'Roxa-Marrom',
  marrom: 'Marrom',
  'marrom-vermelha': 'Marrom-Vermelha',
  'vermelha-branco': 'Vermelha-Branco',
  branco: 'Branco',
}

/**
 * The two belt colors of each corda (hex). Used to draw the corda badge —
 * the "emoji" of the corda shown before titles/names.
 */
export const CORDA_COLORS: Record<Corda, [string, string]> = {
  crua: ['#CFCFCF', '#B0B0B0'], // both light grey
  'crua-amarela': ['#CFCFCF', '#FDD835'], // light grey + yellow
  amarela: ['#FDD835', '#F9A825'], // both yellow
  'amarela-laranja': ['#F9A825', '#FB8C00'], // yellow + orange
  laranja: ['#FB8C00', '#EF6C00'], // both orange
  'laranja-azul': ['#EF6C00', '#1E88E5'], // orange + blue
  azul: ['#1E88E5', '#1565C0'], // both blue
  'azul-verde': ['#1565C0', '#43A047'], // blue + green
  verde: ['#43A047', '#2E7D32'], // both green
  'verde-roxa': ['#2E7D32', '#8E24AA'], // green + purple
  roxa: ['#8E24AA', '#6A1B9A'], // both purple
  'roxa-marrom': ['#6A1B9A', '#6D4C41'], // purple + brown
  marrom: ['#795548', '#5D4037'], // both brown
  'marrom-vermelha': ['#5D4037', '#E53935'], // brown + red
  'vermelha-branco': ['#E53935', '#FFFFFF'], // red + white
  branco: ['#FFFFFF', '#FFFFFF'], // both white
}