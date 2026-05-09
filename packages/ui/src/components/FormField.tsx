import { Label } from './Label'
import { Input, type InputProps } from './Input'
import { cn } from '../lib/utils'

interface FormFieldProps extends InputProps {
  label: string
  description?: string
}

export function FormField({ label, description, id, className, ...props }: FormFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input id={fieldId} {...props} />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}
