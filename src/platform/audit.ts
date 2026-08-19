import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from 'payload'

type AuditAction = 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'system'

type AuditChanges = Record<string, { after: unknown; before: unknown }>

type AuditWriter = {
  create: (args: {
    collection: 'audit-logs'
    data: Record<string, unknown>
    depth?: number
    context?: Record<string, unknown>
    overrideAccess?: boolean
    req?: PayloadRequest
  }) => Promise<unknown>
}

type AuditContext = {
  disableAudit?: boolean
  disableWebhooks?: boolean
}

type StatusDoc = {
  id?: string | number
  _status?: 'draft' | 'published' | null
  title?: string | null
  name?: string | null
}

const ignoredDiffKeys = new Set(['createdAt', 'updatedAt'])

const getActorID = (req: PayloadRequest) => {
  const user = req.user as { id?: string | number } | null | undefined
  return user?.id
}

const getStatusAction = (doc?: StatusDoc | null, previousDoc?: StatusDoc | null): AuditAction | null => {
  if (doc?._status === 'published' && previousDoc?._status !== 'published') return 'publish'
  if (previousDoc?._status === 'published' && doc?._status !== 'published') return 'unpublish'
  return null
}

const isSerializableScalar = (value: unknown) => {
  return value === null || ['boolean', 'number', 'string', 'undefined'].includes(typeof value)
}

const getAuditDiff = (
  doc?: Record<string, unknown> | null,
  previousDoc?: Record<string, unknown> | null,
): AuditChanges | undefined => {
  if (!doc || !previousDoc) return undefined

  const changes: AuditChanges = {}
  const keys = new Set([...Object.keys(doc), ...Object.keys(previousDoc)])

  keys.forEach((key) => {
    if (ignoredDiffKeys.has(key)) return

    const before = previousDoc[key]
    const after = doc[key]

    if (!isSerializableScalar(before) || !isSerializableScalar(after)) return
    if (before === after) return

    changes[key] = { after, before }
  })

  return Object.keys(changes).length > 0 ? changes : undefined
}

export const writeAuditLog = async ({
  action,
  changes,
  metadata,
  req,
  resourceID,
  resourceType,
  summary,
}: {
  action: AuditAction
  changes?: AuditChanges
  metadata?: Record<string, unknown>
  req: PayloadRequest
  resourceID?: string | number | null
  resourceType: string
  summary?: string
}) => {
  const context = req.context as AuditContext | undefined
  if (context?.disableAudit) return

  const writer = req.payload as unknown as AuditWriter

  await writer.create({
    collection: 'audit-logs',
    data: {
      action,
      actor: getActorID(req),
      changes,
      metadata,
      resourceID: resourceID ? String(resourceID) : undefined,
      resourceType,
      summary,
    },
    depth: 0,
    overrideAccess: true,
    req,
    context: {
      disableAudit: true,
      disableWebhooks: true,
    },
  })
}

export const createCollectionAuditAfterChange = (resourceType: string): CollectionAfterChangeHook => {
  return async ({ doc, operation, previousDoc, req }) => {
    const statusAction = getStatusAction(doc as StatusDoc, previousDoc as StatusDoc)
    const action = statusAction || (operation === 'create' ? 'create' : 'update')

    await writeAuditLog({
      action,
      changes: getAuditDiff(doc as Record<string, unknown>, previousDoc as Record<string, unknown> | undefined),
      metadata: {
        operation,
        previousStatus: (previousDoc as StatusDoc | undefined)?._status,
        status: (doc as StatusDoc)?._status,
      },
      req,
      resourceID: (doc as StatusDoc)?.id,
      resourceType,
      summary: `${resourceType} ${action}`,
    })

    return doc
  }
}

export const createCollectionAuditAfterDelete = (resourceType: string): CollectionAfterDeleteHook => {
  return async ({ doc, req }) => {
    await writeAuditLog({
      action: 'delete',
      req,
      resourceID: (doc as StatusDoc)?.id,
      resourceType,
      summary: `${resourceType} delete`,
    })

    return doc
  }
}

export const createGlobalAuditAfterChange = (resourceType: string): GlobalAfterChangeHook => {
  return async ({ doc, previousDoc, req }) => {
    const statusAction = getStatusAction(doc as StatusDoc, previousDoc as StatusDoc)

    await writeAuditLog({
      action: statusAction || 'update',
      changes: getAuditDiff(doc as Record<string, unknown>, previousDoc as Record<string, unknown> | undefined),
      metadata: {
        previousStatus: (previousDoc as StatusDoc | undefined)?._status,
        status: (doc as StatusDoc)?._status,
      },
      req,
      resourceType,
      summary: `${resourceType} updated`,
    })

    return doc
  }
}
