'use client'

import React, { createContext, use } from 'react'

import type { Locale } from '@/i18n/config'
import { defaultLocale } from '@/i18n/config'

export interface LocaleContextType {
  locale: Locale
}

const initialContext: LocaleContextType = {
  locale: defaultLocale,
}

const LocaleContext = createContext(initialContext)

export const LocaleProvider = ({
  children,
  locale,
}: {
  children: React.ReactNode
  locale: Locale
}) => {
  return <LocaleContext value={{ locale }}>{children}</LocaleContext>
}

export const useLocale = (): Locale => use(LocaleContext).locale
