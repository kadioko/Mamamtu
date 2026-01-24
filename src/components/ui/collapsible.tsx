"use client"

import React, { useState, ReactNode } from "react"

interface CollapsibleProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface CollapsibleTriggerProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  asChild?: boolean
}

interface CollapsibleContentProps {
  children: ReactNode
  className?: string
}

const CollapsibleContext = React.createContext<{
  isOpen: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ children, open = false, onOpenChange }, ref) => {
    const [isOpen, setIsOpen] = useState(open)

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen)
      onOpenChange?.(newOpen)
    }

    return (
      <CollapsibleContext.Provider value={{ isOpen, onOpenChange: handleOpenChange }}>
        <div ref={ref} data-state={isOpen ? "open" : "closed"}>
          {children}
        </div>
      </CollapsibleContext.Provider>
    )
  }
)
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  ({ children, className, asChild, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext)
    
    const handleClick = () => {
      if (context) {
        context.onOpenChange(!context.isOpen)
      }
      props.onClick?.()
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as any, {
        ref,
        onClick: handleClick,
        ...props,
      })
    }

    return (
      <button
        ref={ref}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }
)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
