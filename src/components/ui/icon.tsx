import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 디자인 시스템 표준 아이콘 래퍼 (design-system.md §12).
 *
 * - strokeWidth 1.75 강제 (Lucide 기본 2.0 → SF Symbols 느낌에 근접)
 * - 8pt 그리드 사이즈: 16 / 20 / 24 / 28 / 32
 * - currentColor 기본 (부모 텍스트 색상 따름)
 * - 장식 아이콘은 자동 aria-hidden, label 주면 aria-label 로 승격
 */
export type IconSize = 16 | 20 | 24 | 28 | 32;

interface IconProps {
  /** Lucide React 컴포넌트 */
  icon: LucideIcon;
  /** 픽셀 단위 사이즈 (design-system.md §12.2) */
  size?: IconSize;
  /** 추가 Tailwind 클래스 */
  className?: string;
  /**
   * 접근성 라벨. 제공하면 aria-label, 없으면 aria-hidden 으로 처리한다.
   * 아이콘만 있는 버튼이라면 반드시 지정 (C4 체크리스트).
   */
  label?: string;
}

export function Icon({
  icon: LucideIconCmp,
  size = 20,
  className,
  label,
}: IconProps) {
  const isDecorative = label === undefined;

  return (
    <LucideIconCmp
      size={size}
      strokeWidth={1.75}
      className={cn("shrink-0", className)}
      aria-label={isDecorative ? undefined : label}
      aria-hidden={isDecorative ? true : undefined}
      role={isDecorative ? undefined : "img"}
    />
  );
}
