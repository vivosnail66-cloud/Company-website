'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { Logo } from '@/components/Logo/Logo'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { localePrefix, type AppLocale } from '@/utilities/locale'
import type { ResolvedHeader } from './getHeader'
import { HeaderActions } from './Actions'
import { AnnouncementBar } from './AnnouncementBar'
import { MobileDrawer } from './MobileDrawer'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  brandLogo?: {
    alt: string
    siteName: string
    src: string | null
    mobileSrc?: string | null
  }
  data: ResolvedHeader
  locale?: AppLocale
}

/**
 * Client header shell. `data.layout.variant` only drives the arrangement of
 * the three zones (logo / mega menu / actions); all zones are always
 * rendered, so no runtime conditionals are needed for the two header
 * variants — only the flex order changes.
 */
export const HeaderClient: React.FC<HeaderClientProps> = ({ brandLogo, data, locale }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  const { layout } = data
  const isMenuLeft = layout.variant === 'menu-left'

  return (
    <header
      className={layout.sticky ? 'sticky top-0 z-40' : 'relative z-40'}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <AnnouncementBar announcement={data.announcement} locale={locale} />

      <div className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center">
          {/* Zone 1: Logo (left in variant 1, center in variant 2) */}
          <Link
            aria-label={brandLogo?.siteName || 'Home'}
            className={`flex items-center ${isMenuLeft ? 'order-2 flex-1 justify-center' : ''}`}
            href={localePrefix(locale) || '/'}
          >
            <Logo
              alt={brandLogo?.alt}
              className="hidden md:block"
              loading="eager"
              priority="high"
              siteName={brandLogo?.siteName}
              src={brandLogo?.src}
            />
            <Logo
              alt={brandLogo?.alt}
              className="md:hidden"
              loading="eager"
              priority="high"
              siteName={brandLogo?.siteName}
              size="mobile"
              src={brandLogo?.mobileSrc || brandLogo?.src}
            />
          </Link>

          {/* Zone 2: Mega menu (center in variant 1, left in variant 2) */}
          <div
            className={`hidden lg:block ${
              isMenuLeft ? 'order-1 flex-1' : 'order-2 flex flex-1 justify-center'
            }`}
          >
            <HeaderNav data={data} locale={locale} />
          </div>

          {/* Zone 3: Actions (right in both variants) */}
          <div className={`flex items-center gap-3 ${isMenuLeft ? 'order-3' : 'order-3 ml-auto'}`}>
            <div className="hidden lg:block">
              <HeaderActions actions={data.actions} locale={locale} />
            </div>

            {/* Mobile hamburger */}
            <button
              aria-controls="header-mobile-drawer"
              aria-expanded={mobileOpen}
              aria-haspopup="true"
              aria-label="Open main menu"
              className="rounded-md p-2 text-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
              onClick={() => setMobileOpen(true)}
              type="button"
            >
              <svg
                aria-hidden="true"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <MobileDrawer
        data={data}
        isOpen={mobileOpen}
        locale={locale}
        onClose={() => setMobileOpen(false)}
      />
    </header>
  )
}
