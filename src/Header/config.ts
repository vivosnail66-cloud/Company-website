import type { GlobalConfig } from 'payload'

import { editorsAndAdmins } from '@/access/roles'
import { headerActions } from '@/fields/headerActions'
import { lucideIcon } from '@/fields/lucideIcon'
import { optionalLink } from '@/fields/optionalLink'
import { createGlobalAuditAfterChange } from '@/platform/audit'
import { createGlobalWebhookAfterChange } from '@/platform/webhooks'
import { revalidateHeader } from './hooks/revalidateHeader'

/**
 * Header layout variants — control the arrangement of the three zones
 * (logo / mega menu / actions) on desktop. Content fields are shared;
 * only the rendering order changes.
 */
export const HEADER_VARIANTS = [
  {
    label: 'Logo left · Menu center · Actions right',
    value: 'logo-left',
  },
  {
    label: 'Menu left · Logo center · Actions right',
    value: 'menu-left',
  },
] as const

/**
 * Top-level nav item type — chosen first for every row, before anything
 * else in that row is configurable. Keeps "just a link" and "opens a mega
 * menu" from being configured at the same time.
 */
export const NAV_ITEM_TYPES = [
  { label: 'Link', value: 'link' },
  { label: 'Mega Menu', value: 'megaMenu' },
] as const

/**
 * Mega menu content layout — chosen per item, once that item is a Mega
 * Menu. "Flat" is a single grid of items (optionally with icons);
 * "Grouped" organizes items into titled columns; "Grouped + image" is the
 * same columns with a side image (e.g. a product shot or diagram).
 */
export const MEGA_MENU_LAYOUTS = [
  { label: 'Flat (single grid of items)', value: 'flat' },
  { label: 'Grouped (titled columns)', value: 'grouped' },
  { label: 'Grouped + image (columns with a side image)', value: 'grouped-image' },
] as const

/** Layouts that use `megaMenuGroups` (titled columns) rather than `megaMenuItems`. */
const GROUPED_LAYOUTS = ['grouped', 'grouped-image']

