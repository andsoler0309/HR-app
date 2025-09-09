'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Search, Check } from 'lucide-react'
import { Document } from '@/types/document'

interface Employee {
  id: string
  first_name: string
  last_name: string
  email: string
  department: { name: string }
}

interface Props {
  isOpen: boolean
  onClose: () => void
  document: Document
  onSuccess: () => void
}

export default function DocumentShareModal({ isOpen, onClose, document, onSuccess }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const searchEmployees = async (term: string) => {
    if (term.length < 2) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id,
          first_name,
          last_name,
          email,
          department:departments(name)
        `)
        .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(5)
        .single() as unknown as { data: Employee[]; error: any }

      if (error) throw error
      setEmployees(data || [])
    } catch (error) {
      console.error('Error searching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      setLoading(true)
      const shares = selectedEmployees.map(employeeId => ({
        document_id: document.id,
        shared_with: employeeId,
        permission_level: 'view'
      }))

      const { error } = await supabase
        .from('document_shares')
        .insert(shares)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error sharing document:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 w-full max-w-md border border-card-border shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-platinum">Share Document</h2>
          <button onClick={onClose} className="text-sunset hover:text-primary">
            <X className="w-6 h-6" />
          </button>
        </div>
   
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sunset w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees..."
              className="input-base pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                searchEmployees(e.target.value)
              }}
            />
          </div>
   
          <div className="border border-card-border rounded-md divide-y divide-card-border max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sunset">Loading...</div>
            ) : employees.length === 0 ? (
              <div className="p-4 text-center text-sunset">No employees found</div>
            ) : (
              employees.map((employee) => (
                <div
                  key={employee.id}
                  className="p-3 flex items-center justify-between hover:bg-background/50 cursor-pointer"
                  onClick={() => {
                    setSelectedEmployees(prev => 
                      prev.includes(employee.id)
                        ? prev.filter(id => id !== employee.id)
                        : [...prev, employee.id]
                    )
                  }}
                >
                  <div>
                    <p className="font-medium text-platinum">
                      {employee.first_name} {employee.last_name}
                    </p>
                    <p className="text-sm text-sunset">
                      {employee.department.name} • {employee.email}
                    </p>
                  </div>
                  {selectedEmployees.includes(employee.id) && (
                    <Check className="w-5 h-5 text-success" />
                  )}
                </div>
              ))
            )}
          </div>
   
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleShare}
              disabled={selectedEmployees.length === 0 || loading}
              className="btn-primary px-4 py-2 rounded-md disabled:opacity-50"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
   )
}