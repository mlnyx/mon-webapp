import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // font-button: CNalytics 브랜드 4단 타이포 중 Button/CTA 전용 (Montserrat)
  // asChild 로 <a>, <div> 에 렌더될 때도 버튼 타이포를 강제하기 위해 명시
  "font-button inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none active:scale-[0.97] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        /* Primary 버튼 — 토큰(bg-primary) 기반. 팔레트 교체 시 자동 반영 */
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:shadow-md hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",

        /* Apple HIG 4 style (design-system.md §10) — 신규 권장 */
        plain: "bg-transparent text-primary hover:bg-primary/5",
        gray: "bg-muted text-foreground hover:bg-muted/80",
        tinted: "bg-primary/10 text-primary hover:bg-primary/15",
        filled: "bg-primary text-primary-foreground hover:bg-primary/90",
        /* brand-gradient — 주요 CTA 전용 (CEO 2026-04-22)
         * 기본은 solid primary, hover 에서 primary→accent 미묘한 그라데이션.
         * 배경 트랜지션을 bg-size 로 구현해 과하지 않게 유지. */
        "brand-gradient":
          "bg-gradient-to-r from-primary via-primary to-primary text-primary-foreground shadow-sm transition-[background-image,box-shadow,transform] duration-300 hover:from-primary hover:via-secondary hover:to-accent hover:shadow-md hover:-translate-y-0.5",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        /* md: Apple body 17 height 40 */
        md: "h-10 px-4 text-[1.0625rem]",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        /* touch: Apple 최소 터치 44px (모바일 전용) */
        touch: "h-11 px-4 text-[1.0625rem]",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
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
  const Comp = asChild ? Slot.Root : "button"

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
