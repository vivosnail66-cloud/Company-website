import config from '@/payload.config'

import { describe, expect, it } from 'vitest'

describe('Payload config', () => {
  it('registers the core CMS collections and globals', async () => {
    const payloadConfig = await config
    const collectionSlugs = payloadConfig.collections?.map((collection) => collection.slug) || []
    const globalSlugs = payloadConfig.globals?.map((global) => global.slug) || []

    expect(collectionSlugs).toEqual(
      expect.arrayContaining([
        'pages',
        'posts',
        'media',
        'categories',

        'api-tokens',
        'webhooks',
        'webhook-deliveries',
        'audit-logs',
        'users',
      ]),
    )
    expect(globalSlugs).toEqual(expect.arrayContaining(['site-settings', 'header', 'footer']))
  })
})
