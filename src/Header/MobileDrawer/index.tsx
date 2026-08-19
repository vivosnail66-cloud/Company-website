'use client'

import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { localeLabels, locales, withLocalePrefix, type AppLocale } from '@/utilities/locale'
import type { ResolvedHeader, ResolvedHeaderPromo } from '../getHeader'
import { NavIcon } from '../Nav/iconMap'

interface MobileDrawerProps {
  data: ResolvedHeader
  locale?: AppLocale
  isOpen: boolean
  onClose: () => void
}

/** Compact promo card inside the accordion (image + title + description + optional link). */
const MobilePromoCard: React.FC<{
  promo: ResolvedHeaderPromo
  locale?: AppLocale
  onNavigate: () => void
}> = ({ promo, locale, onNavigate }) => {
  const target = promo.link?.url ? withLocalePrefix(promo.link.url, locale) : undefined

  const content = (
    <div className="flex flex-col gap-2 rounded-lg bg-muted p-3">
      {promo.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={promo.title || 'Promo'}
          className="w-full rounded-md object-cover"
          src={promo.imageUrl}
        />
      ) : null}
      {promo.title ? <p className="text-sm font-semibold text-foreground">{promo.title}</p> : null}
      {promo.description ? (
        <p className="text-sm text-muted-foreground">{promo.description}</p>
      ) : null}
    </div>
  )

  if (target) {
    return (
      <Link
        aria-label={promo.title || 'Promo'}
        className="block"
        href={target}
        onClick={onNavigate}
        {...(promo.link?.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
      >
        {content}
      </Link>
    )
  }

  return content
}

/**
 * Mobile slide-in drawer: mega menu content as accordion (flat grid or
 * grouped columns, matching the desktop layout) + language switcher
 * + Log in + CTA. Focus is trapped on open; Escape closes and returns focus.
 */
export const MobileDrawer: React.FC<MobileDrawerProps> = ({ data, locale, isOpen, onClose }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const { actions, navigation } = data
  const currentLocale = locale || 'en'

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus()
      const previous = document.activeElement as HTMLElement | null
      return () => previous?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <button
        aria-label="Close menu"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        type="button"
      />
      {/* Drawer */}
      <div
        aria-label="Main menu"
        className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col overflow-y-auto border-l border-border bg-background shadow-xl"
        ref={drawerRef}
        role="dialog"
      >
        {/* Drawer header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <span className="text-sm font-semibold">{localeLabels[currentLocale] || 'Menu'}</span>
          <button
            aria-label="Close menu"
            className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 p-4">
          {/* Top-level items: mega menu items as accordion, plain links direct */}
          {navigation.items.length > 0 ? (
            <nav aria-label="Mobile navigation">
              <ul className="flex flex-col">
                {navigation.items.map((item, itemIndex) => {
                  const hasMega = Boolean(
                    item.type === 'megaMenu' &&
                      item.megaMenu &&
                      (item.megaMenu.items.length > 0 ||
                        item.megaMenu.groups.length > 0 ||
                        item.megaMenu.promoCard),
                  )

                  if (!hasMega) {
                    return (
                      <li className="border-b border-border" key={itemIndex}>
                        <Link
                          className="flex w-full items-center px-1 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
                          href={withLocalePrefix(item.url || '#', locale)}
                          onClick={onClose}
                          {...(item.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                        >
                          {item.label}
                        </Link>
                      </li>
                    )
                  }

                  const mega = item.megaMenu!

                  return (
                    <li className="border-b border-border" key={itemIndex}>
                      <button
                        aria-expanded={openIndex === itemIndex}
                        className="flex w-full items-center justify-between px-1 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        onClick={() =>
                          setOpenIndex((current) => (current === itemIndex ? null : itemIndex))
                        }
                        type="button"
                      >
                        {item.label}
                        <svg
                          aria-hidden="true"
                          className={`size-4 transition-transform ${
                            openIndex === itemIndex ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>

                      {openIndex === itemIndex ? (
                        <div className="flex flex-col gap-4 pb-3">
                          {mega.layout === 'flat' && mega.items.length > 0 ? (
                            <ul className="flex flex-col gap-1">
                              {mega.items.map((megaItem, megaItemIndex) => (
                                <li key={megaItemIndex}>
                                  <Link
                                    className="flex items-center gap-2 rounded-md px-1 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    href={withLocalePrefix(megaItem.url || '#', locale)}
                                    onClick={onClose}
                                    {...(megaItem.newTab
                                      ? { rel: 'noopener noreferrer', target: '_blank' }
                                      : {})}
                                  >
                                    {megaItem.icon ? (
                                      <NavIcon className="size-4 text-primary" name={megaItem.icon} />
                                    ) : null}
                                    {megaItem.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          {mega.layout === 'grouped' && mega.groups.length > 0 ? (
                            <ul className="flex flex-col gap-1">
                              {mega.groups.map((group, groupIndex) => (
                                <li key={groupIndex}>
                                  {group.title ? (
                                    <p className="px-1 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                      {group.title}
                                    </p>
                                  ) : null}
                                  <ul className="flex flex-col gap-1">
                                    {group.items.map((megaItem, megaItemIndex) => (
                                      <li key={megaItemIndex}>
                                        <Link
                                          className="flex items-center gap-2 rounded-md px-1 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                                          href={withLocalePrefix(megaItem.url || '#', locale)}
                                          onClick={onClose}
                                          {...(megaItem.newTab
                                            ? { rel: 'noopener noreferrer', target: '_blank' }
                                            : {})}
                                        >
                                          {megaItem.icon ? (
                                            <NavIcon className="size-4 text-primary" name={megaItem.icon} />
                                          ) : null}
                                          {megaItem.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          {mega.promoCard ? (
                            <MobilePromoCard
                              locale={locale}
                              onNavigate={onClose}
                              promo={mega.promoCard}
                            />
                          ) : null}

                          {mega.footer && (mega.footer.text || mega.footer.link?.url) ? (
                            <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
                              {mega.footer.text ? (
                                <p className="text-sm text-muted-foreground">{mega.footer.text}</p>
                              ) : null}
                              {mega.footer.link?.url ? (
                                <Link
                                  className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                                  href={withLocalePrefix(mega.footer.link.url, locale)}
                                  onClick={onClose}
                                  {...(mega.footer.link.newTab
                                    ? { rel: 'noopener noreferrer', target: '_blank' }
                                    : {})}
                                >
                                  {mega.footer.link.label || 'View all'}
                                </Link>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            </nav>
          ) : null}

          {/* Language switcher */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Language
            </p>
            <div className="flex gap-2">
              {locales.map((localeOption) => (
                <Link
                  className={`flex-1 rounded-md border px-3 py-2 text-center text-sm transition-colors ${
                    localeOption === currentLocale
                      ? 'border-primary bg-primary/10 font-semibold text-foreground'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                  href={withLocalePrefix(`/${localeOption === 'en' ? '' : 'zh'}`, localeOption)}
                  key={localeOption}
                  onClick={onClose}
                >
                  {localeLabels[localeOption]}
                </Link>
              ))}
            </div>
          </div>

          {/* Actions (dynamic list) */}
          <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
            {actions.items.map((item, itemIndex) =>
              item.appearance === 'button' ? (
                <Button asChild key={itemIndex}>
                  <Link href={item.url} onClick={onClose}>
                    {item.label}
                  </Link>
                </Button>
              ) : (
                <Link
                  className="rounded-md px-3 py-2 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  href={item.url}
                  key={itemIndex}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
