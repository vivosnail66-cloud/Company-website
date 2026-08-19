import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { admins, adminsOrSelf, canUpdateRoles } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: admins,
    delete: admins,
    read: adminsOrSelf,
    update: adminsOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      saveToJWT: true,
      defaultValue: ['viewer'],
      required: true,
      access: {
        update: canUpdateRoles,
      },
      admin: {
        position: 'sidebar',
      },
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'Author',
          value: 'author',
        },
        {
          label: 'Viewer',
          value: 'viewer',
        },
      ],
    },
  ],
  timestamps: true,
}
