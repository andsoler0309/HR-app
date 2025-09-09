import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AuditAction, AuditResource } from '@/types/audit'

interface AuditLogParams {
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  details?: Record<string, any>
  req?: Request
}

export async function createAuditLog({
  action,
  resource,
  resourceId,
  details,
  req
}: AuditLogParams): Promise<void> {
  try {
    const supabase = createClientComponentClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return

    // Extract IP and User Agent from request if available
    let ipAddress: string | undefined
    let userAgent: string | undefined
    
    if (req) {
      ipAddress = req.headers.get('x-forwarded-for') || 
                 req.headers.get('x-real-ip') || 
                 'unknown'
      userAgent = req.headers.get('user-agent') || 'unknown'
    }

    // Create audit log entry
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        company_id: user.id,
        user_id: user.id,
        action,
        resource,
        resource_id: resourceId,
        details,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to create audit log:', error)
    }
  } catch (error) {
    console.error('Audit logging error:', error)
  }
}

// Client-side audit logging (for browser actions)
export async function createClientAuditLog({
  action,
  resource,
  resourceId,
  details
}: Omit<AuditLogParams, 'req'>): Promise<void> {
  try {
    const supabase = createClientComponentClient()
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) return

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        company_id: user.id,
        user_id: user.id,
        action,
        resource,
        resource_id: resourceId,
        details,
        ip_address: 'client',
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Failed to create audit log:', error)
    }
  } catch (error) {
    console.error('Audit logging error:', error)
  }
}
