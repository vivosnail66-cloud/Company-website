import type { Media } from '@/payload-types'
import type { CMSLinkType } from '@/components/Link'

/**
 * Shared resolved navigation item shape used by both header and footer
 * frontend components. Payload block/global data is normalized into this
 * shape by the header/footer resolvers.
 */
export type NavItemLike = {
  children?: NavItemLike[] | null
  grandchildren?: NavItemLike[] | null
  description?: string | null
  icon?: string | null
  link?: CMSLinkType | null
  promo?: {
    title?: string | null
    description?: string | null
    image?: (number | null) | Media
    link?: CMSLinkType | null
  } | null
}
