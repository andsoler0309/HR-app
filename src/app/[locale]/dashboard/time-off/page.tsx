// src/app/dashboard/time-off/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl' // Import useTranslations
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TimeOffCalendar from '@/components/time-off/Calendar'
import TimeOffBalances from '@/components/time-off/Balances'
import TimeOffRequests from '@/components/time-off/Requests'
import RequestTimeOffModal from '@/components/time-off/RequestModal'
import CreatePolicyModal from '@/components/time-off/CreatePolicyModal'
import PoliciesManagement from '@/components/time-off/PoliciesManagement' // Import the Policies Management component
import TourGuide from '@/components/shared/TourGuide'
import HelpWidget from '@/components/shared/HelpWidget'
import { useHelp } from '@/context/HelpContext'
import { createTimeOffTour } from '@/lib/tour-configs/timeoff-tour'
import { supabase } from '@/lib/supabase'
import type { TimeOffRequest, TimeOffBalance, TimeOffPolicy } from '@/types/timeoff'
import { useCompany } from '@/hooks/useCompany'
import { RefreshCw, Search } from 'lucide-react'
import { calculateDays } from '@/lib/utils'

export default function TimeOffPage() {
  const t = useTranslations('TimeOffPage') // Initialize useTranslations with the namespace 'TimeOffPage'
  const tTours = useTranslations('tours');
  const { tourIsVisible, helpIsVisible, setTourVisible, setHelpVisible } = useHelp();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [requests, setRequests] = useState<TimeOffRequest[]>([])
  const [balances, setBalances] = useState<TimeOffBalance[]>([])
  const [policies, setPolicies] = useState<TimeOffPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('calendar')

  const { companyId } = useCompany()

  // Function to get the current section name
  const getCurrentSectionName = () => {
    switch (activeTab) {
      case 'calendar':
        return t('tabs.calendar')
      case 'requests':
        return t('tabs.requests')
      case 'policies':
        return t('tabs.policies')
      default:
        return t('tabs.calendar')
    }
  }

  const filteredBalances = balances.filter(balance => 
    `${balance.employee?.first_name} ${balance.employee?.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  // Group balances by type
  const groupedBalances = filteredBalances.reduce((acc, balance) => {
    const type = balance.policy?.type || 'OTHER'
    if (!acc[type]) acc[type] = []
    acc[type].push(balance)
    return acc
  }, {} as Record<string, TimeOffBalance[]>)

  useEffect(() => {
    if (companyId) {
      fetchData()
    }
  }, [companyId])

  
  async function refreshBalances() {
    try {
      setIsRefreshing(true)
      // Call a stored procedure/function in your database
      const { error } = await supabase.rpc('handle_time_off_anniversary')
      
      if (error) throw error
  
      // Refresh the balances display
      await fetchData()
    } catch (err) {
      console.error('Error refreshing balances:', err)
    } finally {
      setIsRefreshing(false)
    }
  }

  async function fetchData() {
    try {
      setLoading(true)
      const [requestsData, balancesData, policiesData] = await Promise.all([
        fetchRequests(),
        fetchBalances(),
        fetchPolicies()
      ]) as [TimeOffRequest[], TimeOffBalance[], TimeOffPolicy[]];

      setRequests(requestsData || [])
      setBalances(balancesData || [])
      setPolicies(policiesData || [])
    } finally {
      setLoading(false)
    }
  }

  async function fetchRequests() {
    try {
      // Fetch both regular time off requests and portal requests
      const [regularRequests, portalRequests] = await Promise.all([
        supabase
          .from('time_off_requests')
          .select(`
            *,
            employee:employee_id(
              first_name,
              last_name,
              department:department_id(name)
            ),
            policy:policy_id(
              name,
              type
            )
          `)
          .eq('company_id', companyId),

        supabase
          .from('employee_portal_requests')
          .select(`
            *,
            employee:employee_id(
              first_name,
              last_name,
              department:department_id(name)
            )
          `)
          .eq('company_id', companyId)
          .eq('type', 'TIME_OFF')
          .neq('status', 'APPROVED') // Exclude approved portal requests
      ])

      if (regularRequests.error) throw regularRequests.error
      if (portalRequests.error) throw portalRequests.error

      // Transform regular requests to include policy type
      const transformedRegularRequests = regularRequests.data.map(request => ({
        ...request,
        type: request.policy?.type,
        source: 'TIME_OFF_REQUESTS' as const
      }))

      // Transform portal requests to match time off request format
      const transformedPortalRequests = portalRequests.data.map(request => ({
        id: request.id,
        employee_id: request.employee_id,
        start_date: request.data.start_date,
        end_date: request.data.end_date,
        type: request.data.leave_type,
        status: request.status,
        reason: request.data.reason,
        employee: request.employee,
        created_at: request.created_at,
        company_id: request.company_id,
        days: 0,
        source: 'PORTAL' as const
      }))

      // Combine both types of requests
      return [ ...transformedRegularRequests, ...transformedPortalRequests]
    } catch (error) {
      console.error('Error fetching requests:', error)
      return []
    }
  }

  async function fetchBalances() {
    const { data, error } = await supabase
      .from('time_off_balances')
      .select(`
        *,
        policy:policy_id(*),
        employee:employee_id(first_name, last_name)
      `)
      .eq('company_id', companyId)
      .order('year', { ascending: true }); // Order by year to process them in sequence
  
    if (error) throw error;
  
    // Group balances by employee and policy
    const consolidatedBalances = data.reduce((acc, balance) => {
      const key = `${balance.employee_id}-${balance.policy_id}`;
      
      if (!acc[key]) {
        // Initialize with the first balance entry
        acc[key] = {
          ...balance,
          total_days: Number(balance.total_days),
          used_days: Number(balance.used_days),
        };
      } else {
        // Add subsequent years' balances
        acc[key].total_days += Number(balance.total_days);
        acc[key].used_days += Number(balance.used_days);
      }
      
      return acc;
    }, {});
  
    return Object.values(consolidatedBalances);
  }

  async function fetchPolicies() {
    const { data, error } = await supabase
      .from('time_off_policies')
      .select('*')
      .eq('company_id', companyId)
    
    if (error) throw error
    return data
  }

  async function getPolicyId(leaveType: string): Promise<string> {
    const { data, error } = await supabase
      .from('time_off_policies')
      .select('id')
      .eq('type', leaveType)
      .eq('company_id', companyId)
      .single();

    if (error || !data) {
      throw new Error(t('errors.policyNotFound', { leaveType })) // Use translation for error message
    }

    return data.id;
  }

  async function approveRequest(requestId: string): Promise<void> {
    try {
      // Fetch the request data from employee_portal_requests
      const { data: portalRequest, error: fetchError } = await supabase
        .from('employee_portal_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;

      if (!portalRequest) {
        throw new Error(t('errors.requestNotFound', { requestId })) // Use translation for error message
      }

      // Extract and process the necessary data
      const { employee_id, company_id, data, type } = portalRequest;

      if (type !== 'TIME_OFF') {
        throw new Error(t('errors.invalidRequestType', { type })) // Use translation for error message
      }

      const { start_date, end_date, leave_type, reason } = data;

      // Calculate the number of days
      const days = calculateDays(start_date, end_date);

      // Fetch the policy ID based on leave_type
      const policy_id = await getPolicyId(leave_type);


      // 3. Fetch the relevant time_off_balance
      let { data: balanceData, error: balanceError } = await supabase
        .from('time_off_balances')
        .select('*')
        .eq('employee_id', employee_id)
        .eq('policy_id', policy_id)
        .eq('year', new Date().getFullYear())
        .maybeSingle(); // Use maybeSingle instead of single

      if (balanceError) throw balanceError;

      // If no balance exists, create one
      if (!balanceData) {
        // First, get the policy to know how many days per year
        const { data: policyData, error: policyError } = await supabase
          .from('time_off_policies')
          .select('days_per_year')
          .eq('id', policy_id)
          .single();

        if (policyError) throw policyError;

        // Create the balance
        const { data: newBalance, error: createError } = await supabase
          .from('time_off_balances')
          .insert({
            employee_id,
            company_id,
            policy_id,
            year: new Date().getFullYear(),
            total_days: policyData.days_per_year,
            used_days: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        
        balanceData = newBalance;
      }

      if (!balanceData) {
        throw new Error(t('errors.balanceNotFound')) // Use translation for error message
      }

      // 4. Calculate the new used_days and remaining_days
      const newUsedDays = parseFloat(balanceData.used_days.toString()) + days;
      const totalAvailableDays = parseFloat(balanceData.total_days.toString());

      if (newUsedDays > totalAvailableDays) {
        throw new Error(t('errors.insufficientBalance')) // Use translation for error message
      }


      // Begin transaction-like operations
      // 1. Insert into time_off_requests
      const { data: insertedRequest, error: insertError } = await supabase
        .from('time_off_requests')
        .insert({
          employee_id,
          company_id,
          policy_id,
          start_date,
          end_date,
          total_days: days,
          status: 'APPROVED',
          reason,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Update the original request's status in employee_portal_requests
      const { error: updateError } = await supabase
        .from('employee_portal_requests')
        .update({ status: 'APPROVED' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // 5. Update the time_off_balances table
      const { error: balanceUpdateError } = await supabase
        .from('time_off_balances')
        .update({
          used_days: newUsedDays,
          updated_at: new Date().toISOString(),
        })
        .eq('id', balanceData.id);

      if (balanceUpdateError) throw balanceUpdateError;

      // 6. Refresh data after processing
      await fetchData();
    } catch (error) {
      console.error('Error approving request:', error)
      // Optionally, display error to the user
      alert(error instanceof Error ? error.message : t('errors.unexpected'))
    }
  }

  async function rejectRequest(requestId: string): Promise<void> {
    try {
      // Update the status of the request in employee_portal_requests
      const { error } = await supabase
        .from('employee_portal_requests')
        .update({ status: 'REJECTED' })
        .eq('id', requestId);

      if (error) throw error;

      // Refresh data after processing
      await fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error)
      // Optionally, display error to the user
      alert(error instanceof Error ? error.message : t('errors.unexpected'))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-platinum">{t('title')}</h1>
          <div className="flex items-center space-x-3 mt-3">
            <span className="text-sm text-sunset font-medium">{t('currentSection')}:</span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 backdrop-blur-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-primary">
                {getCurrentSectionName()}
              </span>
            </div>
          </div>
          <p className="text-sm text-sunset mt-2 sm:hidden">Gestión de vacaciones y permisos</p>
        </div>
        <button
          onClick={refreshBalances}
          disabled={isRefreshing}
          data-tour="refresh-balances"
          className="btn-secondary inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto"
        >
          {isRefreshing ? (
            <>
              <div className="w-4 h-4 border-2 border-sunset/20 border-t-sunset rounded-full animate-spin" />
              <span>{t('buttons.refreshing')}</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>{t('buttons.refreshBalances')}</span>
            </>
          )}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sunset w-5 h-5" />
        <input
          type="text"
          placeholder={t('placeholders.searchEmployee')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input input-base pl-12 text-base py-3 w-full"
        />
      </div>


  
      {/* Balances Section - Responsive Grid */}
      {Object.entries(groupedBalances).map(([type, typeBalances]) => (
        <div key={type}>
          <h2 className="text-base font-medium text-sunset mb-4">{t(`balanceTypes.${type}`)}</h2>
          <div className="balance-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {typeBalances.map((balance) => (
              <div
                key={balance.id}
                className="bg-card rounded-lg border border-card-border p-4 sm:p-5 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <div className="text-base font-medium text-platinum">
                    {balance.employee?.first_name} {balance.employee?.last_name}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
                  <div>
                    <div className="text-xs sm:text-sm text-sunset">{t('labels.total')}</div>
                    <div className="text-sm sm:text-base font-semibold mt-1 text-platinum">
                      {balance.total_days} {t('units.days')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-sunset">{t('labels.used')}</div>
                    <div className="text-sm sm:text-base font-semibold mt-1 text-platinum">
                      {balance.used_days} {t('units.days')}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-sunset">{t('labels.left')}</div>
                    <div className="text-sm sm:text-base font-semibold mt-1 text-platinum">
                      {balance.total_days - balance.used_days} {t('units.days')}
                    </div>
                  </div>
                </div>

                <div className="h-2 bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (balance.used_days / balance.total_days) * 100,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
  
      {/* Tabs Section */}
      <div className="bg-card rounded-lg border border-card-border overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-background/30 border-b border-card-border/50">
            <div className="px-4 sm:px-8 py-2">
              <TabsList className="bg-transparent p-0 h-auto gap-0 w-full justify-center">
                <TabsTrigger 
                  value="calendar"
                  className="relative px-6 py-4 text-sm sm:text-base font-medium rounded-none bg-transparent border-0 w-full sm:w-auto
                  data-[state=active]:text-primary data-[state=active]:bg-card data-[state=active]:shadow-sm
                  data-[state=inactive]:text-sunset data-[state=inactive]:hover:text-platinum data-[state=inactive]:hover:bg-background/20
                  focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50
                  transition-all duration-300 ease-in-out
                  before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary before:scale-x-0 before:origin-center before:transition-transform before:duration-300
                  data-[state=active]:before:scale-x-100"
                >
                  {t('tabs.calendar')}
                </TabsTrigger>
                <TabsTrigger 
                  value="requests"
                  className="relative px-6 py-4 text-sm sm:text-base font-medium rounded-none bg-transparent border-0 w-full sm:w-auto
                  data-[state=active]:text-primary data-[state=active]:bg-card data-[state=active]:shadow-sm
                  data-[state=inactive]:text-sunset data-[state=inactive]:hover:text-platinum data-[state=inactive]:hover:bg-background/20
                  focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50
                  transition-all duration-300 ease-in-out
                  before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary before:scale-x-0 before:origin-center before:transition-transform before:duration-300
                  data-[state=active]:before:scale-x-100"
                >
                  {t('tabs.requests')}
                </TabsTrigger>
                <TabsTrigger 
                  value="policies"
                  className="relative px-6 py-4 text-sm sm:text-base font-medium rounded-none bg-transparent border-0 w-full sm:w-auto
                  data-[state=active]:text-primary data-[state=active]:bg-card data-[state=active]:shadow-sm
                  data-[state=inactive]:text-sunset data-[state=inactive]:hover:text-platinum data-[state=inactive]:hover:bg-background/20
                  focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50
                  transition-all duration-300 ease-in-out
                  before:absolute before:bottom-0 before:left-0 before:right-0 before:h-0.5 before:bg-primary before:scale-x-0 before:origin-center before:transition-transform before:duration-300
                  data-[state=active]:before:scale-x-100"
                >
                  {t('tabs.policies')}
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="calendar" className="p-4 sm:p-8 focus:outline-none">
            <div className="mb-6 pb-4 border-b border-card-border/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <h2 className="text-xl font-semibold text-platinum">
                  {t('tabs.calendar')}
                </h2>
              </div>
              <p className="text-sunset ml-11">{t('descriptions.calendar')}</p>
            </div>
            <TimeOffCalendar requests={requests} loading={loading} />
          </TabsContent>

          <TabsContent value="requests" className="p-4 sm:p-8 focus:outline-none">
            <div className="mb-6 pb-4 border-b border-card-border/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <h2 className="text-xl font-semibold text-platinum">
                  {t('tabs.requests')}
                </h2>
              </div>
              <p className="text-sunset ml-11">{t('descriptions.requests')}</p>
            </div>
            <div className="request-status">
              <TimeOffRequests 
                requests={requests} 
                loading={loading}
                onApprove={approveRequest}
                onReject={rejectRequest}
              />
            </div>
          </TabsContent>

          <TabsContent value="policies" className="p-4 sm:p-8 focus:outline-none">
            <div className="mb-6 pb-4 border-b border-card-border/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                </div>
                <h2 className="text-xl font-semibold text-platinum">
                  {t('tabs.policies')}
                </h2>
              </div>
              <p className="text-sunset ml-11">{t('descriptions.policies')}</p>
            </div>
            <PoliciesManagement 
              policies={policies} 
              onPolicyChange={fetchData} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <RequestTimeOffModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        policies={policies}
        onSuccess={fetchData}
      />

      <CreatePolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* Tour Guide */}
      <TourGuide
        steps={createTimeOffTour(tTours)}
        isOpen={tourIsVisible}
        onClose={() => setTourVisible(false)}
        onComplete={() => setTourVisible(false)}
      />

      {/* Help Widget */}
      <HelpWidget 
        currentPage="time-off" 
        forceOpen={helpIsVisible}
        onOpenChange={(isOpen) => {
          if (!isOpen) setHelpVisible(false);
        }}
      />
    </div>
  )
}
