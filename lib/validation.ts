import { z } from 'zod'

// ===========================
// Todo Data Validation
// ===========================

/**
 * Schema for validating TodoData before storing to IndexedDB.
 * The real guard: lib/db.ts saveTodo/bulkSaveTodos call TodoDataSchema.parse()
 * on every write, so corrupt todos never reach storage.
 */
export const TodoDataSchema = z.object({
  id: z.string().uuid('Invalid UUID format'),
  date: z.string().min(1, 'Date is required'),
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(50000, 'Content too long'),
  createdAt: z.string().min(1, 'CreatedAt is required'),
  createdAtMs: z.number().optional()
})

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

// ===========================
// Content Data Validation
// ===========================

/**
 * Contract for the bundled motivation content (public/content/{locale}.json).
 * Not a runtime guard — content is a trusted build-time asset with no user/import
 * path. Instead lib/__tests__/content-schema.test.ts parses the bundled files
 * against this schema, so drift (a renamed/removed field) fails CI, not the app.
 * cheers is ko-only; therapyMessages exists in every locale.
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
  daySpecificMessages: z.record(z.string(), z.string()),
  // ponytail: shape-only check, not the deep TherapyCategory tree. Model it fully if a locale ships a malformed therapyMessages tree.
  therapyMessages: z.record(z.string(), z.unknown()).optional(),
  cheers: z.array(z.string()).optional()
})
