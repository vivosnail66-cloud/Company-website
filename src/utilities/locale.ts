import type { TypedLocale } from 'payload'

export const locales = ['en', 'zh'] as const
export type AppLocale = (typeof locales)[number]

export const defaultLocale: AppLocale = 'en'

export const localeLabels: Record<AppLocale, string> = {
  en: 'English',
  zh: '中文',
}

export const isLocale = (value?: string | null): value is AppLocale => {
  return Boolean(value && (locales as readonly string[]).includes(value))
}

export const normalizeLocale = (value?: string | null): AppLocale => {
  return isLocale(value) ? value : defaultLocale
}

export const localePrefix = (locale?: string | null): string => {
  const normalizedLocale = normalizeLocale(locale)
  return `/${normalizedLocale}`
}

export const withLocalePrefix = (path: string, locale?: string | null): string => {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('mailto:') || path.startsWith('tel:')) {
    return path
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const prefix = localePrefix(locale)

  if (!prefix || normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)) {
    return normalizedPath
  }

  return `${prefix}${normalizedPath}`
}

export const getPathLocale = (pathname?: string | null): AppLocale => {
  const firstSegment = pathname?.split('/').filter(Boolean)[0]
  return normalizeLocale(firstSegment)
}

export const toPayloadLocale = (locale?: string | null): TypedLocale => {
  return normalizeLocale(locale) as unknown as TypedLocale
}
