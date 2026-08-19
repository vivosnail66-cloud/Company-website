import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { editorsAndAdmins } from '@/access/roles'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: editorsAndAdmins,
    delete: editorsAndAdmins,
    read: anyone,
    update: editorsAndAdmins,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    slugField({
      localized: true,
      position: undefined,
    }),
  ],
}
