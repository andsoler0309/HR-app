import React from 'react';
import { MoreHorizontal, PenLine, FileText, Key } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface EmployeeActionsProps {
  employee: any;
  onEdit: (employee: any) => void;
  onGenerateDocument: (employee: any) => void;
  onGenerateAccess?: (employee: any) => void;
  hasTimeOffPolicies?: boolean;
}

const EmployeeActions: React.FC<EmployeeActionsProps> = ({ 
  employee,
  onEdit, 
  onGenerateDocument, 
  onGenerateAccess,
  hasTimeOffPolicies 
}) => {
  const t = useTranslations('employees.actions');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(employee)}>
          <PenLine className="mr-2 h-4 w-4" />
          <span className='hover:text-flame'>{t('editEmployee')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onGenerateDocument(employee)}>
          <FileText className="mr-2 h-4 w-4" />
          <span className='hover:text-flame'>{t('generateDocument')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeActions;
