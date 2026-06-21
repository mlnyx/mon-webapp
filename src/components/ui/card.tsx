import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Card variant — Liquid Glass 바인딩 (Shrimp #29 Phase 1).
 *
 * 리서치 보고서 docs/design/liquid-glass-research-2026-04-22.md §C·§F 참조.
 *
 *  - `default`     : 기존 유리판 근사 (회귀 방지용 기본값)
 *  - `glass`       : 5겹 Liquid Glass — 히어로·주요 카드
 *  - `glass-subtle`: 약한 블러 — 보조 패널·사이드바 아이템
 *  - `glass-nav`   : 네비게이션 바 전용 — sticky header 에 결합
 *
 * 유지보수성 5원칙 §F:
 *  - 토큰은 role-based (`--glass-surface-*`), 컴포넌트 이름 기반 아님.
 *  - Tailwind arbitrary value 금지 → .glass-* 클래스 위임.
 *  - 신규 GlassCard 컴포넌트 만들지 말 것 → 본 variant 재사용.
 */
const cardVariants = cva(
  "flex flex-col gap-6 py-6 text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "rounded-2xl border border-border/40 bg-card/60 shadow-sm backdrop-blur-lg hover:shadow-md dark:border-white/10 dark:bg-card/40 dark:backdrop-blur-xl",
        glass: "glass-liquid rounded-2xl",
        "glass-subtle": "glass-subtle rounded-2xl",
        "glass-nav": "glass rounded-2xl",
      },
    },
    defaultVariants: { variant: "default" },
  },
)

export type CardVariantProps = VariantProps<typeof cardVariants>

function Card({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & CardVariantProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant ?? "default"}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
