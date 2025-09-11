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
      // First check localStorage for quick access
      const localState = localStorage.getItem('onboarding_state');
      if (localState) {
        setOnboardingState(JSON.parse(localState));
      }

      // Then sync with database if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_state')
          .eq('id', user.id)
          .single();

        if (profile?.onboarding_state) {
          const dbState = profile.onboarding_state as OnboardingState;
          setOnboardingState(dbState);
          localStorage.setItem('onboarding_state', JSON.stringify(dbState));
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

    // Save to localStorage
    localStorage.setItem('onboarding_state', JSON.stringify(newState));

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ onboarding_state: newState })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error saving onboarding state:', error);
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
