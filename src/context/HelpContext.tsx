'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HelpContextType {
  showTour: () => void;
  showHelp: () => void;
  tourIsVisible: boolean;
  helpIsVisible: boolean;
  setTourVisible: (visible: boolean) => void;
  setHelpVisible: (visible: boolean) => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

interface HelpProviderProps {
  children: ReactNode;
}

export function HelpProvider({ children }: HelpProviderProps) {
  const [tourIsVisible, setTourVisible] = useState(false);
  const [helpIsVisible, setHelpVisible] = useState(false);

  const showTour = () => {
    setTourVisible(true);
  };

  const showHelp = () => {
    setHelpVisible(true);
  };

  const value: HelpContextType = {
    showTour,
    showHelp,
    tourIsVisible,
    helpIsVisible,
    setTourVisible,
    setHelpVisible,
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
}
