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
        return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-600';
      default:
        return 'bg-card border-card-border text-foreground';
    }
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

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
    const margin = 8;
    if (left < margin) left = margin;
    if (left + tooltipRect.width > window.innerWidth - margin) {
      left = window.innerWidth - tooltipRect.width - margin;
    }
    if (top < margin) top = margin;
    if (top + tooltipRect.height > window.innerHeight - margin) {
      top = window.innerHeight - tooltipRect.height - margin;
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

  const tooltip = isVisible && createPortal(
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.15 }}
        className={`fixed z-50 px-3 py-2 text-sm rounded-lg shadow-lg border max-w-xs ${getTypeStyles()}`}
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
  return (
    <Tooltip content={content} type="help" trigger="hover" className={className}>
      <button className="text-text-secondary hover:text-foreground transition-colors">
        <HelpCircle className="h-4 w-4" />
      </button>
    </Tooltip>
  );
}
