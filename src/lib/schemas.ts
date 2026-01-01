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

export const kitBrandEnum = z.enum([
  'Bandai',
  'SNAA',
  'Motor Nuclear',
  'In Era+',
  'Hemoxian',
  'CangDao',
  'AniMester',
  'Other',
])

export const kitProductLineEnum = z.enum([
  'Gunpla',
  'Kamen Rider',
  'Other Tokusatsu',
])

export const createGunplaSchema = z
  .object({
    brand: kitBrandEnum.default('Bandai'),
    grade: gunplaGradeEnum.optional(),
    subline: gunplaSublineEnum.nullable().optional(),
    product_line: kitProductLineEnum.default('Gunpla'),
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
  .superRefine((val, ctx) => {
    // Grade is required for Gunpla, but optional for Kamen Rider/Other Tokusatsu
    if (val.brand === 'Bandai' && val.product_line === 'Gunpla' && !val.grade) {
      ctx.addIssue({
        code: 'custom',
        message: 'Grade is required for Gunpla kits',
        path: ['grade'],
      })
    }
  })

export type CreateGunplaInput = z.infer<typeof createGunplaSchema>
