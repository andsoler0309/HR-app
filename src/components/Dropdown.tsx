'use client'
import { useState, useRef, useEffect } from 'react'

interface DropdownProps {
  trigger: React.ReactNode
  items: Array<{
    label: string | React.ReactNode
    onClick?: () => void
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
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card rounded-md shadow-lg ring-1 ring-card-border border border-card-border">
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.()
                  setIsOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
              >
                {typeof item.label === 'string' ? item.label : item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}