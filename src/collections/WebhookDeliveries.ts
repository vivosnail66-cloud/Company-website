import type { CollectionConfig } from 'payload'

import { admins } from '@/access/roles'

export const WebhookDeliveries: CollectionConfig = {
  slug: 'webhook-deliveries',
  labels: {
    singular: 'Webhook Delivery',
    plural: 'Webhook Deliveries',
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
      beforeList: ['@/components/Admin/WebhookRetryPanel#WebhookRetryPanel'],
    },
    useAsTitle: 'event',
    defaultColumns: ['event', 'webhook', 'status', 'attempts', 'nextRetryAt', 'createdAt'],
  },
  fields: [
    {
      name: 'webhook',
      type: 'relationship',
      relationTo: 'webhooks' as never,
      required: true,
    },
    {
      name: 'event',
      type: 'text',
      required: true,
    },
    {
      name: 'resourceType',
      type: 'text',
      required: true,
    },
    {
      name: 'resourceID',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        {
          label: 'Queued',
          value: 'queued',
        },
        {
          label: 'Pending',
          value: 'pending',
        },
        {
          label: 'Success',
          value: 'success',
        },
        {
          label: 'Failed',
          value: 'failed',
        },
      ],
    },
    {
      name: 'attempts',
      type: 'number',
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'nextRetryAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'requestBody',
      type: 'json',
      admin: {
        description: 'Payload sent to the webhook endpoint.',
      },
    },
    {
      name: 'responseStatus',
      type: 'number',
      min: 100,
      max: 599,
    },
    {
      name: 'responseBody',
      type: 'textarea',
    },
    {
      name: 'error',
      type: 'textarea',
    },
  ],
  timestamps: true,
}
