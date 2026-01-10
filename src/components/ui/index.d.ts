// Type definitions for UI components
declare module '@/components/ui/input' {
  import { ComponentType } from 'react';
  import { InputHTMLAttributes } from 'react';
  
  const Input: ComponentType<InputHTMLAttributes<HTMLInputElement>>;
  export default Input;
}

declare module '@/components/ui/button' {
  import { ComponentType, ButtonHTMLAttributes } from 'react';
  
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    isLoading?: boolean;
  }
  
  const Button: ComponentType<ButtonProps>;
  export default Button;
}

declare module '@/components/ui/textarea' {
  import { ComponentType, TextareaHTMLAttributes } from 'react';
  
  const Textarea: ComponentType<TextareaHTMLAttributes<HTMLTextAreaElement>>;
  export default Textarea;
}

declare module '@/components/ui/alert' {
  import { ComponentType, HTMLAttributes } from 'react';
  
  interface AlertProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive';
  }
  
  const Alert: ComponentType<AlertProps>;
  export default Alert;
}

declare module '@/components/ui/label' {
  import { ComponentType, LabelHTMLAttributes } from 'react';
  
  const Label: ComponentType<LabelHTMLAttributes<HTMLLabelElement>>;
  export default Label;
}

declare module '@/components/ui/select' {
  import { ComponentType, SelectHTMLAttributes } from 'react';
  
  interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    items: Array<{ value: string; label: string }>;
    placeholder?: string;
  }
  
  const Select: ComponentType<SelectProps>;
  export { Select };
  
  const SelectTrigger: ComponentType<{ className?: string }>;
  const SelectValue: ComponentType<{ placeholder?: string }>;
  const SelectContent: ComponentType<{ className?: string }>;
  const SelectItem: ComponentType<{ value: string; className?: string }>;
  
  export { SelectTrigger, SelectValue, SelectContent, SelectItem };
}
