import * as React from 'react'
import { cn } from '@/lib/utils'

export type ProgressProps = React.ComponentPropsWithoutRef<'progress'> & {
  value?: number
}

export const Progress = React.forwardRef<HTMLProgressElement, React.ComponentPropsWithoutRef<'progress'>>(
  ({ className, value: valueProp = 0, ...props }, ref) => {
    const numeric = typeof valueProp === 'number' ? valueProp : Number(valueProp) || 0
    const clamped = Math.max(0, Math.min(100, numeric))
    return (
      <progress
        ref={ref}
        value={clamped}
        max={100}
        className={cn('h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary', className)}
        {...props}
      />
    )
  }
)
Progress.displayName = 'Progress'
