'use client'
import { useState, useRef, useEffect } from 'react'

interface DropdownProps {
  trigger: React.ReactNode
  items: Array<{
    label: string | React.ReactNode
    onClick?: () => void
    icon?: React.ReactNode
    disabled?: boolean
    separator?: boolean
  }>
}

export function Dropdown({ trigger, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg ring-1 ring-card-border border border-card-border z-50">
          <div className="py-1">
            {items.map((item, index) => {
              // Handle separator
              if (item.label === '---' || item.separator) {
                return (
                  <div key={index} className="border-t border-card-border my-1" />
                );
              }

              return (
                <button
                  key={index}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick?.()
                      setIsOpen(false)
                    }
                  }}
                  disabled={item.disabled}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                    item.disabled 
                      ? 'text-text-secondary cursor-not-allowed opacity-50' 
                      : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{typeof item.label === 'string' ? item.label : item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}