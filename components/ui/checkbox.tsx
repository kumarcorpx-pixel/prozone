"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function Checkbox({
  className,
  checked: controlledChecked,
  defaultChecked = false,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked)
  const checked = controlledChecked ?? uncontrolledChecked

  const handleToggle = () => {
    const next = !checked
    if (controlledChecked === undefined) setUncontrolledChecked(next)
    onCheckedChange?.(next)
  }

  return (
    <button
      data-slot="checkbox"
      type="button"
      role="checkbox"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "peer size-4 shrink-0 rounded-[4px] border border-primary shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary text-primary-foreground" : "bg-background",
        className
      )}
      onClick={handleToggle}
      {...props}
    >
      {checked && (
        <span className="flex items-center justify-center text-current">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
      )}
    </button>
  )
}

export { Checkbox }
