'use client'

import { toast } from '@payloadcms/ui'
import React, { useCallback, useState } from 'react'

import './index.scss'

type TokenResponse = {
  token?: {
    generatedToken?: string
    name?: string
    tokenPrefix?: string
  }
  error?: string
}

const scopeOptions = [
  { label: 'Content Read', value: 'content:read' },
  { label: 'Content Write', value: 'content:write' },
  { label: 'Media Read', value: 'media:read' },
  { label: 'Media Write', value: 'media:write' },
  { label: 'Admin Read', value: 'admin:read' },
]

export const ApiTokenCreator: React.FC = () => {
  const [expiresAt, setExpiresAt] = useState('')
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<string[]>(['content:read'])

  const handleScopeChange = useCallback((scope: string) => {
    setScopes((currentScopes) => {
      if (currentScopes.includes(scope)) return currentScopes.filter((currentScope) => currentScope !== scope)
      return [...currentScopes, scope]
    })
  }, [])

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (loading) return

      setLoading(true)
      setGeneratedToken(null)

      try {
        const response = await fetch('/api/platform/api-tokens', {
          body: JSON.stringify({
            expiresAt: expiresAt || undefined,
            name,
            scopes,
          }),
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
          },
          method: 'POST',
        })
        const data = (await response.json()) as TokenResponse

        if (!response.ok || !data.token?.generatedToken) {
          throw new Error(data.error || 'Unable to create API token')
        }

        setGeneratedToken(data.token.generatedToken)
        setName('')
        setExpiresAt('')
        setScopes(['content:read'])
        toast.success('API token created. Copy the token now; it will not be shown again.')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to create API token')
      } finally {
        setLoading(false)
      }
    },
    [expiresAt, loading, name, scopes],
  )

  const copyToken = useCallback(async () => {
    if (!generatedToken) return
    await navigator.clipboard.writeText(generatedToken)
    toast.success('API token copied')
  }, [generatedToken])

  return (
    <section className="platform-token-creator">
      <div className="platform-token-creator__header">
        <h3>Create API Token</h3>
        <p>Generate a scoped token. The raw token is shown once and only a hash is stored.</p>
      </div>
      <form className="platform-token-creator__form" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input onChange={(event) => setName(event.target.value)} required type="text" value={name} />
        </label>
        <label>
          <span>Expires At</span>
          <input onChange={(event) => setExpiresAt(event.target.value)} type="datetime-local" value={expiresAt} />
        </label>
        <fieldset>
          <legend>Scopes</legend>
          <div className="platform-token-creator__scopes">
            {scopeOptions.map((scope) => (
              <label key={scope.value}>
                <input
                  checked={scopes.includes(scope.value)}
                  onChange={() => handleScopeChange(scope.value)}
                  type="checkbox"
                />
                <span>{scope.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button disabled={loading || scopes.length === 0} type="submit">
          {loading ? 'Creating...' : 'Create Token'}
        </button>
      </form>
      {generatedToken ? (
        <div className="platform-token-creator__result">
          <strong>Copy this token now. It will not be shown again.</strong>
          <code>{generatedToken}</code>
          <button onClick={copyToken} type="button">
            Copy Token
          </button>
        </div>
      ) : null}
    </section>
  )
}

export default ApiTokenCreator
