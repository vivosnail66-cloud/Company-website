import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

import { decryptSecret, signWebhookPayload } from './secrets'

type WebhookEvent =
  | 'pages:published'
  | 'pages:updated'
  | 'posts:published'
  | 'posts:updated'
  | 'media:created'
  | 'media:updated'
  | 'navigation:updated'
  | 'site-settings:updated'
  | 'header:updated'
  | 'footer:updated'

type WebhookDoc = {
  encryptedSecret?: string | null
  events?: WebhookEvent[] | null
  id: string | number
  status?: 'active' | 'disabled' | null
  url?: string | null
}

type WebhookDeliveryDoc = {
  attempts?: number | null
  event?: WebhookEvent | string | null
  id: string | number
  requestBody?: Record<string, unknown> | null
  resourceID?: string | null
  resourceType?: string | null
  webhook?: string | number | WebhookDoc | null
}

type DeliveryPayload = {
  create: (args: {
    collection: 'webhook-deliveries'
    data: Record<string, unknown>
    depth?: number
    overrideAccess?: boolean
    req?: PayloadRequest
    context?: Record<string, unknown>
  }) => Promise<unknown>
  find: (args: {
    collection: 'webhooks' | 'webhook-deliveries'
    depth?: number
    limit?: number
    overrideAccess?: boolean
    pagination?: boolean
    where?: Record<string, unknown>
  }) => Promise<{ docs: Array<WebhookDoc | WebhookDeliveryDoc> }>
  update: (args: {
    id: string | number
    collection: 'webhooks' | 'webhook-deliveries'
    data: Record<string, unknown>
    depth?: number
    overrideAccess?: boolean
    req?: PayloadRequest
    context?: Record<string, unknown>
  }) => Promise<unknown>
}

type PlatformContext = {
  disableAudit?: boolean
  disableWebhooks?: boolean
}

type StatusDoc = {
  id?: string | number
  _status?: 'draft' | 'published' | null
  title?: string | null
  name?: string | null
}

const getCollectionEvent = ({
  collection,
  doc,
  operation,
}: {
  collection: string
  doc?: StatusDoc | null
  operation: 'create' | 'update' | 'delete'
}): WebhookEvent | null => {
  if (collection === 'pages') return doc?._status === 'published' ? 'pages:published' : 'pages:updated'
  if (collection === 'posts') return doc?._status === 'published' ? 'posts:published' : 'posts:updated'
  if (collection === 'media') return operation === 'create' ? 'media:created' : 'media:updated'

  return null
}

const getGlobalEvent = (global: string): WebhookEvent | null => {
  if (global === 'site-settings') return 'site-settings:updated'
  if (global === 'header') return 'header:updated'
  if (global === 'footer') return 'footer:updated'
  return null
}

const getNextRetryAt = (attempts = 1) => new Date(Date.now() + Math.min(60, 5 * attempts) * 60 * 1000).toISOString()

const safeResponseBody = async (response: Response) => {
  const body = await response.text().catch(() => '')
  return body.slice(0, 2000)
}

const getWebhookID = (webhook: string | number | WebhookDoc | null | undefined) => {
  if (!webhook) return null
  return typeof webhook === 'object' ? webhook.id : webhook
}

export const deliverWebhook = async ({
  attempts = 0,
  deliveryID,
  event,
  requestBody,
  resourceID,
  resourceType,
  req,
  webhook,
}: {
  attempts?: number
  deliveryID?: string | number
  event: string
  requestBody: Record<string, unknown>
  resourceID?: string | number | null
  resourceType: string
  req?: PayloadRequest
  webhook: WebhookDoc
}) => {
  const payload = req?.payload as unknown as DeliveryPayload
  if (!webhook.url) return { status: 'skipped' as const }

  const timestamp = new Date().toISOString()
  const body = JSON.stringify(requestBody)
  const signingSecret = webhook.encryptedSecret ? decryptSecret(webhook.encryptedSecret) : undefined
  const signature = signingSecret
    ? signWebhookPayload({
        body,
        secret: signingSecret,
        timestamp,
      })
    : undefined

  try {
    const response = await fetch(webhook.url, {
      body,
      headers: {
        'content-type': 'application/json',
        'x-gotocosmic-event': event,
        'x-gotocosmic-signature': signature || '',
        'x-gotocosmic-timestamp': timestamp,
      },
      method: 'POST',
    })
    const responseBody = await safeResponseBody(response)
    const status = response.ok ? 'success' : 'failed'
    const nextAttempts = attempts + 1
    const deliveryData = {
      attempts: nextAttempts,
      event,
      nextRetryAt: response.ok ? undefined : getNextRetryAt(nextAttempts),
      requestBody,
      resourceID: resourceID ? String(resourceID) : undefined,
      resourceType,
      responseBody,
      responseStatus: response.status,
      status,
      webhook: webhook.id,
    }

    if (deliveryID) {
      await payload.update({
        id: deliveryID,
        collection: 'webhook-deliveries',
        data: deliveryData,
        depth: 0,
        overrideAccess: true,
        req,
        context: {
          disableAudit: true,
          disableWebhooks: true,
        },
      })
    } else {
      await payload.create({
        collection: 'webhook-deliveries',
        data: deliveryData,
        depth: 0,
        overrideAccess: true,
        req,
        context: {
          disableAudit: true,
          disableWebhooks: true,
        },
      })
    }

    await payload.update({
      id: webhook.id,
      collection: 'webhooks',
      data: {
        failureCount: response.ok ? 0 : nextAttempts,
        lastDeliveredAt: new Date().toISOString(),
        lastDeliveryStatus: status,
      },
      depth: 0,
      overrideAccess: true,
      req,
      context: {
        disableAudit: true,
        disableWebhooks: true,
      },
    })

    return { status }
  } catch (error) {
    const nextAttempts = attempts + 1
    const deliveryData = {
      attempts: nextAttempts,
      error: error instanceof Error ? error.message : 'Webhook delivery failed',
      event,
      nextRetryAt: getNextRetryAt(nextAttempts),
      requestBody,
      resourceID: resourceID ? String(resourceID) : undefined,
      resourceType,
      status: 'failed',
      webhook: webhook.id,
    }

    if (deliveryID) {
      await payload.update({
        id: deliveryID,
        collection: 'webhook-deliveries',
        data: deliveryData,
        depth: 0,
        overrideAccess: true,
        req,
        context: {
          disableAudit: true,
          disableWebhooks: true,
        },
      })
    } else {
      await payload.create({
        collection: 'webhook-deliveries',
        data: deliveryData,
        depth: 0,
        overrideAccess: true,
        req,
        context: {
          disableAudit: true,
          disableWebhooks: true,
        },
      })
    }

    await payload.update({
      id: webhook.id,
      collection: 'webhooks',
      data: {
        failureCount: nextAttempts,
        lastDeliveredAt: new Date().toISOString(),
        lastDeliveryStatus: 'failed',
      },
      depth: 0,
      overrideAccess: true,
      req,
      context: {
        disableAudit: true,
        disableWebhooks: true,
      },
    })

    return { status: 'failed' as const }
  }
}

