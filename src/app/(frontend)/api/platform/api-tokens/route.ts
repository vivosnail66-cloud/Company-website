import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { requireAdmin } from '@/platform/auth'

type ApiTokenScope = 'content:read' | 'content:write' | 'media:read' | 'media:write' | 'admin:read'

type ApiTokenCreateBody = {
  expiresAt?: string
  name?: string
  scopes?: ApiTokenScope[]
}

type ApiTokenWriter = {
  create: (args: {
    collection: 'api-tokens'
    data: Record<string, unknown>
    depth?: number
    overrideAccess?: boolean
  }) => Promise<Record<string, unknown>>
}

const allowedScopes: ApiTokenScope[] = ['content:read', 'content:write', 'media:read', 'media:write', 'admin:read']

const normalizeScopes = (scopes?: ApiTokenScope[]) => {
  if (!Array.isArray(scopes)) return null
  const normalized = scopes.filter((scope) => allowedScopes.includes(scope))
  return normalized.length > 0 ? normalized : null
}

export const POST = async (request: Request) => {
  const user = await requireAdmin()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as ApiTokenCreateBody | null
  const scopes = normalizeScopes(body?.scopes)

  if (!body?.name || !scopes) {
    return Response.json({ error: 'name and at least one valid scope are required' }, { status: 400 })
  }

  const payload = (await getPayload({ config: configPromise })) as unknown as ApiTokenWriter
  const token = await payload.create({
    collection: 'api-tokens',
    data: {
      expiresAt: body.expiresAt,
      name: body.name,
      scopes,
      status: 'active',
    },
    depth: 0,
    overrideAccess: true,
  })

  return Response.json({
    token,
  })
}
