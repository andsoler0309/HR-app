'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function SalaryReports() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)

  // Sample data structure
  const monthlyPayroll = [
    { month: 'Jan', total: 45000000 },
    { month: 'Feb', total: 46000000 },
    // ... add more months
  ]

  const departmentCosts = [
    { department: 'Engineering', cost: 25000000 },
    { department: 'Sales', cost: 18000000 },
    // ... add more departments
  ]

  const salaryRanges = [
    { range: '1-2 SMLV', count: 15 },
    { range: '2-4 SMLV', count: 25 },
    // ... add more ranges
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Salary Reports</h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="rounded-md border border-gray-300 px-3 py-2"
        >
          {[2024, 2023, 2022].map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Payroll Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Monthly Payroll Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyPayroll}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Department Cost Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Department Cost Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentCosts}
                  dataKey="cost"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry) => entry.department}
                >
                  {departmentCosts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Salary Range Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Salary Range Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryRanges}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Export Buttons */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Export Reports</h3>
        <div className="space-x-4">
          <button
            onClick={() => {/* Handle CSV export */}}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export to CSV
          </button>
          <button
            onClick={() => {/* Handle PDF export */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Export to PDF
          </button>
        </div>
      </Card>
    </div>
  )
}