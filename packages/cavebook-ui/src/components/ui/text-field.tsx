import type { InputHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement>

export function TextField({ className, ...props }: TextFieldProps) {
  return <input className={cn('cb-text-field', className)} {...props} />
}
