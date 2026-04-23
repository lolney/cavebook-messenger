import { useState, type ChangeEvent, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react'
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
  value?: string
  onValueChange?: (value: string) => void
  onSend?: (value: string) => void
  sendDisabled?: boolean
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
  value,
  onValueChange,
  onSend,
  sendDisabled = false,
  ...props
}: MessengerComposerProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState('')
  const currentValue = value ?? uncontrolledValue

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    if (value === undefined) {
      setUncontrolledValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  const handleSend = () => {
    const nextValue = currentValue.trim()
    if (!nextValue || sendDisabled) {
      return
    }

    onSend?.(nextValue)
    if (value === undefined) {
      setUncontrolledValue('')
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

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
        value={currentValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <Button
        variant={illustrated ? undefined : 'primary'}
        art={illustrated ? 'send' : undefined}
        size="icon"
        aria-label="Send"
        disabled={sendDisabled || !currentValue.trim()}
        onClick={handleSend}
      >
        {action}
      </Button>
    </div>
  )
}
