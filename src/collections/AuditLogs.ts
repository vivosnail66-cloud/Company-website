import type { CollectionConfig } from 'payload'

import { admins } from '@/access/roles'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: {
    singular: 'Audit Log',
    plural: 'Audit Logs',
  },
  access: {
    create: admins,
    delete: admins,
    read: admins,
    update: admins,
  },
  admin: {
    group: 'Governance',
    useAsTitle: 'action',
    defaultColumns: ['action', 'resourceType', 'resourceID', 'actor', 'createdAt'],
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Create',
          value: 'create',
        },
        {
          label: 'Update',
          value: 'update',
        },
        {
          label: 'Delete',
          value: 'delete',
        },
        {
          label: 'Publish',
          value: 'publish',
        },
        {
          label: 'Unpublish',
          value: 'unpublish',
        },
        {
          label: 'Login',
          value: 'login',
        },
        {
          label: 'Logout',
          value: 'logout',
        },
        {
          label: 'System',
          value: 'system',
        },
      ],
    },
    {
      name: 'actor',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User responsible for the action, when available.',
      },
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
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Structured event metadata. Do not store secrets here.',
      },
    },
    {
      name: 'changes',
      type: 'json',
      admin: {
        description: 'Field-level before/after diff. Sensitive values should be redacted before writing.',
      },
    },
  ],
  timestamps: true,
}
