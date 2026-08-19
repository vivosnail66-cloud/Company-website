import React from 'react'

import './index.scss'

const settingsSections = [
  {
    title: 'Site Chrome',
    description: 'Brand, logo, SEO defaults, footer variants, and navigation menus.',
    links: [
      { label: 'Site Settings', href: '/admin/globals/site-settings' },
      { label: 'Header', href: '/admin/globals/header' },
      { label: 'Footer', href: '/admin/globals/footer' },

    ],
  },
  {
    title: 'Localization',
    description: 'Manage enabled locales and localized content fields.',
    links: [
      { label: 'Language Settings', href: '/admin/globals/site-settings' },
      { label: 'Pages', href: '/admin/collections/pages' },
      { label: 'Posts', href: '/admin/collections/posts' },
    ],
  },
  {
    title: 'Platform Access',
    description: 'Users, roles, API tokens, and scoped external API access.',
    links: [
      { label: 'Users', href: '/admin/collections/users' },
      { label: 'API Tokens', href: '/admin/collections/api-tokens' },
    ],
  },
  {
    title: 'Integrations',
    description: 'Webhook endpoints, retry deliveries, and event delivery logs.',
    links: [
      { label: 'Webhooks', href: '/admin/collections/webhooks' },
      { label: 'Webhook Deliveries', href: '/admin/collections/webhook-deliveries' },
    ],
  },
  {
    title: 'Governance',
    description: 'Audit trails and editorial workflow state across content.',
    links: [
      { label: 'Audit Logs', href: '/admin/collections/audit-logs' },
      { label: 'Pages Workflow', href: '/admin/collections/pages' },
      { label: 'Posts Workflow', href: '/admin/collections/posts' },
    ],
  },
]

const SettingsHub: React.FC = () => {
  return (
    <main className="settings-hub">
      <header className="settings-hub__header">
        <p>Administration</p>
        <h1>Global Settings</h1>
      </header>
      <section className="settings-hub__grid">
        {settingsSections.map((section) => (
          <article className="settings-hub__section" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.description}</p>
            <div className="settings-hub__links">
              {section.links.map((link) => (
                <a href={link.href} key={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default SettingsHub
