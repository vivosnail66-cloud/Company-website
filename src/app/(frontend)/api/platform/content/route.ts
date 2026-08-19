import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { verifyApiToken } from '@/platform/apiToken'

export const GET = async (request: Request) => {
  const token = await verifyApiToken({
    request,
    requiredScope: 'content:read',
  })

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })
  const [pages, posts] = await Promise.all([
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 50,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
        title: true,
        updatedAt: true,
      },
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 50,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
        title: true,
        updatedAt: true,
      },
      where: {
        _status: {
          equals: 'published',
        },
      },
    }),
  ])

  return Response.json({
    pages: pages.docs,
    posts: posts.docs,
  })
}
