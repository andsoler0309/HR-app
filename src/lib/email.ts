import { createClient } from '@supabase/supabase-js'
import type { TimeOffRequest } from '@/types/timeoff'

// You'll need to set up an email service (e.g., SendGrid, AWS SES)
// This is a placeholder implementation
export async function sendTimeOffEmail(request: TimeOffRequest, type: 'NEW' | 'STATUS_CHANGE') {
  // Implement your email sending logic here
  // Example with SendGrid:
  /*
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: request.employee.email,
      subject: `Time Off Request ${type === 'NEW' ? 'Submitted' : 'Updated'}`,
      html: generateEmailTemplate(request, type)
    })
  })
  */
}

function generateEmailTemplate(request: TimeOffRequest, type: 'NEW' | 'STATUS_CHANGE') {
  // Generate HTML email template based on request type
}