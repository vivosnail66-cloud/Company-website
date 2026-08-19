import { getCachedGlobal } from '@/utilities/getGlobals'
import type { AppLocale } from '@/utilities/locale'
import type { NavItemLike } from '@/utilities/navigation'

type FooterConfigLike = {
  layout?: {
    variant?: 'standard' | 'minimal' | null
    showThemeSelector?: boolean | null
  } | null
  navigation?: {
    links?: { link?: NavItemLike['link'] | null }[] | null
  } | null
}

export type ResolvedFooter = {
  layout: {
    variant: 'standard' | 'minimal'
    showThemeSelector: boolean
  }
  navigation: {
    navItems: NavItemLike[]
  }
}

export const getResolvedFooter = async (locale?: AppLocale): Promise<ResolvedFooter> => {
  const footer = (await getCachedGlobal('footer', 0, locale)()) as FooterConfigLike

  return {
    layout: {
      variant: footer?.layout?.variant || 'standard',
      showThemeSelector: footer?.layout?.showThemeSelector !== false,
    },
    navigation: {
      navItems: (footer?.navigation?.links || []).map(({ link }) => ({ link })),
    },
  }
}
