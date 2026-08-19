import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { toPayloadLocale, type AppLocale } from './locale'

type Global = keyof Config['globals'] | 'site-settings'

async function getGlobal<T extends Global>(
  slug: T,
  depth = 0,
  locale?: AppLocale,
): Promise<T extends keyof Config['globals'] ? DataFromGlobalSlug<T> : unknown> {
  const payload = await getPayload({ config: configPromise })

  const global = await payload.findGlobal({
    slug: slug as keyof Config['globals'],
    depth,
    locale: toPayloadLocale(locale),
  })

  return global as T extends keyof Config['globals'] ? DataFromGlobalSlug<T> : unknown
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedGlobal = <T extends Global>(slug: T, depth = 0, locale?: AppLocale) =>
  unstable_cache(async () => getGlobal<T>(slug, depth, locale), [slug, locale || 'en'], {
    tags: [`global_${slug}`],
  })
