import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { isCronRequest, requireAdmin } from '@/platform/auth'
import { retryDueWebhookDeliveries } from '@/platform/webhooks'

export const POST = async (request: Request) => {
  const canRun = isCronRequest(request) || Boolean(await requireAdmin())
  if (!canRun) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await request.json().catch(() => null)) as { limit?: number } | null
  const limit = Math.min(Math.max(body?.limit || 20, 1), 100)
  const payload = await getPayload({ config: configPromise })
  const requestHeaders = await headers()
  const authResult = await payload.auth({ headers: requestHeaders })
  const results = await retryDueWebhookDeliveries({
    limit,
    req: {
      context: {
        disableAudit: true,
        disableWebhooks: true,
      },
      headers: requestHeaders,
      payload,
      user: authResult.user,
    } as never,
  })

  return Response.json({
    retried: results.length,
    results,
  })
}
