import type { HTMLAttributes, ReactNode } from 'react'
import { Badge } from '../ui/badge'
import { Avatar } from '../ui/avatar'
import { cn } from '../../lib/cn'

export type ConversationListItemProps = HTMLAttributes<HTMLButtonElement> & {
  initials: string
  name: string
  preview: string
  meta: string
  active?: boolean
  unread?: string
  icon?: ReactNode
}

export function ConversationListItem({
  className,
  initials,
  name,
  preview,
  meta,
  active = false,
  unread,
  icon,
  ...props
}: ConversationListItemProps) {
  return (
    <button
      className={cn('cb-conversation-item', active && 'is-active', className)}
      type="button"
      {...props}
    >
      <Avatar initials={initials} />
      <div className="cb-conversation-item__body">
        <div className="cb-conversation-item__row">
          <p className="cb-conversation-item__name">{name}</p>
          <span className="cb-conversation-item__meta">{meta}</span>
        </div>
        <div className="cb-conversation-item__row">
          <p className="cb-conversation-item__preview">{preview}</p>
          {unread ? <Badge variant="ember">{unread}</Badge> : icon}
        </div>
      </div>
    </button>
  )
}
