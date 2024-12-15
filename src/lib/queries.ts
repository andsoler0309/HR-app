import { supabase } from '@/lib/supabase'

interface MetricsData {
  totalEmployees: number
  openPositions: number
  upcomingEvents: number
  timeOffRequests: number
  trends: {
    employees: { value: number; isPositive: boolean }
    positions: { value: number; isPositive: boolean }
    events: { value: number; isPositive: boolean }
    requests: { value: number; isPositive: boolean }
  }
}

const calculateTrend = (current: number, previous: number) => {
  if (!previous) return { value: 0, isPositive: true }
  const trend = ((current - previous) / previous) * 100
  return {
    value: Math.abs(trend),
    isPositive: trend >= 0
  }
}

export async function getDashboardMetrics(userId: string): Promise<MetricsData> {
  // Get current metrics
  const [currentMetrics, previousMetrics] = await Promise.all([
    // Current metrics (most recent)
    supabase
      .from('metrics_history')
      .select('*')
      .eq('company_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),

    // Previous metrics (from 30 days ago)
    supabase
      .from('metrics_history')
      .select('*')
      .eq('company_id', userId)
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
  ])

  if (!currentMetrics.data) {
    throw new Error('No metrics data found')
  }

  const current = currentMetrics.data
  const previous = previousMetrics.data || {
    total_employees: current.total_employees,
    open_positions: current.open_positions,
    upcoming_events: current.upcoming_events,
    time_off_requests: current.time_off_requests
  }

  return {
    totalEmployees: current.total_employees,
    openPositions: current.open_positions,
    upcomingEvents: current.upcoming_events,
    timeOffRequests: current.time_off_requests,
    trends: {
      employees: calculateTrend(current.total_employees, previous.total_employees),
      positions: calculateTrend(current.open_positions, previous.open_positions),
      events: calculateTrend(current.upcoming_events, previous.upcoming_events),
      requests: calculateTrend(current.time_off_requests, previous.time_off_requests)
    }
  }
}

export async function getRecentActivities(userId: string) {
  const { data } = await supabase
    .from('activities')
    .select(`
      id,
      action,
      department,
      created_at
    `)
    .eq('company_id', userId)
    .order('created_at', { ascending: false })
    .limit(4)

  return data || []
}

export async function getTimeOffEvents(userId: string) {
  const { data } = await supabase
    .from('time_off_requests')
    .select(`
      id,
      employee:employees(first_name, last_name, department_id),
      start_date,
      end_date,
      department:departments(name)
    `)
    .eq('company_id', userId)
    .eq('status', 'APPROVED')
    .gte('start_date', new Date().toISOString())
    .order('start_date')
    .limit(3)

  return data || []
}

export async function getWorkforceTrends(userId: string) {
  const { data } = await supabase
    .from('employee_counts')
    .select('*')
    .eq('company_id', userId)
    .order('month')

  return data || []
}

export async function getDepartmentDistribution(userId: string) {
  const { data } = await supabase
    .rpc('get_department_distribution', {
      company_id: userId
    })

  return data?.map((item: { department_name: string; count: number }) => ({
    name: item.department_name,
    value: item.count
  })) || []
}

export async function getRecentApplications(userId: string) {
  const { data } = await supabase
    .from('job_applications')
    .select(`
      id,
      applicant_name,
      position,
      department:departments(name),
      status,
      created_at
    `)
    .eq('company_id', userId)
    .order('created_at', { ascending: false })
    .limit(4)

  return data || []
}