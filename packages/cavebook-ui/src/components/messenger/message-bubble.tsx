import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type MessageBubbleProps = HTMLAttributes<HTMLElement> & {
  author: string
  side?: 'incoming' | 'outgoing'
  ornament?: ReactNode
}

export function MessageBubble({
  className,
  author,
  side = 'incoming',
  ornament,
  children,
  ...props
}: MessageBubbleProps) {
  return (
    <article className={cn('cb-message', `cb-message--${side}`, className)} {...props}>
      <p className="cb-message__author">{author}</p>
      <div className="cb-message__bubble">
        <div className="cb-message__content">{children}</div>
        {ornament ? <span className="cb-message__ornament">{ornament}</span> : null}
      </div>
    </article>
  )
}
