 'use client'

import * as React from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  FieldValues,
  UseFormReturn,
  Control,
  Path,
  ControllerRenderProps
} from 'react-hook-form'
import { cn } from '@/lib/utils'

export function Form<TFieldValues extends FieldValues = FieldValues>({
  children,
  ...props
}: UseFormReturn<TFieldValues> & {
  children: React.ReactNode;
}) {
  return <FormProvider {...props}>{children}</FormProvider>
}



export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends Path<TFieldValues> = Path<TFieldValues>
>({
  control,
  name,
  render
}: {
  control?: Control<TFieldValues>;
  name: TName;
  render: (props: { field: ControllerRenderProps<TFieldValues, TName> }) => React.ReactElement;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => render({ field })}
    />
  );
}

export const FormItem = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-2', className)} {...props} />
)

export const FormLabel = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('text-sm font-medium', className)} {...props} />
)

export const FormControl = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('', className)} {...props} />
)

export const FormMessage = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  const {
    formState: { errors },
  } = useFormContext()
  // Note: Consumers typically place this under a field within a Controller render
  return (
    <p className={cn('text-sm text-red-500', className)} {...props}>
      {children}
    </p>
  )
}

export const FormDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
)
