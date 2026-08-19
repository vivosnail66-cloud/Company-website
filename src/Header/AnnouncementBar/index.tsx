'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { withLocalePrefix, type AppLocale } from '@/utilities/locale'
import type { ResolvedHeaderAnnouncement } from '../getHeader'

const SESSION_KEY = 'header-announcement-dismissed'

interface AnnouncementBarProps {
  announcement: ResolvedHeaderAnnouncement
  locale?: AppLocale
}

/**
 * Top banner: multiple stacked announcements, each with optional CTA button.
 * Dismissible state is remembered per session (sessionStorage), so a closed
 * bar stays closed until the next session.
 */
export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ announcement, locale }) => {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem(SESSION_KEY) === '1')
    } catch {
      // sessionStorage unavailable (SSR/privacy mode) — keep bar visible
    }
  }, [])

  if (!announcement.enabled || dismissed) return null

  const { items, dismissible } = announcement

  if (items.length === 0) return null

  return (
    <div className="relative border-b border-border bg-primary text-primary-foreground">
      <div className="container flex flex-col items-center justify-center gap-2 py-2.5 text-sm md:flex-row md:gap-6">
        <ul className="flex flex-col items-center gap-1 text-center">
          {items.map((item, itemIndex) => (
            <li className="flex items-center gap-2" key={itemIndex}>
              <span>{item.text}</span>
              {item.url ? (
                <Link
                  className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-80"
                  href={withLocalePrefix(item.url, locale)}
                  {...(item.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
                >
                  {item.label || 'Learn more'}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>

        {dismissible ? (
          <button
            aria-label="Dismiss announcement"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground md:static md:translate-y-0"
            onClick={() => {
              setDismissed(true)
              try {
                sessionStorage.setItem(SESSION_KEY, '1')
              } catch {
                // ignore
              }
            }}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  )
}
