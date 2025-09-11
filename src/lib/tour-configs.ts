import { TourStep } from '@/components/shared/TourGuide';

export const dashboardTour: TourStep[] = [
  {
    target: '.metric-cards',
    title: 'Welcome to Your Dashboard! 👋',
    content: 'Here you can see key metrics about your HR operations. These cards show important numbers like total employees, active requests, and more.',
    position: 'bottom'
  },
  {
    target: '.quick-actions',
    title: 'Quick Actions',
    content: 'Use these buttons to perform common tasks quickly. You can approve requests, add employees, and more without navigating through menus.',
    position: 'left'
  },
  {
    target: '.recent-activities',
    title: 'Recent Activities',
    content: 'Stay updated with the latest activities in your organization. See recent applications, time-off requests, and other important events.',
    position: 'top'
  },
  {
    target: '.sidebar',
    title: 'Navigation Menu',
    content: 'Use the sidebar to navigate between different sections like Employees, Departments, Time Off, and more. Each section has powerful tools for HR management.',
    position: 'right'
  },
  {
    target: '.help-widget',
    title: 'Need Help? 🆘',
    content: 'Click this help button anytime you need assistance. You\'ll find guides, videos, and can contact support directly.',
    position: 'left'
  }
];

export const employeesTour: TourStep[] = [
  {
    target: '.employee-filters',
    title: 'Filter Your Employees',
    content: 'Use these filters to find specific employees by department, status, or other criteria. Great for large organizations!',
    position: 'bottom'
  },
  {
    target: '.add-employee-btn',
    title: 'Add New Employee',
    content: 'Click here to add a new employee to your system. You can enter all their details, assign them to departments, and set up their profile.',
    position: 'bottom'
  },
  {
    target: '.employee-list',
    title: 'Employee Directory',
    content: 'This is your complete employee directory. Click on any employee to view their profile, edit information, or manage their records.',
    position: 'top'
  },
  {
    target: '.bulk-actions',
    title: 'Bulk Operations',
    content: 'Select multiple employees to perform bulk actions like updating departments, exporting data, or sending notifications.',
    position: 'top'
  }
];

export const departmentsTour: TourStep[] = [
  {
    target: '.department-hierarchy',
    title: 'Department Structure',
    content: 'Visualize your company\'s organizational structure. See how departments relate to each other and manage the hierarchy.',
    position: 'bottom'
  },
  {
    target: '.create-department-btn',
    title: 'Create New Department',
    content: 'Add new departments to organize your company better. You can set managers, budgets, and define responsibilities.',
    position: 'bottom'
  },
  {
    target: '.department-stats',
    title: 'Department Analytics',
    content: 'View important metrics for each department including employee count, budget utilization, and performance indicators.',
    position: 'top'
  }
];

export const policiesTour: TourStep[] = [
  {
    target: '.policy-categories',
    title: 'Policy Organization',
    content: 'Organize your policies by categories like HR, IT, Safety, etc. This makes it easy for employees to find relevant policies.',
    position: 'right'
  },
  {
    target: '.create-policy-btn',
    title: 'Create New Policy',
    content: 'Create new company policies using our templates or from scratch. You can set approval workflows and track acknowledgments.',
    position: 'bottom'
  },
  {
    target: '.policy-templates',
    title: 'Policy Templates',
    content: 'Save time with pre-built policy templates for common scenarios like remote work, code of conduct, and safety procedures.',
    position: 'left'
  },
  {
    target: '.policy-approval',
    title: 'Approval Workflow',
    content: 'Set up approval workflows for policies. Route them through legal, management, or other stakeholders before publishing.',
    position: 'top'
  }
];

export const timeOffTour: TourStep[] = [
  {
    target: '.time-off-calendar',
    title: 'Time Off Calendar',
    content: 'View all time-off requests in a calendar format. See who\'s out when and plan accordingly.',
    position: 'bottom'
  },
  {
    target: '.pending-requests',
    title: 'Pending Requests',
    content: 'Review and approve time-off requests from your team. You can see details, check conflicts, and make decisions quickly.',
    position: 'right'
  },
  {
    target: '.time-off-policies',
    title: 'Time Off Policies',
    content: 'Manage different types of leave like vacation, sick days, and personal time. Set rules for accrual and usage.',
    position: 'left'
  }
];

export const reportsTour: TourStep[] = [
  {
    target: '.report-dashboard',
    title: 'Analytics Overview',
    content: 'Get insights into your HR metrics with comprehensive reports and analytics. Track trends and make data-driven decisions.',
    position: 'bottom'
  },
  {
    target: '.custom-reports',
    title: 'Custom Reports',
    content: 'Create custom reports tailored to your needs. Filter by date ranges, departments, or specific metrics.',
    position: 'right'
  },
  {
    target: '.export-options',
    title: 'Export Reports',
    content: 'Export your reports in various formats like PDF, Excel, or CSV for further analysis or sharing with stakeholders.',
    position: 'left'
  }
];

// Helper function to get tour for current page
export function getTourForPage(page: string): TourStep[] {
  switch (page) {
    case 'dashboard':
      return dashboardTour;
    case 'employees':
      return employeesTour;
    case 'departments':
      return departmentsTour;
    case 'policies':
      return policiesTour;
    case 'time-off':
      return timeOffTour;
    case 'reports':
      return reportsTour;
    default:
      return dashboardTour;
  }
}
