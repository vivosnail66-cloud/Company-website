import { headers } from 'next/headers'

import { defaultLocale, normalizeLocale, type AppLocale } from './locale'

export const localeHeaderName = 'x-app-locale'

export const getRequestLocale = async (): Promise<AppLocale> => {
  const requestHeaders = await headers()
  return normalizeLocale(requestHeaders.get(localeHeaderName) || defaultLocale)
}
