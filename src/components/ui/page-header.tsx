import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string | null
  icon?: ReactNode
  iconColor?: string
  action?: ReactNode
}

export function PageHeader({
  title,
  subtitle,
  icon,
  iconColor,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="w-[46px] h-[46px] rounded-[12px] flex items-center justify-center shrink-0"
            style={{
              backgroundColor: iconColor
                ? `color-mix(in oklab, ${iconColor} 14%, transparent)`
                : 'var(--line)',
              color: iconColor || 'var(--ink)',
            }}
          >
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-[30px] font-medium tracking-tight text-(--ink) leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[14.5px] text-(--ink-2) mt-0.5 leading-normal">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
