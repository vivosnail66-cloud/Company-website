import type { Field } from 'payload'

/**
 * Shared "header actions" field group: language switcher + a dynamic list
 * of action links (Log in, Get All Access CTA, or anything else marketing
 * adds later). Actions are an array — empty means nothing renders, no
 * hardcoded defaults.
 */
export const headerActions = (options: { name?: string; label?: string } = {}): Field => {
  const { name = 'actions', label = 'Header Actions' } = options

  return {
    name,
    type: 'group',
    label,
    admin: {
      hideGutter: true,
      description:
        'Right-side actions. The language switcher is a system control; everything else is a dynamic list (add as many as you need, empty list = nothing shown).',
    },
    fields: [
      {
        name: 'showLanguageSwitcher',
        type: 'checkbox',
        defaultValue: true,
        label: 'Show language switcher',
      },
      {
        name: 'items',
        type: 'array',
        label: 'Action links',
        admin: {
          description: 'Each entry renders on the right side (Log in, Get All Access, etc.).',
        },
        fields: [
          {
            name: 'label',
            type: 'text',
            localized: true,
            required: true,
            label: 'Label',
          },
          {
            name: 'url',
            type: 'text',
            required: true,
            label: 'URL',
          },
          {
            name: 'appearance',
            type: 'select',
            defaultValue: 'link',
            options: [
              {
                label: 'Text link',
                value: 'link',
              },
              {
                label: 'Button (primary)',
                value: 'button',
              },
            ],
            label: 'Style',
          },
        ],
      },
    ],
  }
}
