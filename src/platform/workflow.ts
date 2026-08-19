import type { CollectionBeforeChangeHook } from 'payload'

type WorkflowStatus = 'draft' | 'review' | 'approved' | 'published'

type WorkflowDoc = {
  _status?: 'draft' | 'published' | null
  workflow?: {
    status?: WorkflowStatus | null
  } | null
}

type WorkflowContext = {
  disableWorkflow?: boolean
}

export const enforceEditorialWorkflow: CollectionBeforeChangeHook = ({ data, req }) => {
  if ((req.context as WorkflowContext | undefined)?.disableWorkflow) return data

  const doc = data as WorkflowDoc
  const workflowStatus = doc.workflow?.status || 'draft'

  if (doc._status === 'published') {
    if (workflowStatus !== 'approved' && workflowStatus !== 'published') {
      throw new Error('Content must be approved before publishing.')
    }

    return {
      ...data,
      workflow: {
        ...doc.workflow,
        status: 'published',
      },
    }
  }

  if (workflowStatus === 'published') {
    return {
      ...data,
      workflow: {
        ...doc.workflow,
        status: 'approved',
      },
    }
  }

  return data
}
