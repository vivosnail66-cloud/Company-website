import type { Metadata } from 'next'

import { getServerSideURL } from '@/utilities/getURL'

import type { ResolvedSiteSettings } from './getSiteSettings'

export const resolveMetaTitle = ({
  title,
  settings,
}: {
  title?: string | null
  settings: ResolvedSiteSettings
}) => {
  const defaultTitle = settings.seo.defaultTitle || settings.brand.siteName
  const suffix = settings.seo.titleSuffix || settings.brand.siteName

  if (!title) return defaultTitle
  if (!suffix || title.endsWith(` | ${suffix}`)) return title

  return `${title} | ${suffix}`
}

export const resolveOGImageURL = ({
  image,
  settings,
}: {
  image?: {
    url?: string | null
    sizes?: {
      og?: {
        url?: string | null
      } | null
    } | null
  } | null
  settings: ResolvedSiteSettings
}) => {
  const serverUrl = getServerSideURL()
  const imageURL = image?.sizes?.og?.url || image?.url || settings.seo.defaultOGImage?.sizes?.og?.url || settings.seo.defaultOGImage?.url || settings.seo.defaultOGImagePath

  if (!imageURL) return undefined
  if (/^(https?:)?\/\//.test(imageURL)) return imageURL

  return `${serverUrl}${imageURL}`
}

export const getDefaultOpenGraph = (settings: ResolvedSiteSettings): Metadata['openGraph'] => {
  const imageURL = resolveOGImageURL({ settings })

  return {
    type: 'website',
    description: settings.seo.defaultDescription,
    images: imageURL
      ? [
          {
            url: imageURL,
          },
        ]
      : undefined,
    siteName: settings.brand.siteName,
    title: settings.seo.defaultTitle || settings.brand.siteName,
  }
}
