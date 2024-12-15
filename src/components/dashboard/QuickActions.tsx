import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const actions = [
  'Approve time off requests',
  'Review job applications',
  'Schedule interviews',
  'Complete performance reviews',
]

export default function QuickActions() {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action, index) => (
            <Button key={index} variant="outline" className="w-full justify-start">
              {action}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

