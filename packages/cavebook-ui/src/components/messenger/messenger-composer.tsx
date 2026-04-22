import type { HTMLAttributes, ReactNode } from 'react'
import { Button } from '../ui/button'
import { TextField } from '../ui/text-field'
import { cn } from '../../lib/cn'

export type MessengerComposerProps = HTMLAttributes<HTMLDivElement> & {
  leading?: ReactNode
  secondary?: ReactNode
  action: ReactNode
  placeholder?: string
  fieldName?: string
  fieldId?: string
  illustrated?: boolean
}

export function MessengerComposer({
  className,
  leading,
  secondary,
  action,
  placeholder = 'Scratch a message into the clay...',
  fieldName = 'message',
  fieldId = 'message',
  illustrated = false,
  ...props
}: MessengerComposerProps) {
  return (
    <div className={cn('cb-composer', illustrated && 'cb-composer--asset', className)} {...props}>
      <div className="cb-composer__actions">
        {leading ? (
          <Button
            variant={illustrated ? undefined : 'ghost'}
            art={illustrated ? 'mic' : undefined}
            size="icon"
            aria-label="Primary composer action"
          >
            {leading}
          </Button>
        ) : null}
        {secondary ? (
          <Button
            variant={illustrated ? undefined : 'ghost'}
            art={illustrated ? 'hand' : undefined}
            size="icon"
            aria-label="Secondary composer action"
          >
            {secondary}
          </Button>
        ) : null}
      </div>
      <TextField
        id={fieldId}
        name={fieldName}
        aria-label="Message"
        placeholder={placeholder}
      />
      <Button
        variant={illustrated ? undefined : 'primary'}
        art={illustrated ? 'send' : undefined}
        size="icon"
        aria-label="Send"
      >
        {action}
      </Button>
    </div>
  )
}
