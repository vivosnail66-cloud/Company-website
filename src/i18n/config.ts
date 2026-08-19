export const locales = ['en', 'zh'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const isLocale = (value: string | undefined | null): value is Locale =>
  Boolean(value) && (locales as readonly string[]).includes(value as string)

export type LocaleOption = {
  code: Locale
  label: string
}

export const localeOptions: LocaleOption[] = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
]
