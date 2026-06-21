import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Liquid Glass 카드 (design-system.md §7 + CEO 5겹 근사).
 *
 * - variant="liquid": .glass-liquid (5겹) — 기본 권장
 * - variant="regular": .glass-card (기존 visionOS 스타일, 호환 유지)
 * - variant="subtle": .glass-subtle (얇은 유리, 사이드바용)
 * - noise: Layer 4 (feTurbulence 기반 노이즈 텍스처) 추가
 * - refract: Chromium 전용 feDisplacementMap 굴절 활성화
 *
 * refract 를 true 로 하려면 <LiquidGlassSvgDefs /> 가 DOM 에 마운트되어 있어야 한다.
 * Safari/Firefox 에서는 @supports 조건 실패 → standard backdrop-filter 로 fallback.
 *
 * 사용 예:
 *   <GlassCard variant="liquid" noise className="rounded-2xl p-6">...</GlassCard>
 */
const glassCardVariants = cva("rounded-2xl", {
  variants: {
    variant: {
      liquid: "glass-liquid",
      regular: "glass-card",
      subtle: "glass-subtle",
    },
  },
  defaultVariants: {
    variant: "liquid",
  },
});

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  /** Layer 4 — feTurbulence 노이즈 텍스처 추가 (3% opacity) */
  noise?: boolean;
  /** Chromium 전용 feDisplacementMap 진짜 굴절 활성화 */
  refract?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, noise, refract, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="glass-card"
        className={cn(
          glassCardVariants({ variant }),
          noise && "glass-noise",
          refract && "glass-liquid-refract",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";
