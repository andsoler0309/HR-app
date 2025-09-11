'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, ArrowRight, Clock } from 'lucide-react';

interface SmartTip {
  id: string;
  title: string;
  content: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  condition: () => boolean;
  priority: number;
}

interface SmartTipsProps {
  currentPage: string;
  context?: any;
}

export default function SmartTips({ currentPage, context }: SmartTipsProps) {
  const [currentTip, setCurrentTip] = useState<SmartTip | null>(null);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);

  // Define smart tips based on user behavior and context
  const tips: SmartTip[] = [
    {
      id: 'no-employees',
      title: 'Start by adding employees',
      content: 'Your employee list is empty. Add your first team member to start managing your workforce effectively.',
      action: {
        label: 'Add Employee',
        onClick: () => window.location.href = '/employees/new'
      },
      condition: () => currentPage === 'dashboard' && (!context?.employeeCount || context.employeeCount === 0),
      priority: 10
    },
    {
      id: 'no-departments',
      title: 'Organize with departments',
      content: 'Create departments to better organize your team and streamline management processes.',
      action: {
        label: 'Create Department',
        onClick: () => window.location.href = '/departments/new'
      },
      condition: () => currentPage === 'dashboard' && (!context?.departmentCount || context.departmentCount === 0) && context?.employeeCount > 2,
      priority: 8
    },
    {
      id: 'pending-requests',
      title: 'You have pending requests',
      content: `${context?.pendingRequests || 0} time-off requests are waiting for your approval.`,
      action: {
        label: 'Review Requests',
        onClick: () => window.location.href = '/time-off/requests'
      },
      condition: () => context?.pendingRequests > 0,
      priority: 9
    },
    {
      id: 'incomplete-profiles',
      title: 'Complete employee profiles',
      content: 'Some employees have incomplete profiles. Complete them to enable all HR features.',
      action: {
        label: 'View Employees',
        onClick: () => window.location.href = '/employees'
      },
      condition: () => context?.incompleteProfiles > 0,
      priority: 7
    },
    {
      id: 'setup-policies',
      title: 'Define your policies',
      content: 'Set up company policies to ensure clear guidelines for your team.',
      action: {
        label: 'Create Policy',
        onClick: () => window.location.href = '/policies/new'
      },
      condition: () => (!context?.policyCount || context.policyCount === 0) && context?.employeeCount > 5,
      priority: 6
    }
  ];

  useEffect(() => {
    // Get dismissed tips from localStorage
    const dismissed = JSON.parse(localStorage.getItem('dismissedTips') || '[]');
    setDismissedTips(dismissed);

    // Find the highest priority tip that meets conditions and isn't dismissed
    const availableTips = tips
      .filter(tip => tip.condition() && !dismissed.includes(tip.id))
      .sort((a, b) => b.priority - a.priority);

    if (availableTips.length > 0) {
      // Show tip after a short delay
      const timer = setTimeout(() => {
        setCurrentTip(availableTips[0]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentPage, context]);

  const dismissTip = (tipId: string) => {
    const newDismissed = [...dismissedTips, tipId];
    setDismissedTips(newDismissed);
    localStorage.setItem('dismissedTips', JSON.stringify(newDismissed));
    setCurrentTip(null);
  };

  const closeTip = () => {
    setCurrentTip(null);
  };

  if (!currentTip) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-20 right-6 z-40 max-w-sm"
      >
        <div className="bg-card border border-card-border rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-card-border">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-amber-500/20 rounded-full">
                <Lightbulb className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">
                Smart Tip
              </h3>
            </div>
            <button
              onClick={closeTip}
              className="p-1 hover:bg-white/50 rounded transition-colors"
            >
              <X className="h-4 w-4 text-text-secondary" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h4 className="font-medium text-foreground mb-2">
              {currentTip.title}
            </h4>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {currentTip.content}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => dismissTip(currentTip.id)}
                className="text-xs text-text-secondary hover:text-foreground transition-colors"
              >
                Don't show again
              </button>

              {currentTip.action && (
                <button
                  onClick={currentTip.action.onClick}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-md hover:bg-primary/90 transition-colors"
                >
                  {currentTip.action.label}
                  <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
