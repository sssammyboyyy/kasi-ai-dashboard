import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "relative overflow-hidden bg-primary/85 backdrop-blur-md border border-white/20 text-white shadow-lg shadow-blue-500/20 hover:bg-primary/95 hover:scale-[1.05] hover:shadow-blue-500/50 transition-all duration-300 after:absolute after:inset-0 after:z-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:-translate-x-full hover:after:translate-x-full hover:after:transition-transform hover:after:duration-700 after:content-['']",
        destructive:
          "bg-destructive/85 text-white backdrop-blur-md hover:bg-destructive/90 hover:scale-[1.02] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "relative overflow-hidden border border-input/50 bg-white/40 backdrop-blur-md shadow-sm hover:bg-white/60 hover:text-accent-foreground hover:scale-[1.05] hover:shadow-lg transition-all duration-300 after:absolute after:inset-0 after:z-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:-translate-x-full hover:after:translate-x-full hover:after:transition-transform hover:after:duration-700 after:content-[''] dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "relative overflow-hidden bg-secondary/80 backdrop-blur-md border border-white/20 text-secondary-foreground hover:bg-secondary/90 hover:scale-[1.05] hover:shadow-lg transition-all duration-300 after:absolute after:inset-0 after:z-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:-translate-x-full hover:after:translate-x-full hover:after:transition-transform hover:after:duration-700 after:content-['']",
        ghost:
          "hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-sm dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
