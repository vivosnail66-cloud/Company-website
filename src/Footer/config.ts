import type { GlobalConfig } from 'payload'

import { editorsAndAdmins } from '@/access/roles'
import { createGlobalAuditAfterChange } from '@/platform/audit'
import { createGlobalWebhookAfterChange } from '@/platform/webhooks'
import { revalidateFooter } from './hooks/revalidateFooter'
import { link } from '@/fields/link'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: editorsAndAdmins,
  },
  admin: {
    group: 'Settings',
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
              fields: [
                {
                  name: 'variant',
                  type: 'select',
                  defaultValue: 'standard',
                  required: true,
                  options: [
                    {
                      label: 'Standard',
                      value: 'standard',
                    },
                    {
                      label: 'Columns',
                      value: 'columns',
                    },
                    {
                      label: 'Minimal',
                      value: 'minimal',
                    },
                  ],
                },
                {
                  name: 'showThemeSelector',
                  type: 'checkbox',
                  defaultValue: true,
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
              fields: [
                {
                  name: 'links',
                  type: 'array',
                  label: 'Footer Links',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    link({
                      appearances: false,
                    }),
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter, createGlobalAuditAfterChange('footer'), createGlobalWebhookAfterChange('footer')],
  },
}
