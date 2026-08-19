import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'
import { locales, withLocalePrefix } from '@/utilities/locale'

const getPostPaths = (slug?: string | null) => locales.map((locale) => withLocalePrefix(`/posts/${slug}`, locale))

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const paths = getPostPaths(doc.slug)

      payload.logger.info(`Revalidating post at paths: ${paths.join(', ')}`)

      paths.forEach((path) => revalidatePath(path))
      revalidateTag('posts-sitemap', 'max')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPaths = getPostPaths(previousDoc.slug)

      payload.logger.info(`Revalidating old post at paths: ${oldPaths.join(', ')}`)

      oldPaths.forEach((path) => revalidatePath(path))
      revalidateTag('posts-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    getPostPaths(doc?.slug).forEach((path) => revalidatePath(path))
    revalidateTag('posts-sitemap', 'max')
  }

  return doc
}
