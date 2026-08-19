import type { Metadata } from 'next'

import type { Media, Page, Post } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { withLocalePrefix, type AppLocale } from './locale'
import { getResolvedSiteSettings } from '@/SiteSettings/getSiteSettings'
import { resolveMetaTitle, resolveOGImageURL } from '@/SiteSettings/seo'

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  locale?: AppLocale
}): Promise<Metadata> => {
  const { doc, locale } = args
  const siteSettings = await getResolvedSiteSettings(locale)

  const ogImage = resolveOGImageURL({
    image:
      doc?.meta?.image && typeof doc.meta.image === 'object'
        ? (doc.meta.image as Media)
        : undefined,
    settings: siteSettings,
  })

  const title = resolveMetaTitle({
    title: doc?.meta?.title,
    settings: siteSettings,
  })

  return {
    description: doc?.meta?.description || siteSettings.seo.defaultDescription,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || siteSettings.seo.defaultDescription,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? withLocalePrefix(doc?.slug.join('/'), locale) : withLocalePrefix('/', locale),
    }, siteSettings),
    title,
  }
}
