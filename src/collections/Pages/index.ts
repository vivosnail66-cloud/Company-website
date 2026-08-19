import type { CollectionConfig } from 'payload'

import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { editorsAndAdmins, editorsAndAdminsField } from '@/access/roles'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FeatureGrid } from '../../blocks/FeatureGrid/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'
import { createCollectionAuditAfterChange, createCollectionAuditAfterDelete } from '@/platform/audit'
import { createCollectionWebhookAfterChange, createCollectionWebhookAfterDelete } from '@/platform/webhooks'
import { enforceEditorialWorkflow } from '@/platform/workflow'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: editorsAndAdmins,
    delete: editorsAndAdmins,
    read: authenticatedOrPublished,
    update: editorsAndAdmins,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, Archive, FormBlock, FeatureGrid],
              localized: true,
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'workflow',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'status',
          type: 'select',
          access: {
            update: editorsAndAdminsField,
          },
          defaultValue: 'draft',
          options: [
            {
              label: 'Draft',
              value: 'draft',
            },
            {
              label: 'Review',
              value: 'review',
            },
            {
              label: 'Approved',
              value: 'approved',
            },
            {
              label: 'Published',
              value: 'published',
            },
          ],
        },
        {
          name: 'reviewer',
          type: 'relationship',
          access: {
            update: editorsAndAdminsField,
          },
          relationTo: 'users',
        },
        {
          name: 'notes',
          type: 'textarea',
          access: {
            update: editorsAndAdminsField,
          },
        },
      ],
    },
    slugField({ localized: true }),
  ],
  hooks: {
    afterChange: [
      revalidatePage,
      createCollectionAuditAfterChange('pages'),
      createCollectionWebhookAfterChange('pages'),
    ],
    beforeChange: [enforceEditorialWorkflow, populatePublishedAt],
    afterDelete: [
      revalidateDelete,
      createCollectionAuditAfterDelete('pages'),
      createCollectionWebhookAfterDelete('pages'),
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
