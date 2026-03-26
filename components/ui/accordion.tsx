"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
  openItems: string[]
  toggle: (value: string) => void
  type: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: [],
  toggle: () => {},
  type: "single",
})

function Accordion({
  className,
  type = "single",
  defaultValue,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  collapsible?: boolean
}) {
  const [openItems, setOpenItems] = React.useState<string[]>(
    defaultValue
      ? Array.isArray(defaultValue)
        ? defaultValue
        : [defaultValue]
      : []
  )

  const toggle = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        if (type === "single") {
          return prev.includes(value) ? [] : [value]
        }
        return prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      })
    },
    [type]
  )

  return (
    <AccordionContext.Provider value={{ openItems, toggle, type }}>
      <div data-slot="accordion" className={cn(className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

function AccordionItem({
  className,
  value,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  return (
    <div
      data-slot="accordion-item"
      data-state={undefined}
      className={cn("border-b border-border", className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ value?: string }>, { value })
        }
        return child
      })}
    </div>
  )
}

function AccordionTrigger({
  className,
  children,
  value,
  ...props
}: React.HTMLAttributes<HTMLButtonElement> & { value?: string }) {
  const { openItems, toggle } = React.useContext(AccordionContext)
  const isOpen = value ? openItems.includes(value) : false

  return (
    <h3 className="flex">
      <button
        data-slot="accordion-trigger"
        type="button"
        aria-expanded={isOpen}
        className={cn(
          "flex flex-1 items-center justify-between py-4 text-left text-sm font-medium transition-all hover:underline [&[aria-expanded=true]>svg]:rotate-180",
          className
        )}
        onClick={() => value && toggle(value)}
        {...props}
      >
        {children}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 transition-transform duration-200"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </h3>
  )
}

function AccordionContent({
  className,
  children,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value?: string }) {
  const { openItems } = React.useContext(AccordionContext)
  const isOpen = value ? openItems.includes(value) : false

  if (!isOpen) return null

  return (
    <div
      data-slot="accordion-content"
      className={cn("overflow-hidden text-sm", className)}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
