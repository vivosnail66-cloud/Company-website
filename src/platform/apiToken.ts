import configPromise from '@payload-config'
import { createHash, timingSafeEqual } from 'crypto'
import { getPayload } from 'payload'

type ApiTokenScope = 'content:read' | 'content:write' | 'media:read' | 'media:write' | 'admin:read'

type ApiTokenDoc = {
  id: string | number
  expiresAt?: string | null
  scopes?: ApiTokenScope[] | null
  status?: 'active' | 'disabled' | 'expired' | null
  tokenHash?: string | null
}

type ApiTokenPayload = {
  find: (args: {
    collection: 'api-tokens'
    depth?: number
    limit?: number
    overrideAccess?: boolean
    pagination?: boolean
    where?: Record<string, unknown>
  }) => Promise<{ docs: ApiTokenDoc[] }>
  update: (args: {
    id: string | number
    collection: 'api-tokens'
    data: Record<string, unknown>
    depth?: number
    overrideAccess?: boolean
  }) => Promise<unknown>
}

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

const safeEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export const getBearerToken = (request: Request) => {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return null
  return authorization.slice('Bearer '.length).trim() || null
}

export const verifyApiToken = async ({
  request,
  requiredScope,
}: {
  request: Request
  requiredScope: ApiTokenScope
}) => {
  const token = getBearerToken(request)
  if (!token) return null

  const payload = (await getPayload({ config: configPromise })) as unknown as ApiTokenPayload
  const tokenHash = hashToken(token)

  const { docs } = await payload.find({
    collection: 'api-tokens',
    depth: 0,
    limit: 50,
    overrideAccess: true,
    pagination: false,
    where: {
      status: {
        equals: 'active',
      },
    },
  })

  const matchedToken = docs.find((doc) => doc.tokenHash && safeEqual(doc.tokenHash, tokenHash))
  if (!matchedToken) return null

  if (matchedToken.expiresAt && new Date(matchedToken.expiresAt).getTime() < Date.now()) return null
  if (!matchedToken.scopes?.includes(requiredScope)) return null

  await payload.update({
    id: matchedToken.id,
    collection: 'api-tokens',
    data: {
      lastUsedAt: new Date().toISOString(),
    },
    depth: 0,
    overrideAccess: true,
  })

  return {
    id: matchedToken.id,
    scopes: matchedToken.scopes,
  }
}
