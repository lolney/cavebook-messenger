import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const surfaceArtClasses = {
  parchmentPanel: 'cb-surface--asset cb-asset cb-asset--panel-parchment',
  stonePanel: 'cb-surface--asset cb-asset cb-asset--panel-stone',
  portrait: 'cb-surface--asset cb-asset cb-asset--portrait',
  sootTablet: 'cb-surface--asset cb-asset cb-asset--tablet-soot',
  linkTablet: 'cb-surface--asset cb-asset cb-asset--tablet-link',
  workbenchTablet: 'cb-surface--asset cb-asset cb-asset--tablet-workbench',
} as const

const surfaceVariants = cva('cb-surface', {
  variants: {
    variant: {
      parchment: 'cb-surface--parchment',
      stone: 'cb-surface--stone',
      soot: 'cb-surface--soot',
    },
  },
  defaultVariants: {
    variant: 'parchment',
  },
})

export type SurfaceProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof surfaceVariants> & {
    art?: keyof typeof surfaceArtClasses
  }

export function Surface({
  art,
  className,
  variant,
  children,
  ...props
}: SurfaceProps) {
  return (
    <section
      className={cn(surfaceVariants({ variant }), art ? surfaceArtClasses[art] : null, className)}
      {...props}
    >
      {children}
    </section>
  )
}
