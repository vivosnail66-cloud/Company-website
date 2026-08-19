'use client'

import type { RowLabelProps } from '@payloadcms/ui'
import type { FC } from 'react'
import { useRowLabel } from '@payloadcms/ui'

type LocalizedText = string | Record<string, string | undefined> | undefined

type NavItemRow = {
  label?: LocalizedText
  type?: string
  megaMenuLayout?: string
}

type MegaMenuGroupRow = {
  title?: LocalizedText
  items?: unknown[]
}

const getText = (value: LocalizedText): string | undefined => {
  if (typeof value === 'string') return value
  if (!value) return undefined

  return Object.values(value).find((item): item is string => Boolean(item))
}

export const NavItemRowLabel: FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<NavItemRow>()
  const label = getText(data?.label)
  const type = data?.type === 'megaMenu' ? 'Mega menu' : 'Link'

  return label || `Nav item ${(rowNumber ?? 0) + 1} (${type})`
}

export const MegaMenuGroupRowLabel: FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<MegaMenuGroupRow>()
  const title = getText(data?.title)
  const count = Array.isArray(data?.items) ? data.items.length : 0

  return title || `Group ${(rowNumber ?? 0) + 1}${count ? ` (${count} items)` : ''}`
}