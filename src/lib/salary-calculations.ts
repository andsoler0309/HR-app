export interface SalaryInputs {
    baseSalary: number
    hasTransportationAllowance: boolean
    config: {
      minimum_wage: number
      transportation_allowance: number
      health_contribution_percentage: number
      pension_contribution_percentage: number
      solidarity_fund_threshold: number
    }
    additionalEarnings?: {
      overtime?: number
      bonuses?: number
      commissions?: number
      other?: number
    }
  }
  
  export interface SalaryCalculation {
    grossSalary: number
    transportationAllowance: number
    totalEarnings: number
    deductions: {
      health: number
      pension: number
      solidarityFund: number
      total: number
    }
    netSalary: number
  }
  
  export function calculateSalary(inputs: SalaryInputs): SalaryCalculation {
    const {
      baseSalary,
      hasTransportationAllowance,
      config,
      additionalEarnings = {}
    } = inputs
  
    // Calculate additional earnings
    const totalAdditional = Object.values(additionalEarnings).reduce((sum, val) => sum + (val || 0), 0)
  
    // Calculate gross salary
    const grossSalary = baseSalary + totalAdditional
  
    // Transportation allowance (only if salary is <= 2 * minimum wage)
    const transportationAllowance = hasTransportationAllowance && 
      baseSalary <= (2 * config.minimum_wage) ? 
      config.transportation_allowance : 0
  
    // Calculate total earnings
    const totalEarnings = grossSalary + transportationAllowance
  
    // Calculate deductions
    const healthContribution = (grossSalary * config.health_contribution_percentage) / 100
    const pensionContribution = (grossSalary * config.pension_contribution_percentage) / 100
    
    // Solidarity fund (if salary > 4 * minimum wage)
    let solidarityFund = 0
    if (grossSalary > config.solidarity_fund_threshold) {
      const salaryInMinimumWages = grossSalary / config.minimum_wage
      if (salaryInMinimumWages <= 16) {
        solidarityFund = grossSalary * 0.01
      } else if (salaryInMinimumWages <= 17) {
        solidarityFund = grossSalary * 0.012
      } else if (salaryInMinimumWages <= 18) {
        solidarityFund = grossSalary * 0.014
      } else if (salaryInMinimumWages <= 19) {
        solidarityFund = grossSalary * 0.016
      } else {
        solidarityFund = grossSalary * 0.018
      }
    }
  
    const totalDeductions = healthContribution + pensionContribution + solidarityFund
  
    // Calculate net salary
    const netSalary = totalEarnings - totalDeductions
  
    return {
      grossSalary,
      transportationAllowance,
      totalEarnings,
      deductions: {
        health: healthContribution,
        pension: pensionContribution,
        solidarityFund,
        total: totalDeductions
      },
      netSalary
    }
  }
  
  export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }