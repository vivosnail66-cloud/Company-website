'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

import { withLocalePrefix, type AppLocale } from '@/utilities/locale'
import type { ResolvedHeader, ResolvedHeaderGroup, ResolvedHeaderMegaMenu } from '../getHeader'
import { NavIcon } from './iconMap'

interface NavProps {
  data: ResolvedHeader
  locale?: AppLocale
}

const ItemLink: React.FC<{
  href?: string | null
  label?: string | null
  newTab?: boolean | null
  locale?: AppLocale
  className?: string
}> = ({ href, label, newTab, locale, className }) => {
  const target = href ? withLocalePrefix(href, locale) : undefined

  if (!target || !label) return null

  return (
    <Link
      className={className}
      href={target}
      {...(newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      {label}
    </Link>
  )
}

/** Flat-layout item: icon (optional) + title + optional description, rendered as a card. */
const CardItem: React.FC<{
  item: ResolvedHeaderMegaMenu['items'][number]
  locale?: AppLocale
}> = ({ item, locale }) => {
  const target = item.url ? withLocalePrefix(item.url, locale) : undefined

  return (
    <Link
      className="flex items-start gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      href={target || '#'}
      {...(item.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      {item.icon ? <NavIcon className="mt-0.5 size-6 shrink-0 text-primary" name={item.icon} /> : null}
      <div>
        <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
        {item.description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
        ) : null}
      </div>
    </Link>
  )
}

/** Grouped-layout item: plain text link. */
const LinkItem: React.FC<{
  item: ResolvedHeaderMegaMenu['items'][number]
  locale?: AppLocale
}> = ({ item, locale }) => (
  <ItemLink
    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
    href={item.url}
    label={item.label}
    locale={locale}
    newTab={item.newTab}
  />
)

/** Group column: optional title + link list (used by the "Grouped" layout). */
const Group: React.FC<{
  group: ResolvedHeaderGroup
  locale?: AppLocale
}> = ({ group, locale }) => (
  <div className="break-inside-avoid">
    {group.title ? <p className="mb-4 text-sm font-semibold text-foreground">{group.title}</p> : null}
    <ul className="space-y-3">
      {group.items.map((item, itemIndex) => (
        <li key={itemIndex}>
          <LinkItem item={item} locale={locale} />
        </li>
      ))}
    </ul>
  </div>
)

/** Promo card: image + title + description + optional link. */
const PromoCard: React.FC<{
  promo: NonNullable<ResolvedHeaderMegaMenu['promoCard']>
  locale?: AppLocale
}> = ({ promo, locale }) => {
  const target = promo.link?.url ? withLocalePrefix(promo.link.url, locale) : undefined
  const content = (
    <div className="flex h-full flex-col rounded-xl bg-muted p-6">
      {promo.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={promo.title || 'Promo'}
          className="mb-4 w-full rounded-md object-cover"
          src={promo.imageUrl}
        />
      ) : null}
      {promo.title ? <h6 className="text-sm font-semibold text-foreground">{promo.title}</h6> : null}
      {promo.description ? (
        <p className="mt-2 text-sm text-muted-foreground">{promo.description}</p>
      ) : null}
    </div>
  )

  if (target) {
    return (
      <Link
        aria-label={promo.title || 'Promo'}
        className="block h-full"
        href={target}
        {...(promo.link?.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
      >
        {content}
      </Link>
    )
  }

  return content
}

/** Bottom bar of the mega menu panel: optional text + link. */
const Footer: React.FC<{
  footer: NonNullable<ResolvedHeaderMegaMenu['footer']>
  locale?: AppLocale
}> = ({ footer, locale }) => {
  const target = footer.link?.url ? withLocalePrefix(footer.link.url, locale) : undefined

  return (
    <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4">
      {footer.text ? <p className="text-sm text-muted-foreground">{footer.text}</p> : <span />}
      {target ? (
        <Link
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          href={target}
          {...(footer.link?.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
        >
          {footer.link?.label || 'View all'}
        </Link>
      ) : null}
    </div>
  )
}

/** Renders the inner content of a mega menu panel: flat grid or grouped columns, plus optional promo card + footer. */
const MegaMenuContent: React.FC<{
  mega: ResolvedHeaderMegaMenu
  locale?: AppLocale
}> = ({ mega, locale }) => {
  const { layout, items, groups, promoCard } = mega
  const hasPromo = Boolean(promoCard)

  return (
    <div>
      <div className={hasPromo ? 'grid gap-8 lg:grid-cols-3' : ''}>
        <div className={hasPromo ? 'lg:col-span-2' : ''}>
          {layout === 'flat' ? (
            <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, itemIndex) => (
                <CardItem item={item} key={itemIndex} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="columns-1 gap-8 space-y-8 md:columns-3">
              {groups.map((group, groupIndex) => (
                <Group group={group} key={groupIndex} locale={locale} />
              ))}
            </div>
          )}
        </div>

        {promoCard ? (
          <div>
            <PromoCard locale={locale} promo={promoCard} />
          </div>
        ) : null}
      </div>

      {mega.footer ? <Footer footer={mega.footer} locale={locale} /> : null}
    </div>
  )
}

/**
 * Desktop nav row: top-level items in order. Items of type "Mega Menu"
 * render as click-to-toggle buttons with a dropdown panel; "Link" items
 * render as plain links. One mega panel open at a time. Full a11y:
 * aria-expanded/aria-controls, Enter/Space triggers, Escape and
 * outside-click close, focus returns to the toggle on close.
 */
export const HeaderNav: React.FC<NavProps> = ({ data, locale }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  const { items } = data.navigation

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && openIndex !== null) {
        setOpenIndex(null)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (openIndex !== null && navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenIndex(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [openIndex])

  if (items.length === 0) return null

  return (
    <nav aria-label="Main navigation" className="flex items-center gap-1" ref={navRef}>
      {items.map((item, itemIndex) => {
        const hasMega = Boolean(
          item.type === 'megaMenu' &&
            item.megaMenu &&
            (item.megaMenu.items.length > 0 || item.megaMenu.groups.length > 0 || item.megaMenu.promoCard),
        )
        const isOpen = openIndex === itemIndex

        if (!hasMega) {
          return (
            <ItemLink
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              href={item.url}
              key={itemIndex}
              label={item.label}
              locale={locale}
              newTab={item.newTab}
            />
          )
        }

        return (
          <div className="relative" key={itemIndex}>
            <button
              aria-controls={`header-mega-menu-${itemIndex}`}
              aria-expanded={isOpen}
              aria-haspopup="true"
              className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                isOpen ? 'text-foreground' : 'text-muted-foreground'
              }`}
              onClick={() => setOpenIndex((current) => (current === itemIndex ? null : itemIndex))}
              onKeyDown={(event) => {
                if (event.key === ' ' || event.key === 'Enter') {
                  event.preventDefault()
                  setOpenIndex((current) => (current === itemIndex ? null : itemIndex))
                }
              }}
              type="button"
            >
              {item.label}
              <svg aria-hidden="true" className="size-3 fill-current" viewBox="0 0 512 512">
                <path d="M511 138.2c-3-13.8-11.2-23.1-25.2-27-15.3-4.3-28 .4-38.8 11.3-41.9 42-83.7 84.1-125.5 126.2-21 21-42.2 41.9-65.4 65L64.7 122.3c-16-16-38.8-16.9-53.6-2.8s-15 38 .6 53.7C83.9 245.8 156.4 318.3 229 390.5c15.8 15.7 38 16.1 53.5.6 73-72.5 145.7-145.2 218.2-218.1 9.5-9.6 13.3-21.4 10.3-34.8" />
              </svg>
            </button>

            <div
              className={`absolute left-1/2 top-full z-50 mt-2 w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-border bg-background p-6 shadow-lg transition-opacity ${
                isOpen ? 'visible opacity-100' : 'invisible opacity-0'
              }`}
              id={`header-mega-menu-${itemIndex}`}
            >
              <MegaMenuContent locale={locale} mega={item.megaMenu!} />
            </div>
          </div>
        )
      })}
    </nav>
  )
}
