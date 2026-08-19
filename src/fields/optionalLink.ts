import type { Field, GroupField } from 'payload'

type OptionalLinkOptions = {
  name?: string
  label?: string
}

/**
 * Optional link group (all fields optional, `type` defaults to 'custom').
 *
 * Unlike the shared `link()` factory, this field never makes a link required:
 * an empty group stays valid. Use it where a link is nice-to-have (promo
 * panels, menu cards, header CTA) and must not block saving when left
 * untouched.
 */
export const optionalLink = ({ name = 'link', label = 'Link' }: OptionalLinkOptions = {}): Field => {
  const linkResult: GroupField = {
    name,
    type: 'group',
    label,
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        name: 'type',
        type: 'radio',
        admin: {
          layout: 'horizontal',
          width: '50%',
        },
        defaultValue: 'custom',
        options: [
          {
            label: 'Internal link',
            value: 'reference',
          },
          {
            label: 'Custom URL',
            value: 'custom',
          },
        ],
      },
      {
        name: 'newTab',
        type: 'checkbox',
        admin: {
          style: {
            alignSelf: 'flex-end',
          },
          width: '50%',
        },
        label: 'Open in new tab',
      },
      {
        name: 'reference',
        type: 'relationship',
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'reference',
        },
        label: 'Document to link to',
        relationTo: ['pages', 'posts'],
      },
      {
        name: 'url',
        type: 'text',
        localized: true,
        admin: {
          condition: (_, siblingData) => siblingData?.type === 'custom',
        },
        label: 'Custom URL',
      },
      {
        name: 'label',
        type: 'text',
        localized: true,
        label: 'Label',
      },
    ],
  }

  return linkResult
}
