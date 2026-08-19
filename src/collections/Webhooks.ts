import type { CollectionConfig } from 'payload'

import { admins } from '@/access/roles'
import { createSecretValue, encryptSecret, getSecretPrefix, hashSecret } from '@/platform/secrets'

type WebhookData = {
  encryptedSecret?: string
  generatedSecret?: string
  secretHash?: string
  secretPrefix?: string
}

export const Webhooks: CollectionConfig = {
  slug: 'webhooks',
  labels: {
    singular: 'Webhook',
    plural: 'Webhooks',
  },
  access: {
    create: admins,
    delete: admins,
    read: admins,
    update: admins,
  },
  admin: {
    group: 'Platform',
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'events', 'lastDeliveryStatus', 'updatedAt'],
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
      ],
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'HTTPS endpoint that receives webhook deliveries.',
      },
    },
    {
      name: 'events',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        {
          label: 'Page Published',
          value: 'pages:published',
        },
        {
          label: 'Page Updated',
          value: 'pages:updated',
        },
        {
          label: 'Post Published',
          value: 'posts:published',
        },
        {
          label: 'Post Updated',
          value: 'posts:updated',
        },
        {
          label: 'Media Created',
          value: 'media:created',
        },
        {
          label: 'Navigation Updated',
          value: 'navigation:updated',
        },
      ],
    },
    {
      name: 'generatedSecret',
      type: 'text',
      admin: {
        description: 'Shown only immediately after creation. Copy it now; it is stored encrypted for signing.',
        readOnly: true,
      },
      virtual: true,
    },
    {
      name: 'secretPrefix',
      type: 'text',
      admin: {
        description: 'Non-secret prefix used to identify the signing secret.',
        readOnly: true,
      },
    },
    {
      name: 'secretHash',
      type: 'text',
      admin: {
        description: 'Hash of the signing secret. Never store raw secrets.',
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'encryptedSecret',
      type: 'text',
      admin: {
        description: 'Encrypted signing secret used for webhook signatures.',
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'lastDeliveryStatus',
      type: 'select',
      options: [
        {
          label: 'Success',
          value: 'success',
        },
        {
          label: 'Failed',
          value: 'failed',
        },
        {
          label: 'Pending',
          value: 'pending',
        },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lastDeliveredAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
    },
    {
      name: 'failureCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation !== 'create' || data.encryptedSecret) return data

        const secret = createSecretValue('whsec')
        ;(data as WebhookData).generatedSecret = secret
        data.encryptedSecret = encryptSecret(secret)
        data.secretHash = hashSecret(secret)
        data.secretPrefix = getSecretPrefix(secret)

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation !== 'create') return doc

        return {
          ...doc,
          generatedSecret: (req.data as WebhookData | undefined)?.generatedSecret,
        }
      },
    ],
  },
  timestamps: true,
}
