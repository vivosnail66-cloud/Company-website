import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import type { NavItemLike } from '@/utilities/navigation'
import { localePrefix, type AppLocale } from '@/utilities/locale'
import { getBrandLogo } from '@/SiteSettings/brand'
import { getResolvedSiteSettings } from '@/SiteSettings/getSiteSettings'
import { getResolvedFooter } from './getFooter'

const FooterNavItem: React.FC<{ item: NavItemLike; locale?: AppLocale }> = ({ item, locale }) => {
  const childItems = item.children || []

  return (
    <div className="flex flex-col gap-2">
      <CMSLink className="text-white" {...item.link} locale={locale} />
      {childItems.length > 0 ? (
        <div className="flex flex-col gap-2 pl-3 text-sm text-white/80">
          {childItems.map((childItem, childIndex) => {
            const grandChildItems = childItem.grandchildren || childItem.children || []

            return (
              <div className="flex flex-col gap-1" key={childIndex}>
                <CMSLink className="text-white/80" {...childItem.link} locale={locale} />
                {grandChildItems.length > 0 ? (
                  <div className="flex flex-col gap-1 pl-3 text-white/70">
                    {grandChildItems.map((grandChildItem, grandChildIndex) => (
                      <CMSLink
                        className="text-white/70"
                        key={grandChildIndex}
                        {...grandChildItem.link}
                        locale={locale}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export async function Footer({ locale }: { locale?: AppLocale }) {
  const [siteSettings, footer] = await Promise.all([
    getResolvedSiteSettings(locale),
    getResolvedFooter(locale),
  ])
  const brandLogo = getBrandLogo(siteSettings)

  const navItems = footer.navigation.navItems

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href={localePrefix(locale) || '/'}>
          <Logo alt={brandLogo.alt} siteName={brandLogo.siteName} src={brandLogo.src} />
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-6 md:items-start">
          {footer.layout.showThemeSelector && <ThemeSelector />}
          <nav className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {navItems.map((item, i) => {
              return <FooterNavItem item={item} key={i} locale={locale} />
            })}
          </nav>
        </div>
      </div>
    </footer>
  )
}
