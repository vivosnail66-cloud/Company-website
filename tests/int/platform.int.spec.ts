import { describe, expect, it } from 'vitest'

import { adminsOrSelf, authorsOwnPostsOrEditors, editorsAndAdminsField } from '@/access/roles'
import { getBearerToken } from '@/platform/apiToken'
import { enforceEditorialWorkflow } from '@/platform/workflow'

describe('platform production guards', () => {
  it('requires approved workflow before publishing content', () => {
    expect(() =>
      enforceEditorialWorkflow({
        data: {
          _status: 'published',
          workflow: {
            status: 'review',
          },
        },
        req: {
          context: {},
        },
      } as never),
    ).toThrow('Content must be approved before publishing.')
  })

  it('allows seed imports to bypass workflow explicitly', () => {
    const data = {
      _status: 'published',
      workflow: {
        status: 'draft',
      },
    }

    expect(
      enforceEditorialWorkflow({
        data,
        req: {
          context: {
            disableWorkflow: true,
          },
        },
      } as never),
    ).toEqual(data)
  })

  it('limits non-admin user reads to their own user document', () => {
    const result = adminsOrSelf({
      req: {
        user: {
          id: 42,
          roles: ['viewer'],
        },
      },
    } as never)

    expect(result).toEqual({
      id: {
        equals: 42,
      },
    })
  })

  it('allows admins to read any user document', () => {
    const result = adminsOrSelf({
      req: {
        user: {
          id: 1,
          roles: ['admin'],
        },
      },
    } as never)

    expect(result).toBe(true)
  })

  it('limits authors to posts they authored', () => {
    const result = authorsOwnPostsOrEditors({
      req: {
        user: {
          id: 42,
          roles: ['author'],
        },
      },
    } as never)

    expect(result).toEqual({
      authors: {
        contains: 42,
      },
    })
  })

  it('lets editors manage workflow fields', () => {
    const result = editorsAndAdminsField({
      req: {
        user: {
          id: 7,
          roles: ['editor'],
        },
      },
    } as never)

    expect(result).toBe(true)
  })

  it('extracts bearer API tokens from authorization headers', () => {
    const request = new Request('https://cms.local/api/platform/content', {
      headers: {
        authorization: 'Bearer token-value',
      },
    })

    expect(getBearerToken(request)).toBe('token-value')
  })
})
