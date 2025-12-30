import { Database } from '@/types/database.types'

export type GunplaKit = Database['public']['Tables']['gunpla_kits']['Row']
export type GunplaGrade = Database['public']['Enums']['gunpla_grade']

/**
 * Display a Gunpla kit in the proper format: [GRADE] [MODEL_NUMBER] [MODEL_NAME]
 * Example: "HGUC 191 RX-78-2 Gundam Revive"
 */
export function formatGunplaDisplay(kit: GunplaKit): string {
  const parts = [kit.grade, kit.model_number, kit.model_name]
  return parts.join(' ')
}

/**
 * Get series abbreviation for display (optional, shown smaller)
 * For "Iron-Blooded Orphans" → "IBO"
 * For "Universal Century" → "UC"
 */
export function getSeriesAbbreviation(series: string | null | undefined): string | null {
  if (!series) return null

  const abbreviations: Record<string, string> = {
    'Iron-Blooded Orphans': 'IBO',
    'Universal Century': 'UC',
    'Cosmic Era': 'CE',
    'Gundam 00': '00',
    'Wing': 'Wing',
    'SEED': 'SEED',
    'SEED Destiny': 'SEED D',
    'Age': 'AGE',
    'Reconguista in G': 'RG',
    'Build Fighters': 'BF',
    'Build Fighters Try': 'BFT',
    'Build Divers': 'BD',
  }

  return abbreviations[series] || null
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (!value) return '-'
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `$${num.toLocaleString()}`
}
