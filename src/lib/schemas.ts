import { z } from 'zod'

export const gunplaGradeEnum = z.enum([
  'HG',
  'RG',
  'MG',
  'PG',
  'EG',
  'SD',
  'BB',
  'RE/100',
  'FM',
  'NG',
])

export const gunplaSublineEnum = z.enum([
  'HGUC',
  'HGIBO',
  'HGCE',
  'HG00',
  'HGAC',
  'HGAGE',
  'HGBF',
  'HGGTO',
  'HGBC',
])

export const createGunplaSchema = z.object({
  grade: gunplaGradeEnum,
  subline: gunplaSublineEnum.nullable().optional(),
  model_number: z.string().min(1, 'Model number is required').max(50),
  model_name: z.string().min(1, 'Model name is required').max(255),
  series: z.string().max(100).optional().default(''),
  release_year: z.string().optional().default(''),
  owned: z.boolean(),
  exclusive: z.boolean().optional().default(false),
  purchase_date: z.string().optional().default(''),
  purchase_price: z.string().optional().default(''),
  notes: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
})

export type CreateGunplaInput = z.infer<typeof createGunplaSchema>
