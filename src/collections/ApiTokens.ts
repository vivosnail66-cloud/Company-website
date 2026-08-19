import type { CollectionConfig } from 'payload'

import { admins } from '@/access/roles'
import { createSecretValue, getSecretPrefix, hashSecret } from '@/platform/secrets'

type ApiTokenData = {
  generatedToken?: string
  tokenHash?: string
  tokenPrefix?: string
}

export const ApiTokens: CollectionConfig = {
  slug: 'api-tokens',
  labels: {
    singular: 'API Token',
    plural: 'API Tokens',
  },
  access: {
    create: admins,
    delete: admins,
    read: admins,
    update: admins,
  },
  admin: {
    group: 'Platform',
    components: {
      beforeList: ['@/components/Admin/ApiTokenCreator#ApiTokenCreator'],
    },
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'scopes', 'lastUsedAt', 'expiresAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Disabled',
          value: 'disabled',
        },
        {
          label: 'Expired',
          value: 'expired',
        },
      ],
    },
    {
      name: 'generatedToken',
      type: 'text',
      admin: {
        description: 'Shown only immediately after creation. Copy it now; it is never stored in plain text.',
        readOnly: true,
      },
      virtual: true,
    },
    {
      name: 'tokenPrefix',
      type: 'text',
      admin: {
        description: 'Non-secret prefix shown to identify the token after creation.',
        readOnly: true,
      },
    },
    {
      name: 'tokenHash',
      type: 'text',
      required: true,
      admin: {
        description: 'Hash of the token. Never store raw API tokens.',
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'scopes',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        {
          label: 'Content Read',
          value: 'content:read',
        },
        {
          label: 'Content Write',
          value: 'content:write',
        },
        {
          label: 'Media Read',
          value: 'media:read',
        },
        {
          label: 'Media Write',
          value: 'media:write',
        },
        {
          label: 'Admin Read',
          value: 'admin:read',
        },
      ],
    },
    {
      name: 'expiresAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'lastUsedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation !== 'create' || data.tokenHash) return data

        const token = createSecretValue('gcos')
        ;(data as ApiTokenData).generatedToken = token
        data.tokenHash = hashSecret(token)
        data.tokenPrefix = getSecretPrefix(token)

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation !== 'create') return doc

        return {
          ...doc,
          generatedToken: (req.data as ApiTokenData | undefined)?.generatedToken,
        }
      },
    ],
  },
  timestamps: true,
}
