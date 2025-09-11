import { TourStep } from '@/components/shared/TourGuide';

export const createTimeOffTour = (t: any): TourStep[] => [
  {
    title: t('timeoff.step1.title'),
    content: t('timeoff.step1.content'),
    target: 'h1',
    position: 'bottom'
  },
  {
    title: t('timeoff.step2.title'),
    content: t('timeoff.step2.content'),
    target: '[data-tour="refresh-balances"]',
    position: 'left'
  },
  {
    title: t('timeoff.step3.title'),
    content: t('timeoff.step3.content'),
    target: '.search-input',
    position: 'bottom'
  },
  {
    title: t('timeoff.step4.title'),
    content: t('timeoff.step4.content'),
    target: '.balance-cards',
    position: 'bottom'
  },
  {
    title: t('timeoff.step5.title'),
    content: t('timeoff.step5.content'),
    target: '[value="calendar"]',
    position: 'bottom'
  },
  {
    title: t('timeoff.step6.title'),
    content: t('timeoff.step6.content'),
    target: '[value="requests"]',
    position: 'bottom'
  },
  {
    title: t('timeoff.step7.title'),
    content: t('timeoff.step7.content'),
    target: '[value="policies"]',
    position: 'bottom'
  },
  {
    title: t('timeoff.step8.title'),
    content: t('timeoff.step8.content'),
    target: '.request-status',
    position: 'top'
  }
];
