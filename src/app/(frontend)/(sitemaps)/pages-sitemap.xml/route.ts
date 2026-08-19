import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { locales, toPayloadLocale, withLocalePrefix } from '@/utilities/locale'

const getPagesSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL =
      process.env.NEXT_PUBLIC_SERVER_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      'https://example.com'

    const dateFallback = new Date().toISOString()

    const defaultSitemap = [
      {
        loc: `${SITE_URL}/search`,
        lastmod: dateFallback,
      },
      {
        loc: `${SITE_URL}/posts`,
        lastmod: dateFallback,
      },
    ]

    const localizedSitemaps = await Promise.all(
      locales.map(async (locale) => {
        const results = await payload.find({
          collection: 'pages',
          overrideAccess: false,
          draft: false,
          depth: 0,
          limit: 1000,
          locale: toPayloadLocale(locale),
          pagination: false,
          where: {
            _status: {
              equals: 'published',
            },
          },
          select: {
            slug: true,
            updatedAt: true,
          },
        })

        return results.docs
          .filter((page) => Boolean(page?.slug))
          .map((page) => ({
            loc:
              page?.slug === 'home'
                ? `${SITE_URL}${withLocalePrefix('/', locale)}`
                : `${SITE_URL}${withLocalePrefix(`/${page?.slug}`, locale)}`,
            lastmod: page.updatedAt || dateFallback,
          }))
      }),
    )

    const sitemap = localizedSitemaps.flat()

    return [...defaultSitemap, ...sitemap]
  },
  ['pages-sitemap'],
  {
    tags: ['pages-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getPagesSitemap()

  return getServerSideSitemap(sitemap)
}
