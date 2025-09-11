import { TourStep } from '@/components/shared/TourGuide';

export const createEmployeesTour = (t: any): TourStep[] => [
  {
    title: t('employees.step1.title'),
    content: t('employees.step1.content'),
    target: 'h1',
    position: 'bottom'
  },
  {
    title: t('employees.step2.title'),
    content: t('employees.step2.content'),
    target: '[data-tour="add-employee"]',
    position: 'bottom'
  },
  {
    title: t('employees.step3.title'),
    content: t('employees.step3.content'),
    target: '.employee-dashboard',
    position: 'bottom'
  },
  {
    title: t('employees.step4.title'),
    content: t('employees.step4.content'),
    target: '.upcoming-events',
    position: 'top'
  },
  {
    title: t('employees.step5.title'),
    content: t('employees.step5.content'),
    target: '.search-filters',
    position: 'bottom'
  },
  {
    title: t('employees.step6.title'),
    content: t('employees.step6.content'),
    target: '.employee-table',
    position: 'top'
  },
  {
    title: t('employees.step7.title'),
    content: t('employees.step7.content'),
    target: '[data-tour="employee-actions"]:first-child',
    position: 'left'
  },
  {
    title: t('employees.step8.title'),
    content: t('employees.step8.content'),
    target: '.portal-access',
    position: 'top'
  }
];
