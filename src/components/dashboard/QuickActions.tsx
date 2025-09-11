import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Tooltip from "@/components/shared/Tooltip"
import { UserPlus, FileCheck, Clock, BarChart3 } from "lucide-react"

const actions = [
  {
    label: 'Add New Employee',
    description: 'Quickly add a new team member to your organization',
    icon: UserPlus,
    href: '/employees/new'
  },
  {
    label: 'Approve Time Off',
    description: 'Review and approve pending time-off requests',
    icon: FileCheck,
    href: '/time-off/requests'
  },
  {
    label: 'View Schedule',
    description: 'Check team schedules and upcoming events',
    icon: Clock,
    href: '/schedule'
  },
  {
    label: 'Generate Reports',
    description: 'Create detailed HR analytics and reports',
    icon: BarChart3,
    href: '/reports'
  },
]

export default function QuickActions() {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Quick Actions
          <Tooltip content="These shortcuts help you perform common HR tasks quickly without navigating through multiple pages.">
            <span className="text-text-secondary cursor-help">ⓘ</span>
          </Tooltip>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Tooltip 
                key={index} 
                content={action.description}
                position="left"
              >
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3 h-auto py-3"
                  asChild
                >
                  <a href={action.href}>
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </a>
                </Button>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  )
}

