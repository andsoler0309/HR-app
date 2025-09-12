'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Building, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings,
  ChevronRight,
  ExternalLink,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface FeatureGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const features = [
  {
    id: 'employees',
    title: 'Employee Management',
    description: 'Manage your team members, their profiles, and organizational structure.',
    icon: Users,
    color: 'blue',
    benefits: [
      'Centralized employee database',
      'Easy profile management',
      'Organizational hierarchy tracking',
      'Employee document storage'
    ],
    actions: [
      { label: 'Add Employee', href: '/employees/new' },
      { label: 'View Guide', type: 'guide' }
    ]
  },
  {
    id: 'departments',
    title: 'Department Organization',
    description: 'Structure your company with departments and manage team hierarchies.',
    icon: Building,
    color: 'green',
    benefits: [
      'Clear organizational structure',
      'Department-based reporting',
      'Manager assignments',
      'Budget tracking per department'
    ],
    actions: [
      { label: 'Create Department', href: '/departments/new' },
      { label: 'Learn More', type: 'guide' }
    ]
  },
  {
    id: 'timeoff',
    title: 'Time Off Management',
    description: 'Handle vacation requests, sick leave, and attendance tracking.',
    icon: Calendar,
    color: 'purple',
    benefits: [
      'Automated approval workflows',
      'Calendar integration',
      'Balance tracking',
      'Conflict detection'
    ],
    actions: [
      { label: 'View Calendar', href: '/time-off' },
      { label: 'Watch Demo', type: 'video' }
    ]
  },
  {
    id: 'policies',
    title: 'HR Policies',
    description: 'Create, manage, and distribute company policies and procedures.',
    icon: FileText,
    color: 'orange',
    benefits: [
      'Policy templates',
      'Version control',
      'Employee acknowledgments',
      'Compliance tracking'
    ],
    actions: [
      { label: 'Create Policy', href: '/policies/new' },
      { label: 'See Templates', type: 'guide' }
    ]
  },
  {
    id: 'reports',
    title: 'Analytics & Reports',
    description: 'Generate insights and reports about your workforce and HR metrics.',
    icon: BarChart3,
    color: 'red',
    benefits: [
      'Real-time dashboards',
      'Custom report builder',
      'Export capabilities',
      'Trend analysis'
    ],
    actions: [
      { label: 'View Reports', href: '/reports' },
      { label: 'Tutorial', type: 'video' }
    ]
  },
  {
    id: 'settings',
    title: 'System Settings',
    description: 'Configure your HR system to match your company\'s needs.',
    icon: Settings,
    color: 'gray',
    benefits: [
      'Custom workflows',
      'Permission management',
      'Integration settings',
      'Notification preferences'
    ],
    actions: [
      { label: 'Configure', href: '/settings' },
      { label: 'Best Practices', type: 'guide' }
    ]
  }
];

const getColorClasses = (color: string) => {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700'
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

const getIconColorClasses = (color: string) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
    gray: 'text-gray-600 bg-gray-100'
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

export default function FeatureGuide({ isOpen, onClose }: FeatureGuideProps) {
  const [selectedFeature, setSelectedFeature] = useState(features[0]);

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
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-card-border rounded-2xl shadow-2xl max-w-6xl w-full h-[80vh] overflow-hidden flex"
        >
          {/* Sidebar */}
          <div className="w-80 bg-background border-r border-card-border p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Feature Guide</h2>
              <p className="text-text-secondary">Explore what Nodo can do for your organization</p>
            </div>

            <div className="space-y-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                const isSelected = selectedFeature.id === feature.id;
                
                return (
                  <motion.button
                    key={feature.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedFeature(feature)}
                    className={`w-full p-4 rounded-lg text-left transition-all ${
                      isSelected 
                        ? 'bg-primary/10 border-2 border-primary/30' 
                        : 'bg-card border border-card-border hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getIconColorClasses(feature.color)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium truncate ${
                          isSelected ? 'text-primary' : 'text-foreground'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className="text-sm text-text-secondary truncate">
                          {feature.description}
                        </p>
                      </div>
                      {isSelected && (
                        <ChevronRight className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-card-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${getIconColorClasses(selectedFeature.color)}`}>
                    <selectedFeature.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {selectedFeature.title}
                    </h1>
                    <p className="text-text-secondary">
                      {selectedFeature.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-background rounded-lg transition-colors"
                >
                  <span className="text-2xl text-text-secondary">×</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedFeature.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Benefits */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Key Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedFeature.benefits.map((benefit, index) => (
                        <motion.div
                          key={benefit}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 p-3 bg-background rounded-lg border border-card-border"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          <span className="text-foreground">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Start Actions */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Quick Actions
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {selectedFeature.actions.map((action, index) => (
                        <motion.button
                          key={action.label}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                            action.type === 'guide' 
                              ? 'bg-background border border-card-border hover:border-primary/30 text-foreground' 
                              : 'bg-primary text-white hover:bg-primary/90'
                          }`}
                        >
                          {action.type === 'guide' && <BookOpen className="h-4 w-4" />}
                          {action.type === 'video' && <PlayCircle className="h-4 w-4" />}
                          {!action.type && <ExternalLink className="h-4 w-4" />}
                          {action.label}
                          <ArrowRight className="h-4 w-4" />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tips */}
                  <div className={`p-6 rounded-lg border-2 ${getColorClasses(selectedFeature.color)}`}>
                    <h4 className="font-semibold mb-2">💡 Pro Tip</h4>
                    <p className="text-sm">
                      {selectedFeature.id === 'employees' && 
                        "Start by creating departments first, then add employees. This ensures proper organizational structure from the beginning."
                      }
                      {selectedFeature.id === 'departments' && 
                        "Use department budgets to track spending and allocate resources effectively across your organization."
                      }
                      {selectedFeature.id === 'timeoff' && 
                        "Set up approval workflows to automate time-off requests and reduce administrative overhead."
                      }
                      {selectedFeature.id === 'policies' && 
                        "Use policy templates as starting points and customize them to match your company culture and legal requirements."
                      }
                      {selectedFeature.id === 'reports' && 
                        "Schedule regular reports to be automatically generated and sent to stakeholders via email."
                      }
                      {selectedFeature.id === 'settings' && 
                        "Configure notifications carefully to keep everyone informed without overwhelming them with alerts."
                      }
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
