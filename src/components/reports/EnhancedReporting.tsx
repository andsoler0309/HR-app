'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText, Users, Calendar, DollarSign, Briefcase } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { createClientAuditLog } from '@/lib/audit'
import jsPDF from 'jspdf'
import { Employee } from '@/types/employee'
import { PerformanceReview } from '@/types/performance'
import { TimeOffRequest } from '@/types/timeoff'
import { PayrollPeriod } from '@/types/salary'

interface ReportData {
  employees: Employee[]
  performanceReviews: PerformanceReview[]
  timeOffRequests: TimeOffRequest[]
  payrollPeriods: PayrollPeriod[]
}

export default function EnhancedReporting() {
  const t = useTranslations('reports')
  
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData>({
    employees: [],
    performanceReviews: [],
    timeOffRequests: [],
    payrollPeriods: []
  })
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [employeesRes, reviewsRes, timeOffRes, payrollRes] = await Promise.all([
        supabase
          .from('employees')
          .select(`
            *,
            department:department_id(id, name)
          `)
          .eq('company_id', user.id),
        
        supabase
          .from('performance_reviews')
          .select(`
            *,
            employee:employee_id(first_name, last_name, position),
            reviewer:reviewer_id(first_name, last_name)
          `)
          .eq('company_id', user.id)
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end),
        
        supabase
          .from('time_off_requests')
          .select(`
            *,
            employee:employee_id(first_name, last_name)
          `)
          .eq('company_id', user.id)
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end),
        
        supabase
          .from('payroll_periods')
          .select('*')
          .eq('company_id', user.id)
          .gte('start_date', dateRange.start)
          .lte('end_date', dateRange.end)
      ])

      setReportData({
        employees: employeesRes.data || [],
        performanceReviews: reviewsRes.data || [],
        timeOffRequests: timeOffRes.data || [],
        payrollPeriods: payrollRes.data || []
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateEmployeeReport = async () => {
    try {
      const pdf = new jsPDF()
      const { employees } = reportData

      // Header
      pdf.setFontSize(20)
      pdf.text('Employee Report', 20, 30)
      
      pdf.setFontSize(12)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45)
      pdf.text(`Total Employees: ${employees.length}`, 20, 55)

      // Employee details
      let yPosition = 70
      employees.forEach((employee, index) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 30
        }

        pdf.setFontSize(14)
        pdf.text(`${index + 1}. ${employee.first_name} ${employee.last_name}`, 20, yPosition)
        yPosition += 10

        pdf.setFontSize(10)
        pdf.text(`Position: ${employee.position}`, 30, yPosition)
        yPosition += 6
        pdf.text(`Department: ${employee.department?.name || 'N/A'}`, 30, yPosition)
        yPosition += 6
        pdf.text(`Hire Date: ${new Date(employee.hire_date).toLocaleDateString()}`, 30, yPosition)
        yPosition += 6
        pdf.text(`Status: ${employee.is_active ? 'Active' : 'Inactive'}`, 30, yPosition)
        yPosition += 15
      })

      pdf.save(`employee-report-${new Date().toISOString().split('T')[0]}.pdf`)

      await createClientAuditLog({
        action: 'EXPORT',
        resource: 'EMPLOYEE',
        details: { report_type: 'employee_report', employee_count: employees.length }
      })
    } catch (error) {
      console.error('Error generating employee report:', error)
    }
  }

  const generatePerformanceReport = async () => {
    try {
      const pdf = new jsPDF()
      const { performanceReviews } = reportData

      pdf.setFontSize(20)
      pdf.text('Performance Review Report', 20, 30)
      
      pdf.setFontSize(12)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45)
      pdf.text(`Period: ${dateRange.start} to ${dateRange.end}`, 20, 55)
      pdf.text(`Total Reviews: ${performanceReviews.length}`, 20, 65)

      const completedReviews = performanceReviews.filter(r => r.status === 'COMPLETED')
      const avgRating = completedReviews.length > 0 
        ? completedReviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / completedReviews.length
        : 0

      pdf.text(`Completed Reviews: ${completedReviews.length}`, 20, 75)
      pdf.text(`Average Rating: ${avgRating.toFixed(1)}/5`, 20, 85)

      let yPosition = 100
      performanceReviews.forEach((review, index) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 30
        }

        pdf.setFontSize(12)
        pdf.text(`${index + 1}. ${review.employee?.first_name} ${review.employee?.last_name}`, 20, yPosition)
        yPosition += 8

        pdf.setFontSize(10)
        pdf.text(`Status: ${review.status}`, 30, yPosition)
        yPosition += 6
        pdf.text(`Type: ${review.review_type}`, 30, yPosition)
        yPosition += 6
        pdf.text(`Rating: ${review.overall_rating || 'N/A'}/5`, 30, yPosition)
        yPosition += 6
        pdf.text(`Reviewer: ${review.reviewer?.first_name} ${review.reviewer?.last_name}`, 30, yPosition)
        yPosition += 15
      })

      pdf.save(`performance-report-${new Date().toISOString().split('T')[0]}.pdf`)

      await createClientAuditLog({
        action: 'EXPORT',
        resource: 'PERFORMANCE_REVIEW',
        details: { report_type: 'performance_report', review_count: performanceReviews.length }
      })
    } catch (error) {
      console.error('Error generating performance report:', error)
    }
  }

  const generateTimeOffReport = async () => {
    try {
      const pdf = new jsPDF()
      const { timeOffRequests } = reportData

      pdf.setFontSize(20)
      pdf.text('Time Off Report', 20, 30)
      
      pdf.setFontSize(12)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45)
      pdf.text(`Period: ${dateRange.start} to ${dateRange.end}`, 20, 55)
      pdf.text(`Total Requests: ${timeOffRequests.length}`, 20, 65)

      const approvedRequests = timeOffRequests.filter(r => r.status === 'APPROVED')
      const totalDays = timeOffRequests.reduce((sum, r) => sum + r.days, 0)

      pdf.text(`Approved Requests: ${approvedRequests.length}`, 20, 75)
      pdf.text(`Total Days Requested: ${totalDays}`, 20, 85)

      let yPosition = 100
      timeOffRequests.forEach((request, index) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 30
        }

        pdf.setFontSize(12)
        pdf.text(`${index + 1}. ${request.employee?.first_name} ${request.employee?.last_name}`, 20, yPosition)
        yPosition += 8

        pdf.setFontSize(10)
        pdf.text(`Type: ${request.policy?.name || (request.type ? request.type.replace('_', ' ') : 'Time Off')}`, 30, yPosition)
        yPosition += 6
        pdf.text(`Status: ${request.status}`, 30, yPosition)
        yPosition += 6
        pdf.text(`Days: ${request.days}`, 30, yPosition)
        yPosition += 6
        pdf.text(`Period: ${new Date(request.start_date).toLocaleDateString()} - ${new Date(request.end_date).toLocaleDateString()}`, 30, yPosition)
        yPosition += 15
      })

      pdf.save(`timeoff-report-${new Date().toISOString().split('T')[0]}.pdf`)

      await createClientAuditLog({
        action: 'EXPORT',
        resource: 'TIME_OFF',
        details: { report_type: 'timeoff_report', request_count: timeOffRequests.length }
      })
    } catch (error) {
      console.error('Error generating time off report:', error)
    }
  }

  const generatePayrollReport = async () => {
    try {
      const pdf = new jsPDF()
      const { payrollPeriods } = reportData

      pdf.setFontSize(20)
      pdf.text('Payroll Report', 20, 30)
      
      pdf.setFontSize(12)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45)
      pdf.text(`Period: ${dateRange.start} to ${dateRange.end}`, 20, 55)
      pdf.text(`Payroll Periods: ${payrollPeriods.length}`, 20, 65)

      const totalGross = payrollPeriods.reduce((sum, p) => sum + (p.total_gross || 0), 0)
      const totalNet = payrollPeriods.reduce((sum, p) => sum + (p.total_net || 0), 0)
      const totalDeductions = payrollPeriods.reduce((sum, p) => sum + (p.total_deductions || 0), 0)

      pdf.text(`Total Gross: $${totalGross.toLocaleString()}`, 20, 75)
      pdf.text(`Total Deductions: $${totalDeductions.toLocaleString()}`, 20, 85)
      pdf.text(`Total Net: $${totalNet.toLocaleString()}`, 20, 95)

      let yPosition = 110
      payrollPeriods.forEach((period, index) => {
        if (yPosition > 250) {
          pdf.addPage()
          yPosition = 30
        }

        pdf.setFontSize(12)
        pdf.text(`${index + 1}. ${new Date(period.start_date).toLocaleDateString()} - ${new Date(period.end_date).toLocaleDateString()}`, 20, yPosition)
        yPosition += 8

        pdf.setFontSize(10)
        pdf.text(`Status: ${period.status}`, 30, yPosition)
        yPosition += 6
        pdf.text(`Gross: $${(period.total_gross || 0).toLocaleString()}`, 30, yPosition)
        yPosition += 6
        pdf.text(`Net: $${(period.total_net || 0).toLocaleString()}`, 30, yPosition)
        yPosition += 15
      })

      pdf.save(`payroll-report-${new Date().toISOString().split('T')[0]}.pdf`)

      await createClientAuditLog({
        action: 'EXPORT',
        resource: 'PAYROLL',
        details: { report_type: 'payroll_report', period_count: payrollPeriods.length }
      })
    } catch (error) {
      console.error('Error generating payroll report:', error)
    }
  }

  const generateComplianceReport = async () => {
    try {
      const pdf = new jsPDF()
      const { employees, timeOffRequests, payrollPeriods } = reportData

      pdf.setFontSize(20)
      pdf.text('Compliance Report', 20, 30)
      
      pdf.setFontSize(12)
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45)
      pdf.text(`Report Period: ${dateRange.start} to ${dateRange.end}`, 20, 55)

      // Employee compliance metrics
      pdf.setFontSize(14)
      pdf.text('Employee Compliance', 20, 75)
      
      pdf.setFontSize(10)
      const activeEmployees = employees.filter(e => e.is_active).length
      const totalEmployees = employees.length
      const missingInfo = employees.filter(e => !e.email || !e.phone || !e.position).length

      pdf.text(`Total Employees: ${totalEmployees}`, 30, 90)
      pdf.text(`Active Employees: ${activeEmployees}`, 30, 100)
      pdf.text(`Employees with Missing Information: ${missingInfo}`, 30, 110)

      // Time off compliance
      pdf.setFontSize(14)
      pdf.text('Time Off Compliance', 20, 130)
      
      pdf.setFontSize(10)
      const pendingRequests = timeOffRequests.filter(r => r.status === 'PENDING').length
      const overdueApprovals = timeOffRequests.filter(r => 
        r.status === 'PENDING' && 
        new Date(r.start_date) < new Date()
      ).length

      pdf.text(`Pending Time Off Requests: ${pendingRequests}`, 30, 145)
      pdf.text(`Overdue Approvals: ${overdueApprovals}`, 30, 155)

      // Payroll compliance
      pdf.setFontSize(14)
      pdf.text('Payroll Compliance', 20, 175)
      
      pdf.setFontSize(10)
      const processedPeriods = payrollPeriods.filter(p => p.status === 'PROCESSED').length
      const draftPeriods = payrollPeriods.filter(p => p.status === 'DRAFT').length

      pdf.text(`Processed Payroll Periods: ${processedPeriods}`, 30, 190)
      pdf.text(`Draft Payroll Periods: ${draftPeriods}`, 30, 200)

      pdf.save(`compliance-report-${new Date().toISOString().split('T')[0]}.pdf`)

      await createClientAuditLog({
        action: 'EXPORT',
        resource: 'EMPLOYEE',
        details: { report_type: 'compliance_report' }
      })
    } catch (error) {
      console.error('Error generating compliance report:', error)
    }
  }

  const reportCards = [
    {
      title: t('employeeReport'),
      description: t('employeeReportDesc'),
      icon: Users,
      count: reportData.employees.length,
      onClick: generateEmployeeReport
    },
    {
      title: t('performanceReport'),
      description: t('performanceReportDesc'),
      icon: Briefcase,
      count: reportData.performanceReviews.length,
      onClick: generatePerformanceReport
    },
    {
      title: t('timeOffReport'),
      description: t('timeOffReportDesc'),
      icon: Calendar,
      count: reportData.timeOffRequests.length,
      onClick: generateTimeOffReport
    },
    {
      title: t('payrollReport'),
      description: t('payrollReportDesc'),
      icon: DollarSign,
      count: reportData.payrollPeriods.length,
      onClick: generatePayrollReport
    },
    {
      title: t('complianceReport'),
      description: t('complianceReportDesc'),
      icon: FileText,
      count: reportData.employees.length,
      onClick: generateComplianceReport
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-platinum">{t('title')}</h1>
        <Button onClick={fetchReportData} disabled={loading}>
          {loading ? t('refreshing') : t('refresh')}
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>{t('reportPeriod')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-sunset mb-1">
                {t('startDate')}
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sunset mb-1">
                {t('endDate')}
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input-base"
              />
            </div>
            <Button onClick={fetchReportData} className="mt-6">
              {t('updateData')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <report.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-2xl font-bold text-platinum">{report.count}</span>
              </div>
              <h3 className="font-semibold text-platinum mb-2">{report.title}</h3>
              <p className="text-sm text-sunset mb-4">{report.description}</p>
              <Button 
                onClick={report.onClick}
                className="w-full btn-primary"
                disabled={loading}
              >
                <Download className="w-4 h-4 mr-2" />
                {t('downloadPDF')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
