import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  initials: string
  size?: 'default' | 'large'
}

export function Avatar({
  className,
  initials,
  size = 'default',
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn('cb-avatar', size === 'large' && 'cb-avatar--large', className)}
      {...props}
    >
      {initials}
    </div>
  )
}
