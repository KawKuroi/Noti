'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export function SheetContent({
  children,
  title,
  description,
  footer,
  onClose,
}: {
  children: React.ReactNode
  title: string
  description?: string
  footer?: React.ReactNode
  onClose?: () => void
}) {
  return (
    <DialogPrimitive.Portal>
      {/* Backdrop */}
      <DialogPrimitive.Overlay
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          background: 'rgba(10,10,10,0.18)',
        }}
        className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200"
      />
      {/* Panel */}
      <DialogPrimitive.Content
        onInteractOutside={onClose}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 51,
          width: '520px',
          maxWidth: '100vw',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--line)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 30px 80px -30px rgba(10,10,10,0.18)',
        }}
        className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-200"
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <DialogPrimitive.Title
              style={{ fontSize: '16px', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.3 }}
            >
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description
                className="mono"
                style={{
                  fontSize: '11px',
                  color: 'var(--ink-3)',
                  fontWeight: 500,
                  marginTop: '4px',
                  lineHeight: 1.4,
                }}
              >
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close
            onClick={onClose}
            style={{
              flexShrink: 0,
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-3)',
              background: 'transparent',
              border: '1px solid var(--line)',
              cursor: 'pointer',
              transition: 'color 0.15s ease, border-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--ink)'
              e.currentTarget.style.borderColor = 'var(--ink-4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--ink-3)'
              e.currentTarget.style.borderColor = 'var(--line)'
            }}
          >
            <X size={14} />
            <span className="sr-only">Cerrar</span>
          </DialogPrimitive.Close>
        </div>

        {/* Body — sin scroll propio; el contenido maneja su propio overflow */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>

        {/* Footer fijo */}
        {footer && (
          <div
            style={{
              flexShrink: 0,
              padding: '14px 24px',
              borderTop: '1px solid var(--line)',
              background: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {footer}
          </div>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
