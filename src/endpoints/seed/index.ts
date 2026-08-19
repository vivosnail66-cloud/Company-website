import type { Payload, PayloadRequest, File } from 'payload'

import { contactForm as contactFormData } from './contact-form'
import { contact as contactPageData } from './contact-page'
import { home } from './home'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'
import { post1 } from './post-1'
import type { PostArgs } from './post-1'
import { post2 } from './post-2'
import { post3 } from './post-3'

type SeedCollectionSlug =
  | 'categories'
  | 'media'
  | 'pages'
  | 'posts'
  | 'api-tokens'
  | 'webhooks'
  | 'webhook-deliveries'
  | 'audit-logs'
  | 'forms'
  | 'form-submissions'
  | 'search'

const collections: SeedCollectionSlug[] = [
  'categories',
  'media',
  'pages',
  'posts',
  'api-tokens',
  'webhooks',
  'webhook-deliveries',
  'audit-logs',
  'forms',
  'form-submissions',
  'search',
]

const globals = ['site-settings', 'header', 'footer'] as const

type GlobalWriter = {
  updateGlobal: (args: {
    slug: (typeof globals)[number]
    data: Record<string, unknown>
    depth?: number
    context?: Record<string, unknown>
  }) => Promise<unknown>
}

type CollectionWriter = {
  create: (args: {
    collection: 'pages'
    data: Record<string, unknown>
    depth?: number
  }) => Promise<{ id: string | number }>
}

type UserWriter = {
  create: (args: {
    collection: 'users'
    data: Record<string, unknown>
    depth?: number
  }) => Promise<{ id: string | number; name?: string | null }>
}

type DatabaseWriter = {
  deleteMany: (args: {
    collection: SeedCollectionSlug
    req: PayloadRequest
    where: Record<string, unknown>
  }) => Promise<unknown>
  deleteVersions: (args: {
    collection: SeedCollectionSlug
    req: PayloadRequest
    where: Record<string, unknown>
  }) => Promise<unknown>
}

const categories = ['Technology', 'News', 'Finance', 'Design', 'Software', 'Engineering']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)
  const globalWriter = payload as unknown as GlobalWriter
  const userWriter = payload as unknown as UserWriter
  const databaseWriter = payload.db as unknown as DatabaseWriter
  const payloadCollections = payload.collections as Record<string, { config: { versions?: unknown } }>

  // clear the database
  await Promise.all(
    globals.map((global) =>
      globalWriter.updateGlobal({
        slug: global,
        data: {
          ...(global === 'site-settings'
            ? {}
            : global === 'header'
              ? {
                  navigation: {
                    variant: 'links-columns',
                    columns: [],
                  },
                }
              : {
                  navigation: {
                    links: [],
                  },
                }),
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  await Promise.all(
    collections.map((collection) => databaseWriter.deleteMany({ collection, req, where: {} })),
  )

  await Promise.all(
    collections
      .filter((collection) => Boolean(payloadCollections[collection]?.config.versions))
      .map((collection) => databaseWriter.deleteVersions({ collection, req, where: {} })),
  )

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })

  payload.logger.info(`— Seeding media...`)

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])

  const [demoAuthor, image1Doc, image2Doc, image3Doc, imageHomeDoc] = await Promise.all([
    userWriter.create({
      collection: 'users',
      data: {
        name: 'Demo Author',
        email: 'demo-author@example.com',
        password: 'password',
      },
    }),
    payload.create({
      collection: 'media',
      data: image1,
      file: image1Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image2Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image3Buffer,
    }),
    payload.create({
      collection: 'media',
      data: imageHero1,
      file: hero1Buffer,
    }),
    categories.map((category) =>
      payload.create({
        collection: 'categories',
        data: {
          title: category,
          slug: category,
        },
      }),
    ),
  ])

  payload.logger.info(`— Seeding posts...`)
  const demoPostAuthor = demoAuthor as PostArgs['author']

  // Do not create posts with `Promise.all` because we want the posts to be created in order
  // This way we can sort them by `createdAt` or `publishedAt` and they will be in the expected order
  const post1Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableWorkflow: true,
      disableRevalidate: true,
    },
    data: post1({ heroImage: image1Doc, blockImage: image2Doc, author: demoPostAuthor }),
  })

  const post2Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableWorkflow: true,
      disableRevalidate: true,
    },
    data: post2({ heroImage: image2Doc, blockImage: image3Doc, author: demoPostAuthor }),
  })

  const post3Doc = await payload.create({
    collection: 'posts',
    depth: 0,
    context: {
      disableWorkflow: true,
      disableRevalidate: true,
    },
    data: post3({ heroImage: image3Doc, blockImage: image1Doc, author: demoPostAuthor }),
  })

  // update each post with related posts
  await payload.update({
    id: post1Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post2Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post2Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post3Doc.id],
    },
  })
  await payload.update({
    id: post3Doc.id,
    collection: 'posts',
    data: {
      relatedPosts: [post1Doc.id, post2Doc.id],
    },
  })

  payload.logger.info(`— Seeding contact form...`)

  const contactForm = await payload.create({
    collection: 'forms',
    depth: 0,
    data: contactFormData,
  })

  payload.logger.info(`— Seeding pages...`)

  const [_, contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      depth: 0,
      context: {
        disableWorkflow: true,
        disableRevalidate: true,
      },
      data: home({ heroImage: imageHomeDoc, metaImage: image2Doc }),
    }),
    payload.create({
      collection: 'pages',
      depth: 0,
      context: {
        disableWorkflow: true,
        disableRevalidate: true,
      },
      data: contactPageData({ contactForm: contactForm }),
    }),
  ])

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    globalWriter.updateGlobal({
      slug: 'site-settings',
      data: {
        brand: {
          siteName: 'Gotocosmic',
          tagline: 'Content operations platform',
          logo: imageHomeDoc.id,
          logoAlt: 'Gotocosmic',
        },
        seo: {
          defaultTitle: 'Gotocosmic',
          titleSuffix: 'Gotocosmic',
          defaultDescription: 'A multilingual content platform powered by Payload and Next.js.',
          defaultOGImage: image2Doc.id,
          defaultOGImagePath: '/website-template-OG.webp',
        },
        localization: {
          defaultLocale: 'en',
          enabledLocales: ['en', 'zh'],
        },
      },
    }),
    globalWriter.updateGlobal({
      slug: 'header',
      data: {
        layout: {
          variant: 'logo-left',
          sticky: true,
        },
        navigation: {
          variant: 'links-columns',
          items: [
            {
              label: 'Home',
              link: {
                type: 'custom',
                url: '/',
              },
            },
            {
              label: 'Explore',
              mega: {
                columns: [
                  {
                    title: 'Content',
                    items: [
                      {
                        label: 'Posts',
                        link: {
                          type: 'custom',
                          url: '/posts',
                        },
                      },
                      {
                        label: 'Contact',
                        link: {
                          type: 'reference',
                          reference: {
                            relationTo: 'pages',
                            value: contactPage.id,
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
    }),
    globalWriter.updateGlobal({
      slug: 'footer',
      data: {
        layout: {
          variant: 'standard',
          showThemeSelector: true,
        },
        navigation: {
          links: [
            {
              link: {
                type: 'custom',
                label: 'Admin',
                url: '/admin',
              },
            },
            {
              link: {
                type: 'custom',
                label: 'Settings',
                url: '/admin/settings',
              },
            },
            {
              link: {
                type: 'custom',
                label: 'Webhooks',
                url: '/admin/collections/webhooks',
              },
            },
          ],
        },
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
