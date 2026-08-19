import { getServerSideURL } from '@/utilities/getURL'

import type { ResolvedSiteSettings } from './getSiteSettings'

type BrandLogo = {
  alt: string
  siteName: string
  src: string | null
  mobileSrc: string | null
}

const toAbsoluteMediaURL = (url?: string | null) => {
  if (!url) return null
  if (/^(https?:)?\/\//.test(url)) return url
  return `${getServerSideURL()}${url}`
}

export const getBrandLogo = (settings: ResolvedSiteSettings): BrandLogo => {
  return {
    alt: settings.brand.logoAlt,
    siteName: settings.brand.siteName,
    src: toAbsoluteMediaURL(settings.brand.logo?.url),
    mobileSrc: toAbsoluteMediaURL(settings.brand.mobileLogo?.url),
  }
}
