import type { Field } from 'payload'

/**
 * Shared lucide icon picker field.
 *
 * Marketing editors pick a preset icon name from a curated dropdown; the
 * frontend maps the stored name to a `lucide-react` component. Adding an
 * icon = append a line here + one line in the frontend icon map.
 *
 * Keep the preset list curated (not all 1.5k lucide icons) so the dropdown
 * stays usable for non-technical editors.
 */
export const LUCIDE_ICON_OPTIONS = [
  { label: 'Rocket', value: 'rocket' },
  { label: 'Zap', value: 'zap' },
  { label: 'Sparkles', value: 'sparkles' },
  { label: 'Star', value: 'star' },
  { label: 'Heart', value: 'heart' },
  { label: 'Shield', value: 'shield' },
  { label: 'Lock', value: 'lock' },
  { label: 'Globe', value: 'globe' },
  { label: 'Users', value: 'users' },
  { label: 'User', value: 'user' },
  { label: 'Award', value: 'award' },
  { label: 'BadgeCheck', value: 'badge-check' },
  { label: 'Briefcase', value: 'briefcase' },
  { label: 'Building', value: 'building' },
  { label: 'Compass', value: 'compass' },
  { label: 'Box', value: 'box' },
  { label: 'Package', value: 'package' },
  { label: 'Layers', value: 'layers' },
  { label: 'Blocks', value: 'blocks' },
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
  { label: 'Table', value: 'table' },
  { label: 'Folder', value: 'folder' },
  { label: 'FileText', value: 'file-text' },
  { label: 'BookOpen', value: 'book-open' },
  { label: 'Code', value: 'code' },
  { label: 'Terminal', value: 'terminal' },
  { label: 'Cpu', value: 'cpu' },
  { label: 'Database', value: 'database' },
  { label: 'Cloud', value: 'cloud' },
  { label: 'Wifi', value: 'wifi' },
  { label: 'Monitor', value: 'monitor' },
  { label: 'Palette', value: 'palette' },
  { label: 'MessageCircle', value: 'message-circle' },
  { label: 'Bell', value: 'bell' },
  { label: 'Mail', value: 'mail' },
  { label: 'Phone', value: 'phone' },
  { label: 'Headphones', value: 'headphones' },
  { label: 'LifeBuoy', value: 'life-buoy' },
  { label: 'ChartLine', value: 'chart-line' },
  { label: 'ChartBar', value: 'chart-bar' },
  { label: 'ChartPie', value: 'chart-pie' },
  { label: 'CreditCard', value: 'credit-card' },
  { label: 'Wallet', value: 'wallet' },
  { label: 'Coins', value: 'coins' },
  { label: 'ShoppingCart', value: 'shopping-cart' },
  { label: 'Tag', value: 'tag' },
  { label: 'Gift', value: 'gift' },
  { label: 'Megaphone', value: 'megaphone' },
  { label: 'Newspaper', value: 'newspaper' },
  { label: 'Calendar', value: 'calendar' },
  { label: 'Clock', value: 'clock' },
  { label: 'MapPin', value: 'map-pin' },
  { label: 'Search', value: 'search' },
  { label: 'Settings', value: 'settings' },
  { label: 'Plug', value: 'plug' },
  { label: 'Link', value: 'link' },
  { label: 'ExternalLink', value: 'external-link' },
  { label: 'Download', value: 'download' },
  { label: 'Upload', value: 'upload' },
  { label: 'Send', value: 'send' },
  { label: 'Repeat', value: 'repeat' },
  { label: 'RefreshCw', value: 'refresh-cw' },
  { label: 'Play', value: 'play' },
  { label: 'Pause', value: 'pause' },
  { label: 'Check', value: 'check' },
  { label: 'Plus', value: 'plus' },
  { label: 'Minus', value: 'minus' },
  { label: 'Eye', value: 'eye' },
  { label: 'Filter', value: 'filter' },
  { label: 'Trash', value: 'trash' },
  { label: 'Edit', value: 'edit' },
  { label: 'Truck', value: 'truck' },
  { label: 'Trophy', value: 'trophy' },
  { label: 'Timer', value: 'timer' },
  { label: 'Wrench', value: 'wrench' },
  { label: 'LogIn', value: 'log-in' },
  { label: 'LogOut', value: 'log-out' },
] as const

export type LucideIconName = (typeof LUCIDE_ICON_OPTIONS)[number]['value']

export const lucideIcon = (options: { name?: string; label?: string; condition?: (data: any, siblingData: any) => boolean } = {}): Field => {
  const { name = 'icon', label = 'Icon', condition } = options

  return {
    name,
    type: 'select',
    label,
    admin: {
      description: 'Pick a preset icon (only used by card-style menu layouts).',
      width: '50%',
      ...(condition ? { condition } : {}),
    },
    options: LUCIDE_ICON_OPTIONS as unknown as { label: string; value: string }[],
  }
}
