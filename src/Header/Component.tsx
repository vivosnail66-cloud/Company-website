import { HeaderClient } from './Component.client'
import type { AppLocale } from '@/utilities/locale'
import { getBrandLogo } from '@/SiteSettings/brand'
import { getResolvedSiteSettings } from '@/SiteSettings/getSiteSettings'
import { getResolvedHeader } from './getHeader'
import React from 'react'

export async function Header({ locale }: { locale?: AppLocale }) {
  const [siteSettings, header] = await Promise.all([
    getResolvedSiteSettings(locale),
    getResolvedHeader(locale),
  ])

  return (
    <HeaderClient
      brandLogo={getBrandLogo(siteSettings)}
      data={header}
      locale={locale}
    />
  )
}
