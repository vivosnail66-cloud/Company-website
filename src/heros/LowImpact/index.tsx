import React from 'react'

import type { Page } from '@/payload-types'

import RichText from '@/components/RichText'
import type { AppLocale } from '@/utilities/locale'

type LowImpactHeroType =
  | {
      children?: React.ReactNode
      richText?: never
      locale?: AppLocale
    }
  | (Omit<Page['hero'], 'richText'> & {
      children?: never
      locale?: AppLocale
      richText?: Page['hero']['richText']
    })

export const LowImpactHero: React.FC<LowImpactHeroType> = ({ children, locale, richText }) => {
  return (
    <div className="container mt-16">
      <div className="max-w-[48rem]">
        {children || (richText && <RichText data={richText} enableGutter={false} locale={locale} />)}
      </div>
    </div>
  )
}
