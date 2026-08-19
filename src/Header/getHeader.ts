import { getServerSideURL } from '@/utilities/getURL'
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { AppLocale } from '@/utilities/locale'
import type { HeaderVariant, MegaMenuLayout, NavItemType } from './config'

/**
 * Raw shape coming from the Payload `header` global (depth 1 so media
 * uploads resolve to objects with a `url`). All fields optional so a
 * partially-configured global never crashes the frontend.
 */
type NavItemLike = {
  label?: string | null
  type?: NavItemType | null
  link?: LinkLike | null
  megaMenuLayout?: MegaMenuLayout | null
  megaMenuItems?: Array<MegaMenuItemLike | null> | null
  megaMenuGroups?: Array<{
    title?: string | null
    items?: Array<MegaMenuItemLike | null> | null
  } | null> | null
  megaMenuPromoCard?: PromoLike | null
  megaMenuFooter?: {
    text?: string | null
    link?: LinkLike | null
  } | null
}

type HeaderConfigLike = {
  layout?: {
    variant?: HeaderVariant | null
    sticky?: boolean | null
  } | null
  navigation?: {
    items?: Array<NavItemLike | null> | null
  } | null
  announcement?: {
    enabled?: boolean | null
    dismissible?: boolean | null
    items?: Array<{
      enabled?: boolean | null
      text?: string | null
      label?: string | null
      link?: LinkLike | null
    } | null> | null
  } | null
  actions?: {
    showLanguageSwitcher?: boolean | null
    items?: Array<{
      label?: string | null
      url?: string | null
      appearance?: 'link' | 'button' | null
    } | null> | null
  } | null
}

type MegaMenuItemLike = {
  label?: string | null
  link?: LinkLike | null
  icon?: string | null
  description?: string | null
}

type MediaLike = {
  url?: string | null
} | null

type LinkLike = {
  type?: 'custom' | 'reference' | null
  newTab?: boolean | null
  reference?: { relationTo: string; value: unknown } | null
  url?: string | null
  label?: string | null
}

type PromoLike = {
  title?: string | null
  description?: string | null
  image?: MediaLike | null
  link?: LinkLike | null
}

export type ResolvedHeaderItem = {
  label?: string | null
  url?: string | null
  newTab?: boolean | null
  icon?: string | null
  description?: string | null
}

export type ResolvedHeaderGroup = {
  title?: string | null
  items: ResolvedHeaderItem[]
}

export type ResolvedHeaderPromo = {
  title?: string | null
  description?: string | null
  imageUrl?: string | null
  link?: ResolvedHeaderItem | null
}

export type ResolvedHeaderFooter = {
  text?: string | null
  link?: ResolvedHeaderItem | null
}

export type ResolvedHeaderMegaMenu = {
  layout: MegaMenuLayout
  items: ResolvedHeaderItem[]
  groups: ResolvedHeaderGroup[]
  promoCard?: ResolvedHeaderPromo | null
  footer?: ResolvedHeaderFooter | null
}

export type ResolvedHeaderNavItem = {
  label: string
  type: NavItemType
  url?: string | null
  newTab?: boolean | null
  megaMenu?: ResolvedHeaderMegaMenu | null
}

export type ResolvedHeaderAnnouncement = {
  enabled: boolean
  dismissible: boolean
  items: Array<{
    text?: string | null
    label?: string | null
    url?: string | null
    newTab?: boolean | null
  }>
}

export type ResolvedHeaderAction = {
  label: string
  url: string
  appearance: 'link' | 'button'
}

export type ResolvedHeaderActions = {
  showLanguageSwitcher: boolean
  items: ResolvedHeaderAction[]
}

export type ResolvedHeader = {
  layout: {
    variant: HeaderVariant
    sticky: boolean
  }
  navigation: {
    items: ResolvedHeaderNavItem[]
  }
  announcement: ResolvedHeaderAnnouncement
  actions: ResolvedHeaderActions
}

const toAbsoluteMediaURL = (url?: string | null): string | null => {
  if (!url) return null
  if (/^(https?:)?\/\//.test(url)) return url
  return `${getServerSideURL()}${url}`
}

const resolveLink = (link: LinkLike | null | undefined): ResolvedHeaderItem | null => {
  if (!link) return null
  return {
    label: link.label,
    url: link.url,
    newTab: Boolean(link.newTab),
  }
}

const resolveMegaMenuItem = (item?: MegaMenuItemLike | null): ResolvedHeaderItem | null => {
  if (!item || !item.label) return null
  return {
    label: item.label,
    url: item.link?.url || null,
    newTab: Boolean(item.link?.newTab),
    icon: item.icon || null,
    description: item.description || null,
  }
}

const resolvePromo = (promo?: PromoLike | null): ResolvedHeaderPromo | null => {
  if (!promo) return null
  return {
    title: promo.title,
    description: promo.description,
    imageUrl: promo.image ? toAbsoluteMediaURL(promo.image.url) : null,
    link: resolveLink(promo.link),
  }
}

export const getResolvedHeader = async (locale?: AppLocale): Promise<ResolvedHeader> => {
  const header = (await getCachedGlobal('header', 1, locale)()) as HeaderConfigLike

  const resolveMegaMenu = (item: NavItemLike): ResolvedHeaderMegaMenu | null => {
    if (item?.type !== 'megaMenu') return null

    const layout: MegaMenuLayout = item.megaMenuLayout === 'grouped' ? 'grouped' : 'flat'

    return {
      layout,
      items: (item.megaMenuItems || [])
        .map(resolveMegaMenuItem)
        .filter((resolved): resolved is ResolvedHeaderItem => Boolean(resolved)),
      groups: (item.megaMenuGroups || [])
        .filter((group) => group)
        .map((group) => ({
          title: group?.title || null,
          items: (group?.items || [])
            .map(resolveMegaMenuItem)
            .filter((resolved): resolved is ResolvedHeaderItem => Boolean(resolved)),
        })),
      promoCard: resolvePromo(item.megaMenuPromoCard),
      footer:
        item.megaMenuFooter && (item.megaMenuFooter.text || item.megaMenuFooter.link?.url)
          ? {
              text: item.megaMenuFooter.text,
              link: resolveLink(item.megaMenuFooter.link),
            }
          : null,
    }
  }

  return {
    layout: {
      variant: header?.layout?.variant || 'logo-left',
      sticky: header?.layout?.sticky !== false,
    },
    navigation: {
      items: (header?.navigation?.items || [])
        .filter((item) => item && item.label)
        .map((item) => ({
          label: item!.label as string,
          type: item?.type === 'megaMenu' ? 'megaMenu' : 'link',
          url: item?.link?.url || null,
          newTab: Boolean(item?.link?.newTab),
          megaMenu: resolveMegaMenu(item as NavItemLike),
        })),
    },
    announcement: {
      enabled: Boolean(header?.announcement?.enabled),
      dismissible: header?.announcement?.dismissible !== false,
      items: (header?.announcement?.items || [])
        .filter((item) => item && item.enabled !== false && item.text)
        .map((item) => ({
          text: item?.text,
          label: item?.label,
          url: item?.link?.url || null,
          newTab: Boolean(item?.link?.newTab),
        })),
    },
    actions: {
      showLanguageSwitcher: header?.actions?.showLanguageSwitcher !== false,
      items: (header?.actions?.items || [])
        .filter((item) => item && item.label && item.url)
        .map((item) => ({
          label: item!.label as string,
          url: item!.url as string,
          appearance: item!.appearance === 'button' ? 'button' : 'link',
        })),
    },
  }
}
