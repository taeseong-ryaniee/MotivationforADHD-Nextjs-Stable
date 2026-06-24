import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ContentDataSchema } from '../validation'

// Boundary guard at build time, not runtime: the bundled content files are a
// trusted asset, so we don't .parse() them in the app. Instead we assert here
// that every locale still matches ContentDataSchema. A dev editing ko/en.json
// into a bad shape — or the schema drifting behind the content — fails this
// test instead of white-screening the running app.
describe('ContentDataSchema vs bundled content', () => {
  for (const locale of ['ko', 'en']) {
    it(`${locale}.json matches the schema`, () => {
      const raw = readFileSync(
        join(process.cwd(), 'public', 'content', `${locale}.json`),
        'utf-8'
      )
      const result = ContentDataSchema.safeParse(JSON.parse(raw))
      // Surface which field drifted instead of a bare "false".
      if (!result.success) {
        throw new Error(
          `${locale}.json failed ContentDataSchema:\n` +
            JSON.stringify(result.error.issues, null, 2)
        )
      }
      expect(result.success).toBe(true)
    })
  }
})
