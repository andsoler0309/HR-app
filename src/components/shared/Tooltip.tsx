'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  type?: 'info' | 'help' | 'warning';
  children: React.ReactNode;
  className?: string;
}

export default function Tooltip({ 
  content, 
  position = 'top', 
  trigger = 'hover',
  type = 'info',
  children, 
  className = '' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const getIcon = () => {
    switch (type) {
      case 'help':
        return <HelpCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'help':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-200';
      default:
        return 'bg-white border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200';
    }
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 12;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - padding;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + padding;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left - tooltipRect.width - padding;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + padding;
        break;
    }

    // Ensure tooltip stays within viewport
    const margin = 16;
    if (left < margin) left = margin;
    if (left + tooltipRect.width > window.innerWidth - margin) {
      left = window.innerWidth - tooltipRect.width - margin;
    }
    if (top < margin) {
      // If tooltip would go above viewport, position it below instead
      top = triggerRect.bottom + padding;
    }
    if (top + tooltipRect.height > window.innerHeight - margin) {
      // If tooltip would go below viewport, position it above instead
      top = triggerRect.top - tooltipRect.height - padding;
      // If still not enough space, position it at top of viewport
      if (top < margin) {
        top = margin;
      }
    }

    setTooltipPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  const tooltip = isVisible && typeof document !== 'undefined' && createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className={`fixed z-[60] px-4 py-3 text-sm rounded-lg shadow-xl border max-w-sm ${getTypeStyles()}`}
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-0.5">
              {getIcon()}
            </div>
            <div>{content}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      <div
        ref={triggerRef}
        className={`inline-block ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </div>
      {tooltip}
    </>
  );
}

// Helper component for help icons
export function HelpIcon({ content, className = '' }: { content: string; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  
  console.log('HelpIcon content:', content); // Debug log
  
  if (!content) {
    console.log('No content provided to HelpIcon'); // Debug log
    return null;
  }
  
  return (
    <div className={`relative inline-block ${className}`}>
      <button 
        type="button"
        className="text-text-secondary hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded p-1"
        onMouseEnter={() => {
          console.log('Mouse enter, showing tooltip'); // Debug log
          setIsVisible(true);
        }}
        onMouseLeave={() => {
          console.log('Mouse leave, hiding tooltip'); // Debug log
          setIsVisible(false);
        }}
        onClick={() => setIsVisible(!isVisible)}
      >
        <HelpCircle className="h-4 w-4" />
      </button>
      
      {isVisible && (
        <div className="absolute z-[9999] right-0 top-6 w-64 px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-lg text-gray-800 pointer-events-none">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>{content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
