import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const inspectorArtClasses = {
  chatInfo: 'cb-inspector-section--asset cb-asset cb-asset--accordion-chat-info',
  customizeChat:
    'cb-inspector-section--asset cb-asset cb-asset--accordion-customize-chat',
  mediaFiles: 'cb-inspector-section--asset cb-asset cb-asset--accordion-media-files',
  privacySupport:
    'cb-inspector-section--asset cb-asset cb-asset--accordion-privacy-support',
} as const

type InspectorSectionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
  art?: keyof typeof inspectorArtClasses
}

export function InspectorSection({
  art,
  className,
  label,
  type = 'button',
  ...props
}: InspectorSectionProps) {
  return (
    <button
      className={cn('cb-inspector-section', art ? inspectorArtClasses[art] : null, className)}
      type={type}
      {...props}
    >
      <span>{label}</span>
      <span aria-hidden="true">▾</span>
    </button>
  )
}