export type HeaderVariant = (typeof HEADER_VARIANTS)[number]['value']
export type NavItemType = (typeof NAV_ITEM_TYPES)[number]['value']
export type MegaMenuLayout = (typeof MEGA_MENU_LAYOUTS)[number]['value']

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
    update: editorsAndAdmins,
  },
  admin: {
    group: 'Settings',
    description: 'Global site header: layout variant, mega menu content, announcement bar and actions.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Layout',
          fields: [
            {
              name: 'layout',
              type: 'group',
              label: 'Layout',
              fields: [
                {
                  name: 'variant',
                  type: 'select',
                  defaultValue: 'logo-left',
                  required: true,
                  options: HEADER_VARIANTS as unknown as { label: string; value: string }[],
                },
                {
                  name: 'sticky',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Sticky header (stays on top while scrolling)',
                },
              ],
            },
          ],
        },
        {
          label: 'Navigation',
          fields: [
            {
              name: 'navigation',
              type: 'group',
              label: 'Navigation',
              fields: [
                {
                  name: 'items',
                  type: 'array',
                  label: 'Top-level menu items',
                  admin: {
                    description:
                      'Items shown in the header nav row, in order. One row = one top-level item. Pick "Link" for a plain link (Home, Blog, About…) or "Mega Menu" to configure a dropdown for that item.',
                    initCollapsedState: () => true,
                    components: {
                      RowLabel: '@/Header/RowLabel#NavItemRowLabel',
                    },
                  },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      localized: true,
                      required: true,
                      label: 'Label',
                    },
                    {
                      name: 'type',
                      type: 'radio',
                      label: 'Type',
                      defaultValue: 'link',
                      required: true,
                      options: NAV_ITEM_TYPES as unknown as { label: string; value: string }[],
                      admin: {
                        layout: 'horizontal',
                        description: 'Choose this first — it decides which fields show up below.',
                      },
                    },
                    // --- Type: Link -------------------------------------------------
                    {
                      ...optionalLink({ name: 'link', label: 'Link' }),
                      admin: {
                        hideGutter: true,
                        condition: (_, siblingData) => siblingData?.type !== 'megaMenu',
                      },
                    },
                    // --- Type: Mega Menu ---------------------------------------------
                    {
                      name: 'megaMenuLayout',
                      type: 'select',
                      label: 'Mega menu layout',
                      defaultValue: 'flat',
                      required: true,
                      options: MEGA_MENU_LAYOUTS as unknown as { label: string; value: string }[],
                      admin: {
                        condition: (_, siblingData) => siblingData?.type === 'megaMenu',
                        description:
                          '"Flat" shows one grid of items. "Grouped" organizes items into titled columns.',
                      },
                    },
                    {
                      name: 'megaMenuItems',
                      type: 'array',
                      label: 'Mega menu items',
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.type === 'megaMenu' &&
                          (siblingData?.megaMenuLayout || 'flat') === 'flat',
                        description: 'Flat list of items shown as a single grid (used by the "Flat" layout).',
                      },
                      fields: [
                        {
                          name: 'label',
                          type: 'text',
                          localized: true,
                          required: true,
                          label: 'Label',
                        },
                        optionalLink({ name: 'link', label: 'Link' }),
                        lucideIcon({ name: 'icon', label: 'Icon' }),
                        {
                          name: 'description',
                          type: 'text',
                          localized: true,
                          label: 'Description',
                        },
                      ],
                    },
                    {
                      name: 'megaMenuGroups',
                      type: 'array',
                      label: 'Mega menu groups',
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.type === 'megaMenu' &&
                          GROUPED_LAYOUTS.includes(siblingData?.megaMenuLayout),
                        description: 'Titled columns of items (used by the "Grouped" layouts).',
                        components: {
                          RowLabel: '@/Header/RowLabel#MegaMenuGroupRowLabel',
                        },
                      },
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                          localized: true,
                          label: 'Group title',
                          admin: {
                            description: 'Section heading (plain text, not clickable).',
                          },
                        },
                        {
                          name: 'items',
                          type: 'array',
                          label: 'Group items',
                          fields: [
                            {
                              name: 'label',
                              type: 'text',
                              localized: true,
                              required: true,
                              label: 'Label',
                            },
                            optionalLink({ name: 'link', label: 'Link' }),
                            lucideIcon({ name: 'icon', label: 'Icon (optional)' }),
                            {
                              name: 'description',
                              type: 'text',
                              localized: true,
                              label: 'Description (optional)',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      name: 'megaMenuImage',
                      type: 'upload',
                      relationTo: 'media',
                      label: 'Side image',
                      admin: {
                        condition: (_, siblingData) =>
                          siblingData?.type === 'megaMenu' && siblingData?.megaMenuLayout === 'grouped-image',
                        description: 'Side image shown next to the columns (used by the "Grouped + image" layout).',
                      },
                    },
                    {
                      name: 'megaMenuPromoCard',
                      type: 'group',
                      label: 'Promo card',
                      admin: {
                        condition: (_, siblingData) => siblingData?.type === 'megaMenu',
                        description: 'Optional highlighted card shown alongside the menu items.',
                      },
                      fields: [
                        {
                          name: 'title',
                          type: 'text',
                          localized: true,
                          label: 'Title',
                        },
                        {
                          name: 'description',
                          type: 'textarea',
                          localized: true,
                          label: 'Description',
                        },
                        {
                          name: 'image',
                          type: 'upload',
                          relationTo: 'media',
                          label: 'Image',
                        },
                        optionalLink({ name: 'link', label: 'Link' }),
                      ],
                    },
                    {
                      name: 'megaMenuFooter',
                      type: 'group',
                      label: 'Footer',
                      admin: {
                        condition: (_, siblingData) => siblingData?.type === 'megaMenu',
                        description: 'Optional bar shown at the bottom of the mega menu (e.g. "View all →").',
                      },
                      fields: [
                        {
                          name: 'text',
                          type: 'text',
                          localized: true,
                          label: 'Text',
                        },
                        optionalLink({ name: 'link', label: 'Link' }),
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Announcement',
          fields: [
            {
              name: 'announcement',
              type: 'group',
              label: 'Announcement bar',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Show announcement bar',
                  admin: {
                    description: 'Marketing banner stacked on top of the header (e.g. promotions).',
                  },
                },
                {
                  name: 'dismissible',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Show close button (per session)',
                },
                {
                  name: 'items',
                  type: 'array',
                  label: 'Announcements',
                  admin: {
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                  fields: [
                    {
                      name: 'enabled',
                      type: 'checkbox',
                      defaultValue: true,
                      label: 'Visible',
                    },
                    {
                      name: 'text',
                      type: 'text',
                      localized: true,
                      required: true,
                      label: 'Message',
                    },
                    {
                      name: 'label',
                      type: 'text',
                      localized: true,
                      label: 'Button label',
                    },
                    optionalLink({ name: 'link', label: 'Button link' }),
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Actions',
          fields: [headerActions()],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateHeader, createGlobalAuditAfterChange('header'), createGlobalWebhookAfterChange('header')],
  },
}

// Re-export the icon field factory so the frontend map can stay in sync
// with the admin dropdown options.
export { LUCIDE_ICON_OPTIONS } from '@/fields/lucideIcon'