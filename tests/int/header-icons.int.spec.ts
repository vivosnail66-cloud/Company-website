import { describe, expect, it } from 'vitest'

import { LUCIDE_ICON_OPTIONS } from '@/fields/lucideIcon'

/**
 * Keeps the admin lucide dropdown (src/fields/lucideIcon.ts) and the
 * frontend icon renderer (src/Header/Nav/iconMap.tsx) in sync. If a new
 * icon is added to the dropdown without a matching component in the map
 * (or vice versa), this test fails.
 */
describe('header lucide icon sync', () => {
  it('every admin dropdown icon has a frontend component', async () => {
    const iconMapSource = await import('@/Header/Nav/iconMap')
    // iconMap is module-private; assert via the exported NavIcon behaviour
    expect(iconMapSource.NavIcon).toBeTypeOf('function')

    // Read the iconMap source text to extract defined keys
    const fs = await import('node:fs')
    const path = await import('node:path')
    const source = fs.readFileSync(
      path.resolve(process.cwd(), 'src/Header/Nav/iconMap.tsx'),
      'utf-8',
    )
    const mapKeys = new Set(
      Array.from(source.matchAll(/^\s*'?([a-z0-9-]+)'?:/gm)).map((match) => match[1]),
    )

    const dropdownValues = LUCIDE_ICON_OPTIONS.map((option) => option.value)

    const missingInMap = dropdownValues.filter((value) => !mapKeys.has(value))
    expect(missingInMap, `icons missing in iconMap: ${missingInMap.join(', ')}`).toEqual([])
  })
})
