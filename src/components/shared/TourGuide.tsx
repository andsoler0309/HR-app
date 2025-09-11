'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft, ArrowRight, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface TourGuideProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function TourGuide({ steps, isOpen, onClose, onComplete }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !steps[currentStep]) return;

    const findTarget = () => {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        
        // Scroll element into view
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });

        // Calculate position with better logic
        const rect = element.getBoundingClientRect();
        const tooltipWidth = 320;
        const margin = 16;
        
        // Get actual modal height if available, otherwise estimate
        const tooltipHeight = modalRef.current?.offsetHeight || 280;
        
        let top = rect.bottom + margin;
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

        // Horizontal adjustments
        if (left < margin) left = margin;
        if (left + tooltipWidth > window.innerWidth - margin) {
          left = window.innerWidth - tooltipWidth - margin;
        }

        // Vertical adjustments - prioritize visibility
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < tooltipHeight + margin && spaceAbove > tooltipHeight + margin) {
          // Position above if there's more space above
          top = rect.top - tooltipHeight - margin;
        } else if (spaceBelow < tooltipHeight + margin) {
          // If neither space is enough, position with fixed offset from bottom
          top = window.innerHeight - tooltipHeight - margin;
          // But ensure it doesn't go above the viewport
          if (top < margin) {
            top = margin;
          }
        }

        setPosition({ top, left });

        // Add highlight class
        element.classList.add('tour-highlight');
        
        // Execute action if any
        if (steps[currentStep].action) {
          setTimeout(() => steps[currentStep].action!(), 500);
        }
      }
    };

    // Update position on scroll
    const updatePosition = () => {
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const tooltipWidth = 320;
        const margin = 16;
        
        // Get actual modal height if available, otherwise estimate
        const tooltipHeight = modalRef.current?.offsetHeight || 280;
        
        let top = rect.bottom + margin;
        let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);

        // Horizontal adjustments
        if (left < margin) left = margin;
        if (left + tooltipWidth > window.innerWidth - margin) {
          left = window.innerWidth - tooltipWidth - margin;
        }

        // Vertical adjustments - prioritize visibility
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < tooltipHeight + margin && spaceAbove > tooltipHeight + margin) {
          // Position above if there's more space above
          top = rect.top - tooltipHeight - margin;
        } else if (spaceBelow < tooltipHeight + margin) {
          // If neither space is enough, position with fixed offset from bottom
          top = window.innerHeight - tooltipHeight - margin;
          // But ensure it doesn't go above the viewport
          if (top < margin) {
            top = margin;
          }
        }

        setPosition({ top, left });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(findTarget, 100);
    
    // Recalculate position after modal renders
    const repositionTimer = setTimeout(() => {
      if (modalRef.current && targetElement) {
        updatePosition();
      }
    }, 200);
    
    // Listen for scroll events to update position
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(repositionTimer);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      // Remove highlight from previous element
      if (targetElement) {
        targetElement.classList.remove('tour-highlight');
      }
    };
  }, [currentStep, isOpen, steps, targetElement]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (targetElement) {
      targetElement.classList.remove('tour-highlight');
    }
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    if (targetElement) {
      targetElement.classList.remove('tour-highlight');
    }
    onClose();
  };

  if (!isOpen || !steps[currentStep]) return null;

  return createPortal(
    <>
      {/* Overlay - allows scroll through */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
        style={{ 
          pointerEvents: 'none' // This allows scrolling through the overlay
        }}
      />
      
      {/* Spotlight */}
      {targetElement && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px',
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          ref={modalRef}
          key={currentStep}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed z-[10000] bg-card border border-card-border rounded-lg shadow-xl p-6 max-w-sm"
          style={{ 
            top: position.top, 
            left: position.left,
            width: '320px',
            maxHeight: 'min(400px, 80vh)', // Responsive height
            overflowY: 'auto',
            pointerEvents: 'auto' // Only the modal itself can be interacted with
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">
                {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-text-secondary hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {steps[currentStep].title}
            </h3>
            <p className="text-text-secondary leading-relaxed">
              {steps[currentStep].content}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-background rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm text-text-secondary hover:text-foreground transition-colors"
              >
                Skip Tour
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition-colors"
              >
                {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                {currentStep !== steps.length - 1 && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 9999 !important;
          border-radius: 8px;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.6) !important;
        }
      `}</style>
    </>,
    document.body
  );
}
