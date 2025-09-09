'use client'
import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuditLog, AuditAction, AuditResource, AuditLogFilters } from '@/types/audit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, Filter, Download, Eye, Shield, AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'

export default function AuditLogs() {
  const t = useTranslations('audit')
  
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<AuditLogFilters>({
    date_from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0]
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchAuditLogs()
  }, [filters])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:user_id(id, email)
        `)
        .eq('company_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(100)

      if (filters.date_from) {
        query = query.gte('timestamp', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('timestamp', filters.date_to + 'T23:59:59.999Z')
      }
      if (filters.action) {
        query = query.eq('action', filters.action)
      }
      if (filters.resource) {
        query = query.eq('resource', filters.resource)
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }

      const { data, error } = await query

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return <div className="w-2 h-2 bg-success rounded-full" />
      case 'UPDATE':
        return <div className="w-2 h-2 bg-warning rounded-full" />
      case 'DELETE':
        return <div className="w-2 h-2 bg-error rounded-full" />
      case 'LOGIN':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />
      case 'LOGOUT':
        return <div className="w-2 h-2 bg-purple-500 rounded-full" />
      case 'EXPORT':
        return <div className="w-2 h-2 bg-vanilla rounded-full" />
      case 'APPROVE':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />
      case 'REJECT':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
      default:
        return <div className="w-2 h-2 bg-sunset rounded-full" />
    }
  }

  const getRiskLevel = (action: AuditAction, resource: AuditResource) => {
    if (action === 'DELETE' || (action === 'UPDATE' && resource === 'PAYROLL')) {
      return { level: 'high', color: 'text-error', icon: AlertTriangle }
    }
    if (action === 'EXPORT' || action === 'CREATE') {
      return { level: 'medium', color: 'text-warning', icon: Eye }
    }
    return { level: 'low', color: 'text-success', icon: Shield }
  }

  const exportLogs = async () => {
    try {
      const csvContent = [
        ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'IP Address', 'Details'].join(','),
        ...logs.map(log => [
          format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
          log.user?.email || 'Unknown',
          log.action,
          log.resource,
          log.resource_id || '',
          log.ip_address || '',
          JSON.stringify(log.details || {})
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting logs:', error)
    }
  }

  const stats = {
    total: logs.length,
    highRisk: logs.filter(log => {
      const risk = getRiskLevel(log.action, log.resource)
      return risk.level === 'high'
    }).length,
    uniqueUsers: new Set(logs.map(log => log.user_id)).size,
    recentActivity: logs.filter(log => 
      new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-platinum">{t('title')}</h1>
        <Button onClick={exportLogs} disabled={loading}>
          <Download className="w-4 h-4 mr-2" />
          {t('exportCsv')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sunset">{t('totalLogs')}</p>
                <p className="text-2xl font-bold text-platinum">{stats.total}</p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sunset">{t('highRiskActions')}</p>
                <p className="text-2xl font-bold text-error">{stats.highRisk}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sunset">{t('uniqueUsers')}</p>
                <p className="text-2xl font-bold text-platinum">{stats.uniqueUsers}</p>
              </div>
              <Eye className="w-8 h-8 text-vanilla" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-sunset">{t('recentActivity')}</p>
                <p className="text-2xl font-bold text-success">{stats.recentActivity}</p>
              </div>
              <Shield className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {t('filters')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-sunset mb-1">
                {t('dateFrom')}
              </label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                className="input-base w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sunset mb-1">
                {t('dateTo')}
              </label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                className="input-base w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-sunset mb-1">
                {t('action')}
              </label>
              <select
                value={filters.action || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value as AuditAction || undefined }))}
                className="input-base w-full"
              >
                <option value="">{t('allActions')}</option>
                <option value="CREATE">{t('actions.create')}</option>
                <option value="UPDATE">{t('actions.update')}</option>
                <option value="DELETE">{t('actions.delete')}</option>
                <option value="LOGIN">{t('actions.login')}</option>
                <option value="LOGOUT">{t('actions.logout')}</option>
                <option value="EXPORT">{t('actions.export')}</option>
                <option value="APPROVE">{t('actions.approve')}</option>
                <option value="REJECT">{t('actions.reject')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-sunset mb-1">
                {t('resource')}
              </label>
              <select
                value={filters.resource || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, resource: e.target.value as AuditResource || undefined }))}
                className="input-base w-full"
              >
                <option value="">{t('allResources')}</option>
                <option value="EMPLOYEE">{t('resources.employee')}</option>
                <option value="DEPARTMENT">{t('resources.department')}</option>
                <option value="TIME_OFF">{t('resources.timeOff')}</option>
                <option value="PAYROLL">{t('resources.payroll')}</option>
                <option value="DOCUMENT">{t('resources.document')}</option>
                <option value="PERFORMANCE_REVIEW">{t('resources.performanceReview')}</option>
                <option value="USER_SESSION">{t('resources.userSession')}</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchAuditLogs} className="w-full">
                {t('applyFilters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-card-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('timestamp')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('user')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('action')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('resource')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('risk')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('ipAddress')}</th>
                  <th className="text-left p-4 text-sm font-medium text-sunset">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-sunset">
                      {t('loading')}
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-sunset">
                      {t('noLogs')}
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const risk = getRiskLevel(log.action, log.resource)
                    const RiskIcon = risk.icon

                    return (
                      <tr key={log.id} className="hover:bg-background/50">
                        <td className="p-4 text-sunset">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </td>
                        <td className="p-4 text-platinum">
                          {log.user?.email || 'System'}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getActionIcon(log.action)}
                            <span className="text-sunset">{t(`actions.${log.action.toLowerCase()}`)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sunset">
                          {t(`resources.${log.resource.toLowerCase().replace('_', '')}`)}
                        </td>
                        <td className="p-4">
                          <div className={`flex items-center gap-1 ${risk.color}`}>
                            <RiskIcon className="w-4 h-4" />
                            <span className="text-xs">{t(`risk.${risk.level}`)}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sunset">
                          {log.ip_address || '-'}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedLog(log)
                              setShowDetails(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-2xl border border-card-border shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-platinum">{t('logDetails')}</h3>
              <Button variant="ghost" onClick={() => setShowDetails(false)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-sunset">{t('timestamp')}</label>
                  <p className="text-platinum">{format(new Date(selectedLog.timestamp), 'PPpp')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-sunset">{t('user')}</label>
                  <p className="text-platinum">{selectedLog.user?.email || 'System'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-sunset">{t('action')}</label>
                  <p className="text-platinum">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-sunset">{t('resource')}</label>
                  <p className="text-platinum">{selectedLog.resource}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-sunset">{t('resourceId')}</label>
                  <p className="text-platinum">{selectedLog.resource_id || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-sunset">{t('ipAddress')}</label>
                  <p className="text-platinum">{selectedLog.ip_address || '-'}</p>
                </div>
              </div>
              
              {selectedLog.user_agent && (
                <div>
                  <label className="text-sm font-medium text-sunset">{t('userAgent')}</label>
                  <p className="text-platinum text-sm break-all">{selectedLog.user_agent}</p>
                </div>
              )}
              
              {selectedLog.details && (
                <div>
                  <label className="text-sm font-medium text-sunset">{t('details')}</label>
                  <pre className="bg-background p-3 rounded-lg border border-card-border text-sm text-platinum overflow-x-auto">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