export const dispatchWebhooks = async ({
  event,
  payload,
  req,
  resourceID,
  resourceType,
}: {
  event: WebhookEvent
  payload?: Record<string, unknown>
  req: PayloadRequest
  resourceID?: string | number | null
  resourceType: string
}) => {
  const context = req.context as PlatformContext | undefined
  if (context?.disableWebhooks) return

  const webhookPayload = req.payload as unknown as DeliveryPayload
  const { docs } = await webhookPayload.find({
    collection: 'webhooks',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          status: {
            equals: 'active',
          },
        },
        {
          events: {
            contains: event,
          },
        },
      ],
    },
  })

  await Promise.all(
    (docs as WebhookDoc[]).map(async (webhook) => {
      const timestamp = new Date().toISOString()
      await webhookPayload.create({
        collection: 'webhook-deliveries',
        data: {
          attempts: 0,
          event,
          nextRetryAt: new Date().toISOString(),
          requestBody: {
            event,
            payload,
            resourceID: resourceID ? String(resourceID) : undefined,
            resourceType,
            timestamp,
          },
          resourceID: resourceID ? String(resourceID) : undefined,
          resourceType,
          status: 'queued',
          webhook: webhook.id,
        },
        depth: 0,
        overrideAccess: true,
        req,
        context: {
          disableAudit: true,
          disableWebhooks: true,
        },
      })
    }),
  )
}

export const retryDueWebhookDeliveries = async ({
  limit = 20,
  req,
}: {
  limit?: number
  req: PayloadRequest
}) => {
  const payload = req.payload as unknown as DeliveryPayload
  const { docs } = await payload.find({
    collection: 'webhook-deliveries',
    depth: 1,
    limit,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        {
          or: [
            {
              status: {
                equals: 'queued',
              },
            },
            {
              status: {
                equals: 'failed',
              },
            },
          ],
        },
        {
          nextRetryAt: {
            less_than_equal: new Date().toISOString(),
          },
        },
      ],
    },
  })

  const results = await Promise.all(
    (docs as WebhookDeliveryDoc[]).map(async (delivery) => {
      const webhook = typeof delivery.webhook === 'object' ? delivery.webhook : null
      const webhookID = getWebhookID(delivery.webhook)

      if (!webhook || webhook.status !== 'active') {
        return {
          deliveryID: delivery.id,
          status: 'skipped',
          webhookID,
        }
      }

      const result = await deliverWebhook({
        attempts: delivery.attempts || 0,
        deliveryID: delivery.id,
        event: delivery.event || 'unknown',
        requestBody: delivery.requestBody || {},
        resourceID: delivery.resourceID,
        resourceType: delivery.resourceType || 'unknown',
        req,
        webhook,
      })

      return {
        deliveryID: delivery.id,
        status: result.status,
        webhookID,
      }
    }),
  )

  return results
}

export const createCollectionWebhookAfterChange = (collection: string): CollectionAfterChangeHook => {
  return async ({ doc, operation, req }) => {
    const event = getCollectionEvent({ collection, doc: doc as StatusDoc, operation })
    if (!event) return doc

    await dispatchWebhooks({
      event,
      payload: {
        operation,
        status: (doc as StatusDoc)?._status,
      },
      req,
      resourceID: (doc as StatusDoc)?.id,
      resourceType: collection,
    })

    return doc
  }
}

export const createCollectionWebhookAfterDelete = (collection: string): CollectionAfterDeleteHook => {
  return async ({ doc, req }) => {
    const event = getCollectionEvent({ collection, doc: doc as StatusDoc, operation: 'delete' })
    if (!event) return doc

    await dispatchWebhooks({
      event,
      payload: {
        operation: 'delete',
      },
      req,
      resourceID: (doc as StatusDoc)?.id,
      resourceType: collection,
    })

    return doc
  }
}

export const createGlobalWebhookAfterChange = (global: string): GlobalAfterChangeHook => {
  return async ({ doc, req }) => {
    const event = getGlobalEvent(global)
    if (!event) return doc

    await dispatchWebhooks({
      event,
      payload: {
        operation: 'update',
      },
      req,
      resourceType: global,
    })

    return doc
  }
}
