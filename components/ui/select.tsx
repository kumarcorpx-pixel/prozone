"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      data-slot="select"
      className={cn(
        "border-input bg-background text-foreground flex h-9 w-full rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

function SelectOption({ className, ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option data-slot="select-option" className={cn(className)} {...props} />
}

function SelectGroup({ className, ...props }: React.OptgroupHTMLAttributes<HTMLOptGroupElement>) {
  return <optgroup data-slot="select-group" className={cn(className)} {...props} />
}

export { Select, SelectOption, SelectGroup }
