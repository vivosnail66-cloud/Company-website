import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { hasRole } from '@/access/roles'

type UserWithRoles = {
  roles?: Array<'admin' | 'editor' | 'author' | 'viewer'> | null
}

export const getAuthenticatedUser = async () => {
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const { user } = await payload.auth({ headers: requestHeaders })

  return user
}

export const requireAdmin = async () => {
  const user = await getAuthenticatedUser()
  if (!hasRole(user as UserWithRoles | null | undefined, ['admin'])) return null
  return user
}

export const isCronRequest = (request: Request) => {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}
