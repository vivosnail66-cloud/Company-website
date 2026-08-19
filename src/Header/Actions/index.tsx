'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  defaultLocale,
  getPathLocale,
  localeLabels,
  locales,
  type AppLocale,
} from '@/utilities/locale'
import type { ResolvedHeaderActions } from '../getHeader'

interface ActionsProps {
  actions: ResolvedHeaderActions
  locale?: AppLocale
}

/** Switches the current path to the target locale, keeping the rest of the path. */
const switchLocalePath = (pathname: string, targetLocale: AppLocale): string => {
  const segments = pathname.split('/').filter(Boolean)
  const currentLocale = getPathLocale(pathname)

  if (currentLocale !== defaultLocale) {
    segments.shift()
  }

  const prefix = targetLocale === defaultLocale ? '' : `/${targetLocale}`
  return `${prefix}/${segments.join('/')}`.replace(/\/+$/, '') || '/'
}

/** Globe icon + dropdown listing all enabled locales. */
const LanguageSwitcher: React.FC<{ locale?: AppLocale }> = ({ locale }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const current = locale || defaultLocale

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Switch language"
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        onClick={() => setIsOpen((open) => !open)}
        ref={buttonRef}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
        </svg>
      </button>

      {isOpen ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 min-w-36 rounded-lg border border-border bg-popover p-1 shadow-lg"
          ref={dropdownRef}
        >
          {locales.map((localeOption) => (
            <Link
              className={`block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${
                localeOption === current ? 'font-semibold text-foreground' : 'text-muted-foreground'
              }`}
              href={switchLocalePath(pathname, localeOption)}
              key={localeOption}
              onClick={() => setIsOpen(false)}
            >
              {localeLabels[localeOption]}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Right-side actions: language switcher + dynamic action links. */
export const HeaderActions: React.FC<ActionsProps> = ({ actions, locale }) => {
  const { showLanguageSwitcher, items } = actions

  return (
    <div className="flex items-center gap-3">
      {showLanguageSwitcher ? <LanguageSwitcher locale={locale} /> : null}

      {items.map((item, itemIndex) =>
        item.appearance === 'button' ? (
          <Button asChild className="hidden sm:inline-flex" key={itemIndex}>
            <Link href={item.url}>{item.label}</Link>
          </Button>
        ) : (
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href={item.url}
            key={itemIndex}
          >
            {item.label}
          </Link>
        ),
      )}
    </div>
  )
}
