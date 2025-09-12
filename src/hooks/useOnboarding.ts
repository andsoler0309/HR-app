'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface OnboardingState {
  hasCompletedTour: boolean;
  hasAddedFirstEmployee: boolean;
  hasCreatedFirstDepartment: boolean;
  hasSetupFirstPolicy: boolean;
  hasViewedReports: boolean;
  currentStep: string | null;
}

const defaultOnboardingState: OnboardingState = {
  hasCompletedTour: false,
  hasAddedFirstEmployee: false,
  hasCreatedFirstDepartment: false,
  hasSetupFirstPolicy: false,
  hasViewedReports: false,
  currentStep: 'welcome'
};

export function useOnboarding() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(defaultOnboardingState);
  const [isLoading, setIsLoading] = useState(true);

  // Load onboarding state from localStorage or database
  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      // Only use localStorage since onboarding_state column doesn't exist in database
      if (typeof window !== 'undefined') {
        const localState = localStorage.getItem('onboarding_state');
        if (localState) {
          setOnboardingState(JSON.parse(localState));
        }
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboardingState = async (updates: Partial<OnboardingState>) => {
    const newState = { ...onboardingState, ...updates };
    setOnboardingState(newState);

    // Save to localStorage only since database column doesn't exist
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_state', JSON.stringify(newState));
    }
  };

  const markStepComplete = (step: keyof OnboardingState) => {
    updateOnboardingState({ [step]: true });
  };

  const setCurrentStep = (step: string | null) => {
    updateOnboardingState({ currentStep: step });
  };

  const resetOnboarding = () => {
    updateOnboardingState(defaultOnboardingState);
  };

  const getProgress = (): number => {
    const steps = [
      onboardingState.hasCompletedTour,
      onboardingState.hasAddedFirstEmployee,
      onboardingState.hasCreatedFirstDepartment,
      onboardingState.hasSetupFirstPolicy,
      onboardingState.hasViewedReports
    ];
    const completedSteps = steps.filter(Boolean).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const getNextStep = (): string | null => {
    if (!onboardingState.hasCompletedTour) return 'tour';
    if (!onboardingState.hasAddedFirstEmployee) return 'employee';
    if (!onboardingState.hasCreatedFirstDepartment) return 'department';
    if (!onboardingState.hasSetupFirstPolicy) return 'policy';
    if (!onboardingState.hasViewedReports) return 'reports';
    return null;
  };

  const isOnboardingComplete = (): boolean => {
    return getProgress() === 100;
  };

  const shouldShowOnboarding = (): boolean => {
    return !isOnboardingComplete() && onboardingState.currentStep !== null;
  };

  return {
    onboardingState,
    isLoading,
    updateOnboardingState,
    markStepComplete,
    setCurrentStep,
    resetOnboarding,
    getProgress,
    getNextStep,
    isOnboardingComplete,
    shouldShowOnboarding
  };
}
