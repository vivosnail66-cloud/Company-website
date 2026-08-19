import { Banner } from '@payloadcms/ui/elements/Banner'
import Link from 'next/link'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Gotocosmic CMS</h4>
      </Banner>
      <ul className={`${baseClass}__instructions`}>
        <li>
          <Link href="/admin/settings">Open global settings</Link>
          {' to manage brand, SEO, navigation, tokens, webhooks, and governance.'}
        </li>
        <li>
          <SeedButton />
          {' when you need to initialize or refresh demo content in an allowed environment.'}
        </li>
        <li>
          <Link href="/admin/collections/pages">Manage pages</Link>
          {' or '}
          <Link href="/admin/collections/posts">posts</Link>
          {' through the editorial workflow before publishing.'}
        </li>
      </ul>
    </div>
  )
}

export default BeforeDashboard
