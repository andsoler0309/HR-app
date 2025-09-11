'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  Play,
  CheckCircle2,
  Users,
  Building,
  FileText,
  BarChart3
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  userName?: string;
}

export default function WelcomeModal({ 
  isOpen, 
  onClose, 
  onStartTour,
  userName = "there" 
}: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to NodoHR! 🎉",
      subtitle: `Hi ${userName}, let's get you started`,
      content: "We're excited to help you streamline your HR processes. This quick setup will help you get the most out of our platform.",
      features: [
        "Manage employees effortlessly",
        "Track time off and attendance", 
        "Generate powerful reports",
        "Organize departments and policies"
      ]
    },
    {
      title: "What would you like to do first?",
      subtitle: "Choose your adventure",
      content: "We can guide you through the basics, or you can jump right in and explore on your own.",
      options: [
        {
          id: 'tour',
          title: 'Take the guided tour',
          description: 'Learn the essentials in 2 minutes',
          icon: Play,
          primary: true,
          action: onStartTour
        },
        {
          id: 'explore',
          title: 'Explore on my own',
          description: 'Jump right in and discover features',
          icon: ArrowRight,
          primary: false,
          action: onClose
        }
      ]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleOptionSelect = (action: () => void) => {
    action();
  };

  const currentStepData = steps[currentStep];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-card-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-br from-primary/10 via-sunset/10 to-primary/5">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-text-secondary" />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {currentStepData.title}
                </h2>
                <p className="text-text-secondary text-sm">
                  {currentStepData.subtitle}
                </p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'w-8 bg-primary' 
                      : 'w-2 bg-primary/30'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-text-secondary mb-6 leading-relaxed">
              {currentStepData.content}
            </p>

            {/* Step 1: Features */}
            {currentStep === 0 && 'features' in currentStepData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 mb-6"
              >
                {currentStepData.features?.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Step 2: Options */}
            {currentStep === 1 && 'options' in currentStepData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3 mb-6"
              >
                {currentStepData.options?.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionSelect(option.action)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      option.primary
                        ? 'border-primary bg-primary/5 hover:bg-primary/10'
                        : 'border-card-border hover:border-primary/30 hover:bg-background'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        option.primary ? 'bg-primary/20' : 'bg-background'
                      }`}>
                        <option.icon className={`h-5 w-5 ${
                          option.primary ? 'text-primary' : 'text-text-secondary'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {option.title}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-foreground transition-colors text-sm"
              >
                Skip for now
              </button>

              {currentStep === 0 && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Let's go
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
