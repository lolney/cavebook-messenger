import type { ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/cn'

const buttonArtClasses = {
  phone: 'cb-button--asset cb-asset cb-asset--button-phone',
  video: 'cb-button--asset cb-asset cb-asset--button-video',
  more: 'cb-button--asset cb-asset cb-asset--button-more',
  mic: 'cb-button--asset cb-asset cb-asset--button-mic',
  hand: 'cb-button--asset cb-asset cb-asset--button-hand',
  send: 'cb-button--asset cb-asset cb-asset--button-send',
  profile: 'cb-button--asset cb-asset cb-asset--tile-profile',
  mute: 'cb-button--asset cb-asset cb-asset--tile-mute',
  search: 'cb-button--asset cb-asset cb-asset--tile-search',
} as const

const buttonVariants = cva('cb-button', {
  variants: {
    variant: {
      primary: 'cb-button--primary',
      ghost: 'cb-button--ghost',
      utility: 'cb-button--utility',
    },
    size: {
      default: 'cb-button--default',
      icon: 'cb-button--icon',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
})

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    art?: keyof typeof buttonArtClasses
  }

export function Button({
  art,
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), art ? buttonArtClasses[art] : null, className)}
      type={type}
      {...props}
    />
  )
}
