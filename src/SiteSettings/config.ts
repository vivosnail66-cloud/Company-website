import type { GlobalConfig } from 'payload'

import { admins } from '@/access/roles'
import { createGlobalAuditAfterChange } from '@/platform/audit'
import { createGlobalWebhookAfterChange } from '@/platform/webhooks'
import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'
import { fallbackSiteSettings } from './defaults'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
    update: admins,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            {
              name: 'brand',
              type: 'group',
              label: 'Brand Identity',
              fields: [
                {
                  name: 'siteName',
                  type: 'text',
                  localized: true,
                  required: true,
                  defaultValue: fallbackSiteSettings.brand.siteName,
                  admin: {
                    description: 'Primary name used in metadata, admin affordances, and fallback logo text.',
                  },
                },
                {
                  name: 'tagline',
                  type: 'text',
                  localized: true,
                  defaultValue: fallbackSiteSettings.brand.tagline,
                },
                {
                  name: 'logo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description: 'Primary site logo. If empty, the frontend falls back to the site name.',
                  },
                },
                {
                  name: 'mobileLogo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'Optional smaller logo for mobile. If empty, the desktop logo is used on all screens.',
                  },
                },
                {
                  name: 'logoAlt',
                  type: 'text',
                  localized: true,
                  defaultValue: fallbackSiteSettings.brand.logoAlt,
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: 'Default SEO',
              fields: [
                {
                  name: 'defaultTitle',
                  type: 'text',
                  localized: true,
                  required: true,
                  defaultValue: fallbackSiteSettings.seo.defaultTitle,
                },
                {
                  name: 'titleSuffix',
                  type: 'text',
                  localized: true,
                  defaultValue: fallbackSiteSettings.seo.titleSuffix,
                  admin: {
                    description: 'Appended to document meta titles when present.',
                  },
                },
                {
                  name: 'defaultDescription',
                  type: 'textarea',
                  localized: true,
                  defaultValue: fallbackSiteSettings.seo.defaultDescription,
                },
                {
                  name: 'defaultOGImage',
                  type: 'upload',
                  relationTo: 'media',
                },
                {
                  name: 'defaultOGImagePath',
                  type: 'text',
                  defaultValue: fallbackSiteSettings.seo.defaultOGImagePath,
                  admin: {
                    description: 'Relative fallback image path used when no uploaded OG image is selected.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Localization',
          fields: [
            {
              name: 'localization',
              type: 'group',
              label: 'Language Settings',
              fields: [
                {
                  name: 'defaultLocale',
                  type: 'select',
                  required: true,
                  defaultValue: fallbackSiteSettings.localization.defaultLocale,
                  options: [
                    {
                      label: 'English',
                      value: 'en',
                    },
                    {
                      label: '中文',
                      value: 'zh',
                    },
                  ],
                },
                {
                  name: 'enabledLocales',
                  type: 'select',
                  hasMany: true,
                  required: true,
                  defaultValue: [...fallbackSiteSettings.localization.enabledLocales],
                  options: [
                    {
                      label: 'English',
                      value: 'en',
                    },
                    {
                      label: '中文',
                      value: 'zh',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Integrations',
          fields: [
            {
              name: 'integrations',
              type: 'group',
              label: 'External Profiles',
              fields: [
                {
                  name: 'githubURL',
                  type: 'text',
                },
                {
                  name: 'supportEmail',
                  type: 'email',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      revalidateSiteSettings,
      createGlobalAuditAfterChange('site-settings'),
      createGlobalWebhookAfterChange('site-settings'),
    ],
  },
}
