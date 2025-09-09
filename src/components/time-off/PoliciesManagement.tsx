// src/components/time-off/PoliciesManagement.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { TimeOffPolicy } from '@/types/timeoff'
import CreatePolicyModal from '@/components/time-off/CreatePolicyModal'
import EditPolicyModal from '@/components/time-off/EditPolicyModal'
import { useTranslations } from 'next-intl' // Import useTranslations

interface PoliciesManagementProps {
  policies: TimeOffPolicy[]
  onPolicyChange: () => void // Callback to refresh policies
}

export default function PoliciesManagement({ policies, onPolicyChange }: PoliciesManagementProps) {
  const t = useTranslations('TimeOffPage') // Initialize useTranslations with the namespace 'TimeOffPage'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedPolicy, setSelectedPolicy] = useState<TimeOffPolicy | null>(null)

  // Function to handle deletion of a policy
  const deletePolicy = async (policyId: string) => {
    if (!confirm(t('policiesManagement.confirmDelete'))) return

    const { error } = await supabase
      .from('time_off_policies')
      .delete()
      .eq('id', policyId)

    if (error) {
      console.error('Error deleting policy:', error)
      alert(t('policiesManagement.alertDeleteFailed'))
    } else {
      alert(t('policiesManagement.alertDeleteSuccess'))
      onPolicyChange()
    }
  }

  // Function to handle opening the edit modal
  const handleEdit = (policy: TimeOffPolicy) => {
    setSelectedPolicy(policy)
    setIsEditModalOpen(true)
  }

  return (
    <div className="p-4 bg-card rounded-lg shadow-md border border-card-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-platinum">{t('policiesManagement.title')}</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 btn-primary text-platinum rounded-md hover:btn-primary/90"
        >
          {t('policiesManagement.buttons.createPolicy')}
        </button>
      </div>
   
      <table className="min-w-full divide-y divide-card-border">
        <thead className="bg-background">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-sunset uppercase tracking-wider">{t('policiesManagement.tableHeaders.policyName')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-sunset uppercase tracking-wider">{t('policiesManagement.tableHeaders.type')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-sunset uppercase tracking-wider">{t('policiesManagement.tableHeaders.daysPerYear')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-sunset uppercase tracking-wider">{t('policiesManagement.tableHeaders.carriesForward')}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-sunset uppercase tracking-wider">{t('policiesManagement.tableHeaders.actions')}</th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-card-border">
          {policies.map(policy => (
            <tr key={policy.id} className="hover:bg-background/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-platinum">{policy.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-platinum">{t(`balances.balanceTypes.${policy.type}`)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-platinum">{policy.days_per_year}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-platinum">{policy.carries_forward ? t('policiesManagement.labels.yes') : t('policiesManagement.labels.no')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleEdit(policy)}
                  className="text-primary hover:text-vanilla mr-4"
                >
                  {t('policiesManagement.actions.edit')}
                </button>
                <button
                  onClick={() => deletePolicy(policy.id)}
                  className="text-error hover:text-error/80"
                >
                  {t('policiesManagement.actions.delete')}
                </button>
              </td>
            </tr>
          ))}
          {policies.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-4 whitespace-nowrap text-sm text-sunset text-center">
                {t('policiesManagement.messages.noPolicies')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
   
      {/* Create Policy Modal */}
      <CreatePolicyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={onPolicyChange}
      />
   
      {/* Edit Policy Modal */}
      {selectedPolicy && (
        <EditPolicyModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedPolicy(null)
          }}
          policy={selectedPolicy}
          onSuccess={onPolicyChange}
        />
      )}
    </div>
  )
}
