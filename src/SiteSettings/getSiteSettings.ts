import { getCachedGlobal } from '@/utilities/getGlobals'
import type { AppLocale } from '@/utilities/locale'

import { fallbackSiteSettings } from './defaults'

type MediaLike = {
  alt?: string | null
  url?: string | null
  sizes?: {
    og?: {
      url?: string | null
    } | null
  } | null
}

type SiteSettingsLike = {
  brand?: {
    siteName?: string | null
    tagline?: string | null
    logo?: string | MediaLike | null
    mobileLogo?: string | MediaLike | null
    logoAlt?: string | null
  } | null
  seo?: {
    defaultTitle?: string | null
    titleSuffix?: string | null
    defaultDescription?: string | null
    defaultOGImage?: string | MediaLike | null
    defaultOGImagePath?: string | null
  } | null
  localization?: {
    defaultLocale?: string | null
    enabledLocales?: string[] | null
  } | null
}

export type ResolvedSiteSettings = {
  brand: {
    siteName: string
    tagline: string
    logo: MediaLike | null
    mobileLogo: MediaLike | null
    logoAlt: string
  }
  seo: {
    defaultTitle: string
    titleSuffix: string
    defaultDescription: string
    defaultOGImage: MediaLike | null
    defaultOGImagePath: string
  }
  localization: {
    defaultLocale: string
    enabledLocales: string[]
  }
}

const asMedia = (value: string | MediaLike | null | undefined): MediaLike | null => {
  return value && typeof value === 'object' ? value : null
}

export const resolveSiteSettings = (settings?: SiteSettingsLike | null): ResolvedSiteSettings => {
  return {
    brand: {
      siteName: settings?.brand?.siteName || fallbackSiteSettings.brand.siteName,
      tagline: settings?.brand?.tagline || fallbackSiteSettings.brand.tagline,
      logo: asMedia(settings?.brand?.logo),
      mobileLogo: asMedia(settings?.brand?.mobileLogo),
      logoAlt: settings?.brand?.logoAlt || settings?.brand?.siteName || fallbackSiteSettings.brand.logoAlt,
    },
    seo: {
      defaultTitle: settings?.seo?.defaultTitle || fallbackSiteSettings.seo.defaultTitle,
      titleSuffix: settings?.seo?.titleSuffix || fallbackSiteSettings.seo.titleSuffix,
      defaultDescription:
        settings?.seo?.defaultDescription || fallbackSiteSettings.seo.defaultDescription,
      defaultOGImage: asMedia(settings?.seo?.defaultOGImage),
      defaultOGImagePath:
        settings?.seo?.defaultOGImagePath || fallbackSiteSettings.seo.defaultOGImagePath,
    },
    localization: {
      defaultLocale:
        settings?.localization?.defaultLocale || fallbackSiteSettings.localization.defaultLocale,
      enabledLocales:
        settings?.localization?.enabledLocales || [...fallbackSiteSettings.localization.enabledLocales],
    },
  }
}

export const getResolvedSiteSettings = async (locale?: AppLocale): Promise<ResolvedSiteSettings> => {
  const siteSettings = await getCachedGlobal('site-settings', 1, locale)()
  return resolveSiteSettings(siteSettings as SiteSettingsLike)
}
