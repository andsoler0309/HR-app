'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Target,
  Users,
  Building,
  FileText,
  BarChart3,
  X
} from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

interface OnboardingProgressProps {
  onStartStep?: (step: string) => void;
}

export default function OnboardingProgress({ onStartStep }: OnboardingProgressProps) {
  const { 
    onboardingState, 
    getProgress, 
    getNextStep, 
    isOnboardingComplete,
    setCurrentStep 
  } = useOnboarding();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(!isOnboardingComplete());

  const steps = [
    {
      id: 'tour',
      title: 'Take the tour',
      description: 'Learn the basics of your HR dashboard',
      icon: Target,
      completed: onboardingState.hasCompletedTour,
      action: () => onStartStep?.('tour')
    },
    {
      id: 'employee',
      title: 'Add your first employee',
      description: 'Start building your team roster',
      icon: Users,
      completed: onboardingState.hasAddedFirstEmployee,
      action: () => onStartStep?.('employee')
    },
    {
      id: 'department',
      title: 'Create departments',
      description: 'Organize your company structure',
      icon: Building,
      completed: onboardingState.hasCreatedFirstDepartment,
      action: () => onStartStep?.('department')
    },
    {
      id: 'policy',
      title: 'Setup policies',
      description: 'Define your company policies',
      icon: FileText,
      completed: onboardingState.hasSetupFirstPolicy,
      action: () => onStartStep?.('policy')
    },
    {
      id: 'reports',
      title: 'View reports',
      description: 'Explore your HR analytics',
      icon: BarChart3,
      completed: onboardingState.hasViewedReports,
      action: () => onStartStep?.('reports')
    }
  ];

  const progress = getProgress();
  const nextStep = getNextStep();

  if (!isVisible || isOnboardingComplete()) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card border border-card-border rounded-lg shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-sunset/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {steps.filter(s => s.completed).length}
              </span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Getting Started</h3>
            <p className="text-sm text-text-secondary">
              {progress}% complete • {steps.filter(s => s.completed).length} of {steps.length} tasks done
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-background rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-text-secondary" />
            ) : (
              <ChevronDown className="h-4 w-4 text-text-secondary" />
            )}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-background rounded transition-colors"
          >
            <X className="h-4 w-4 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-2">
        <div className="w-full bg-background rounded-full h-2">
          <motion.div 
            className="bg-gradient-to-r from-primary to-sunset h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Tasks List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 pt-2 space-y-3"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isNext = step.id === nextStep;
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
                    step.completed 
                      ? 'bg-green-50 border border-green-200' 
                      : isNext
                      ? 'bg-primary/5 border border-primary/20 hover:bg-primary/10'
                      : 'bg-background border border-card-border hover:bg-card'
                  }`}
                  onClick={step.action}
                >
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className={`h-5 w-5 ${isNext ? 'text-primary' : 'text-text-secondary'}`} />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-1">
                    <Icon className={`h-4 w-4 ${
                      step.completed 
                        ? 'text-green-600' 
                        : isNext 
                        ? 'text-primary' 
                        : 'text-text-secondary'
                    }`} />
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        step.completed ? 'text-green-700' : 'text-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {isNext && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="px-3 py-1 bg-primary text-white text-xs rounded-full font-medium"
                    >
                      Next
                    </motion.div>
                  )}
                </motion.div>
              );
            })}

            {/* Completion Message */}
            {progress === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-700 mb-1">
                  Congratulations! 🎉
                </h4>
                <p className="text-sm text-green-600">
                  You've completed the initial setup. You're ready to manage your HR processes!
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
