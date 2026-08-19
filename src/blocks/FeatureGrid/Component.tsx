import React from 'react'

import type { FeatureGridBlock as FeatureGridBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import RichText from '@/components/RichText'
import type { AppLocale } from '@/utilities/locale'

export const FeatureGridBlock: React.FC<FeatureGridBlockProps & { locale?: AppLocale }> = ({
  features,
  introContent,
  links,
  locale,
}) => {
  return (
    <section className="container">
      {introContent && (
        <div className="mb-12 max-w-[48rem]">
          <RichText data={introContent} enableGutter={false} locale={locale} />
        </div>
      )}

      {features && features.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            return (
              <article className="border-border bg-card rounded border p-6" key={feature.id || index}>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                {feature.description && <p className="text-muted-foreground">{feature.description}</p>}
              </article>
            )
          })}
        </div>
      )}

      {links && links.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-4">
          {links.map(({ link }, index) => {
            return <CMSLink key={index} {...link} locale={locale} />
          })}
        </div>
      )}
    </section>
  )
}
