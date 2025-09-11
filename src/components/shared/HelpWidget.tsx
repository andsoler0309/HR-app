'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { 
  HelpCircle, 
  X, 
  Book, 
  MessageCircle, 
  PlayCircle, 
  Search,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Lightbulb
} from 'lucide-react';

interface HelpItem {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'video' | 'faq' | 'contact';
  url?: string;
  action?: () => void;
}

interface HelpWidgetProps {
  currentPage?: string;
  forceOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function HelpWidget({ currentPage = 'dashboard', forceOpen = false, onOpenChange }: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  
  const t = useTranslations('helpWidget');

  // Handle external control of the widget
  useEffect(() => {
    if (forceOpen && !isOpen) {
      setIsOpen(true);
    }
  }, [forceOpen, isOpen]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const handleClose = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  // Help content based on current page using translations
  const helpContent: Record<string, HelpItem[]> = {
    dashboard: [
      {
        id: 'dashboard-overview',
        title: t('dashboard.overview.title'),
        description: t('dashboard.overview.description'),
        type: 'guide'
      },
      {
        id: 'metric-cards',
        title: t('dashboard.metrics.title'),
        description: t('dashboard.metrics.description'),
        type: 'guide'
      },
      {
        id: 'workforce-trends',
        title: t('dashboard.trends.title'),
        description: t('dashboard.trends.description'),
        type: 'video'
      },
      {
        id: 'quick-actions',
        title: t('dashboard.quickActions.title'),
        description: t('dashboard.quickActions.description'),
        type: 'guide'
      }
    ],
    employees: [
      {
        id: 'employee-overview',
        title: t('employees.overview.title'),
        description: t('employees.overview.description'),
        type: 'guide'
      },
      {
        id: 'add-employee',
        title: t('employees.add.title'),
        description: t('employees.add.description'),
        type: 'guide'
      },
      {
        id: 'employee-profiles',
        title: t('employees.profiles.title'),
        description: t('employees.profiles.description'),
        type: 'guide'
      },
      {
        id: 'search-filters',
        title: t('employees.search.title'),
        description: t('employees.search.description'),
        type: 'video'
      }
    ],
    departments: [
      {
        id: 'department-overview',
        title: 'Gestión de Departamentos',
        description: 'Organiza tu empresa en departamentos funcionales. Cada departamento tiene un jefe, presupuesto, empleados asignados y métricas específicas.',
        type: 'guide'
      }
    ],
    'time-off': [
      {
        id: 'timeoff-overview',
        title: 'Gestión de Tiempo Libre',
        description: 'Administra vacaciones, permisos, licencias médicas y días personales. El sistema calcula automáticamente balances y acumulaciones.',
        type: 'guide'
      }
    ],
    documents: [
      {
        id: 'document-overview',
        title: 'Gestión Documental',
        description: 'Centraliza todos los documentos de RRHH: contratos, certificados, políticas, manuales y archivos personales.',
        type: 'guide'
      }
    ]
  };

  const currentHelp = helpContent[currentPage] || helpContent.dashboard;

  // Tips específicos por página
  const getPageTip = (page: string): string => {
    const tips: Record<string, string> = {
      dashboard: t('dashboard.tip'),
      employees: t('employees.tip'),
      departments: "Asigna colores únicos a cada departamento para identificarlos fácilmente en reportes.",
      'time-off': "Revisa el calendario antes de aprobar solicitudes para evitar que varios empleados estén ausentes el mismo día.",
      documents: "Usa etiquetas y categorías consistentes para encontrar documentos más rápidamente.",
      portal: "Capacita a tus empleados sobre las funciones del portal para reducir consultas administrativas.",
    };
    return tips[page] || "Explora todas las funciones disponibles haciendo clic en los elementos de la interfaz.";
  };

  // Get expanded content for articles
  const getExpandedContent = (articleId: string): string => {
    const expandedContent: Record<string, string> = {
      'dashboard-overview': t('dashboard.overview.details'),
      'metric-cards': t('dashboard.metrics.details'),
      'workforce-trends': t('dashboard.trends.details'),
      'quick-actions': t('dashboard.quickActions.details'),
      'employee-overview': t('employees.overview.details'),
      'add-employee': t('employees.add.details'),
      'employee-profiles': t('employees.profiles.details'),
      'search-filters': t('employees.search.details'),
    };
    return expandedContent[articleId] || "Más información sobre esta funcionalidad estará disponible próximamente.";
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'guide':
        return <Book className="h-4 w-4" />;
      case 'video':
        return <PlayCircle className="h-4 w-4" />;
      case 'faq':
        return <HelpCircle className="h-4 w-4" />;
      case 'contact':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <Book className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide':
        return 'text-blue-600';
      case 'video':
        return 'text-green-600';
      case 'faq':
        return 'text-purple-600';
      case 'contact':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredHelp = currentHelp.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Help Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 bg-primary text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <HelpCircle className="h-6 w-6" />
      </motion.button>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[100]"
              onClick={handleClose}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-96 bg-card border-l border-card-border shadow-2xl z-[101] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-card-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{t('title')}</h2>
                    <p className="text-sm text-text-secondary">{t('subtitle')} {currentPage}</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-background rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-text-secondary" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-card-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-background border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredHelp.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-3 bg-background rounded-full w-fit mx-auto mb-3">
                      <Search className="h-6 w-6 text-text-secondary" />
                    </div>
                    <p className="text-text-secondary">{t('noResults')}</p>
                  </div>
                ) : (
                  filteredHelp.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-background rounded-lg border border-card-border hover:border-primary/30 cursor-pointer transition-all"
                    >
                      <div 
                        className="flex items-start justify-between"
                        onClick={() => setExpandedArticle(expandedArticle === item.id ? null : item.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={getTypeColor(item.type)}>
                              {getIcon(item.type)}
                            </span>
                            <h3 className="font-medium text-foreground text-sm">
                              {item.title}
                            </h3>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                        {expandedArticle === item.id ? (
                          <ChevronDown className="h-4 w-4 text-text-secondary flex-shrink-0 ml-2" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-text-secondary flex-shrink-0 ml-2" />
                        )}
                      </div>
                      
                      {/* Expanded content */}
                      <AnimatePresence>
                        {expandedArticle === item.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 pt-3 border-t border-card-border"
                          >
                            <p className="text-xs text-text-secondary leading-relaxed">
                              {getExpandedContent(item.id)}
                            </p>
                            <div className="mt-2 flex justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedArticle(null);
                                }}
                                className="text-xs text-primary hover:text-primary/80 transition-colors"
                              >
                                {t('showLess')}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}

                {/* Quick Actions */}
                <div className="mt-6 pt-4 border-t border-card-border">
                  <h3 className="text-sm font-medium text-foreground mb-3">{t('quickActions')}</h3>
                  <div className="space-y-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="w-full p-3 bg-background rounded-lg border border-card-border hover:border-primary/30 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{t('contactSupport')}</span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-text-secondary" />
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{t('contactSupportDesc')}</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="w-full p-3 bg-background rounded-lg border border-card-border hover:border-primary/30 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PlayCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{t('videoTutorials')}</span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-text-secondary" />
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{t('videoTutorialsDesc')}</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="w-full p-3 bg-background rounded-lg border border-card-border hover:border-primary/30 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Book className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium">{t('completeGuides')}</span>
                        </div>
                        <ExternalLink className="h-3 w-3 text-text-secondary" />
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{t('completeGuidesDesc')}</p>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="w-full p-3 bg-background rounded-lg border border-card-border hover:border-primary/30 transition-all text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium">{t('faq')}</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-text-secondary" />
                      </div>
                      <p className="text-xs text-text-secondary mt-1">{t('faqDesc')}</p>
                    </motion.button>
                  </div>

                  {/* Tips específicos por página */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          {t('tipTitle')} {currentPage}
                        </h4>
                        <p className="text-xs text-blue-700 leading-relaxed">
                          {getPageTip(currentPage)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
