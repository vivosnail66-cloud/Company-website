'use client'

import { toast } from '@payloadcms/ui'
import React, { useCallback, useState } from 'react'

import './index.scss'

type RetryResponse = {
  error?: string
  retried?: number
  results?: Array<{
    deliveryID: string | number
    status: string
    webhookID?: string | number | null
  }>
}

export const WebhookRetryPanel: React.FC = () => {
  const [limit, setLimit] = useState(20)
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<RetryResponse | null>(null)

  const retryDeliveries = useCallback(async () => {
    if (loading) return
    setLoading(true)

    try {
      const response = await fetch('/api/platform/webhooks/retry', {
        body: JSON.stringify({ limit }),
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
      })
      const data = (await response.json()) as RetryResponse

      if (!response.ok) throw new Error(data.error || 'Unable to retry webhook deliveries')

      setLastResult(data)
      toast.success(`Retried ${data.retried || 0} webhook deliveries`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to retry webhook deliveries')
    } finally {
      setLoading(false)
    }
  }, [limit, loading])

  return (
    <section className="platform-webhook-retry">
      <div className="platform-webhook-retry__header">
        <h3>Webhook Retry Worker</h3>
        <p>Retry failed deliveries whose next retry time has arrived.</p>
      </div>
      <div className="platform-webhook-retry__controls">
        <label>
          <span>Limit</span>
          <input
            max={100}
            min={1}
            onChange={(event) => setLimit(Number(event.target.value))}
            type="number"
            value={limit}
          />
        </label>
        <button disabled={loading} onClick={retryDeliveries} type="button">
          {loading ? 'Retrying...' : 'Retry Due Deliveries'}
        </button>
      </div>
      {lastResult ? (
        <div className="platform-webhook-retry__result">
          <strong>{lastResult.retried || 0} deliveries processed</strong>
          {lastResult.results?.length ? (
            <ul>
              {lastResult.results.map((result) => (
                <li key={String(result.deliveryID)}>
                  <span>Delivery {String(result.deliveryID)}</span>
                  <code>{result.status}</code>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export default WebhookRetryPanel
