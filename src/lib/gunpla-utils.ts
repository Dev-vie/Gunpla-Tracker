import { Database } from '@/types/database.types'

export type GunplaKit = Database['public']['Tables']['gunpla_kits']['Row']
export type GunplaGrade = Database['public']['Enums']['gunpla_grade']
export type KitProductLine = Database['public']['Enums']['kit_product_line']

/**
 * Get the display prefix for a kit based on product line and grade
 * Examples:
 *   - Gunpla HG UC: "HGUC"
 *   - Gunpla MG: "MG"
 *   - Kamen Rider FRS: "FRS" (Figure-rise Standard)
 *   - Kamen Rider with grade: "MG" (if grade is set)
 *   - Other non-Bandai: "SNAA", "Motor Nuclear", etc.
 */
function getDisplayPrefix(
  brand: string,
  productLine: KitProductLine | null | undefined,
  grade: GunplaGrade | null | undefined,
  subline: string | null | undefined
): string {
  // Non-Bandai brands display their brand name
  if (brand !== 'Bandai') {
    return brand
  }

  // Bandai kits
  const line = productLine || 'Gunpla'

  if (line === 'Kamen Rider') {
    // For Kamen Rider, prefer "FRS" (Figure-rise Standard) if no grade specified
    if (!grade) {
      return 'FRS'
    }
    // If grade is specified, use it (e.g., "MG Kamen Rider")
    return grade
  }

  if (line === 'Other Tokusatsu') {
    // For other tokusatsu, use grade if available, otherwise generic label
    return grade || 'Tokusatsu'
  }

  // Default Gunpla display logic
  if (subline) {
    return subline
  }

  return grade || 'Gunpla'
}

/**
 * Display a kit in proper format with product line awareness
 * Examples:
 *   - "HGUC 191 RX-78-2 Gundam Revive"
 *   - "FRS Kamen Rider Build RabbitTank"
 *   - "MG Kamen Rider Zero-One"
 *   - "Tokusatsu Ultraman Tiga"
 */
export function formatGunplaDisplay(kit: GunplaKit): string {
  const prefix = getDisplayPrefix(
    kit.brand,
    kit.product_line,
    kit.grade,
    kit.subline
  )

  const parts = [prefix, kit.model_number, kit.model_name].filter(Boolean)
  return parts.join(' ')
}

/**
 * Get the badge label for product line
 * Used in UI to show what type of kit it is
 */
export function getProductLineBadgeLabel(productLine: string | null | undefined): string {
  const line = (productLine as KitProductLine | null | undefined) || 'Gunpla'
  
  switch (line) {
    case 'Gunpla':
      return 'Gundam'
    case 'Kamen Rider':
      return 'Kamen Rider'
    case 'Other Tokusatsu':
      return 'Tokusatsu'
    default:
      return 'Model Kit'
  }
}

/**
 * Get the badge color for product line
 * Used in UI styling
 */
export function getProductLineBadgeColor(productLine: string | null | undefined): {
  bg: string
  text: string
} {
  const line = (productLine as KitProductLine | null | undefined) || 'Gunpla'

  switch (line) {
    case 'Gunpla':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800 dark:text-blue-200 dark:bg-blue-900',
      }
    case 'Kamen Rider':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800 dark:text-purple-200 dark:bg-purple-900',
      }
    case 'Other Tokusatsu':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800 dark:text-amber-200 dark:bg-amber-900',
      }
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800 dark:text-gray-200 dark:bg-gray-900',
      }
  }
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
