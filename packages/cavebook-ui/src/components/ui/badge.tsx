import type { HTMLAttributes, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const badgeVariants = cva('cb-badge', {
  variants: {
    variant: {
      default: 'cb-badge--default',
      stone: 'cb-badge--stone',
      ember: 'cb-badge--ember',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    icon?: ReactNode
  }

export function Badge({ className, icon, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {icon ? <span className="cb-badge__icon">{icon}</span> : null}
      <span>{children}</span>
    </span>
  )
}
