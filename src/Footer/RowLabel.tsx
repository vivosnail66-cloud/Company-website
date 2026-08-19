'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

type NavRow = {
  link?: {
    label?: string | null
  } | null
}

export const RowLabel: React.FC<RowLabelProps> = () => {
  const data = useRowLabel<NavRow>()

  const label = data?.data?.link?.label
    ? `Nav item ${data.rowNumber !== undefined ? data.rowNumber + 1 : ''}: ${data?.data?.link?.label}`
    : 'Row'

  return <div>{label}</div>
}
