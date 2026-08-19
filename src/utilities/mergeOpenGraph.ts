import type { Metadata } from 'next'
import { fallbackSiteSettings } from '@/SiteSettings/defaults'
import type { ResolvedSiteSettings } from '@/SiteSettings/getSiteSettings'
import { getDefaultOpenGraph } from '@/SiteSettings/seo'

const fallbackResolvedSiteSettings: ResolvedSiteSettings = {
  brand: {
    ...fallbackSiteSettings.brand,
    logo: null,
    mobileLogo: null,
  },
  seo: {
    ...fallbackSiteSettings.seo,
    defaultOGImage: null,
  },
  localization: {
    ...fallbackSiteSettings.localization,
    enabledLocales: [...fallbackSiteSettings.localization.enabledLocales],
  },
}

export const mergeOpenGraph = (
  og?: Metadata['openGraph'],
  settings: ResolvedSiteSettings = fallbackResolvedSiteSettings,
): Metadata['openGraph'] => {
  const defaultOpenGraph = getDefaultOpenGraph(settings)

  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph?.images,
  }
}
