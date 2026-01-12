import { z } from 'zod'

// ===========================
// Todo Data Validation
// ===========================

/**
 * Schema for validating TodoData before storing to IndexedDB
 * Ensures all required fields are present and valid
 */
export const TodoDataSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
  date: z.string().min(1, 'Date is required'),
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(50000, 'Content too long'),
  createdAt: z.string().min(1, 'CreatedAt is required')
})

export type ValidatedTodoData = z.infer<typeof TodoDataSchema>

// ===========================
// Special Event Validation (XSS Prevention)
// ===========================

/**
 * Schema for validating special event input
 * Prevents XSS attacks by blocking dangerous patterns
 */
export const SpecialEventSchema = z.string()
  .max(200, '특별 일정은 200자를 초과할 수 없습니다')
  .transform(str => str.trim())
  .refine(
    str => !/<script|javascript:|on\w+=/i.test(str),
    '유효하지 않은 문자가 포함되어 있습니다'
  )
  .refine(
    str => !/<iframe|<object|<embed/i.test(str),
    '유효하지 않은 문자가 포함되어 있습니다'
  )

// ===========================
// Migration Data Validation
// ===========================

/**
 * Schema for validating data during localStorage migration
 * More lenient than TodoDataSchema to handle legacy data
 */
export const MigrationDataSchema = z.object({
  id: z.string().optional(),
  date: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  createdAt: z.string().optional()
}).passthrough() // Allow extra fields that might exist in old data

export type MigrationData = z.infer<typeof MigrationDataSchema>

// ===========================
// Content Data Validation
// ===========================

/**
 * Schema for validating motivation content from API
 */
export const ContentDataSchema = z.object({
  version: z.string(),
  updatedAt: z.string(),
  locale: z.string(),
  motivationMessages: z.array(z.string()),
  antiBrainFogTips: z.array(z.string()),
  practicalTips: z.array(z.object({
    category: z.string(),
    tips: z.array(z.string())
  })),
  daySpecificMessages: z.record(z.string(), z.string())
})

export type ValidatedContentData = z.infer<typeof ContentDataSchema>

// ===========================
// Validation Helper Functions
// ===========================

/**
 * Safely validate TodoData and return errors
 */
export function validateTodoData(data: unknown): {
  success: true
  data: ValidatedTodoData
} | {
  success: false
  errors: string[]
} {
  const result = TodoDataSchema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors = result.error.issues.map(err =>
    `${err.path.join('.')}: ${err.message}`
  )

  return { success: false, errors }
}

/**
 * Safely validate special event input
 */
export function validateSpecialEvent(input: string): {
  success: true
  data: string
} | {
  success: false
  error: string
} {
  const result = SpecialEventSchema.safeParse(input)

  if (result.success) {
    return { success: true, data: result.data }
  }

  return {
    success: false,
    error: result.error.issues[0]?.message || '유효하지 않은 입력입니다'
  }
}

/**
 * Validate migration data and fill in defaults
 */
export function validateMigrationData(data: unknown): MigrationData | null {
  const result = MigrationDataSchema.safeParse(data)

  if (!result.success) {
    console.error('Migration data validation failed:', result.error)
    return null
  }

  return result.data
}

/**
 * Validate content data from API
 */
export function validateContentData(data: unknown): ValidatedContentData | null {
  const result = ContentDataSchema.safeParse(data)

  if (!result.success) {
    console.error('Content data validation failed:', result.error)
    return null
  }

  return result.data
}
