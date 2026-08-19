import clsx from 'clsx'
import React from 'react'

interface Props {
  alt?: string
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  siteName?: string
  size?: 'desktop' | 'mobile'
  src?: string | null
}

const sizeClasses = {
  desktop: 'max-w-[9.375rem] w-full h-[34px]',
  mobile: 'max-w-[7.5rem] w-full h-[28px]',
}

export const Logo = (props: Props) => {
  const {
    alt,
    loading: loadingFromProps,
    priority: priorityFromProps,
    className,
    siteName,
    size = 'desktop',
    src,
  } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  if (!src) {
    return <span className={clsx('text-xl font-semibold tracking-normal', className)}>{siteName || alt}</span>
  }

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt={alt || siteName || 'Site logo'}
      width={193}
      height={34}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx(sizeClasses[size], className)}
      src={src}
    />
  )
}
