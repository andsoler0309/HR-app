import { TourStep } from '@/components/shared/TourGuide';

export const createDocumentsTour = (t: any): TourStep[] => [
  {
    title: t('documents.step1.title'),
    content: t('documents.step1.content'),
    target: 'h1',
    position: 'bottom'
  },
  {
    title: t('documents.step2.title'),
    content: t('documents.step2.content'),
    target: '[data-tour="new-category"]',
    position: 'left'
  },
  {
    title: t('documents.step3.title'),
    content: t('documents.step3.content'),
    target: '[data-tour="upload-document"]',
    position: 'left'
  },
  {
    title: t('documents.step4.title'),
    content: t('documents.step4.content'),
    target: '.tabs-list',
    position: 'bottom'
  },
  {
    title: t('documents.step5.title'),
    content: t('documents.step5.content'),
    target: '.search-filters',
    position: 'bottom'
  },
  {
    title: t('documents.step6.title'),
    content: t('documents.step6.content'),
    target: '.categories-grid',
    position: 'bottom'
  },
  {
    title: t('documents.step7.title'),
    content: t('documents.step7.content'),
    target: '.view-toggle',
    position: 'left'
  },
  {
    title: t('documents.step8.title'),
    content: t('documents.step8.content'),
    target: '.document-actions',
    position: 'top'
  },
  {
    title: t('documents.step9.title'),
    content: t('documents.step9.content'),
    target: '.signature-status',
    position: 'top'
  }
];
