import { PayrollDetail } from '@/types/salary'
import { Employee } from '@/types/employee'

interface PayslipData {
  employee: Employee
  payrollDetail: PayrollDetail
  period: {
    startDate: string
    endDate: string
  }
  company: {
    name: string
    nit: string
  }
}

export function generatePayslip(data: PayslipData): string {
  const {
    employee,
    payrollDetail,
    period,
    company
  } = data

  // Create HTML template for payslip
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .details { margin-bottom: 20px; }
        .earnings-deductions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .section { margin-bottom: 20px; }
        .total { font-weight: bold; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${company.name}</h1>
        <p>NIT: ${company.nit}</p>
        <h2>Comprobante de Pago</h2>
        <p>Período: ${period.startDate} - ${period.endDate}</p>
      </div>

      <div class="details">
        <h3>Información del Empleado</h3>
        <p>Nombre: ${employee.first_name} ${employee.last_name}</p>
        <p>Cargo: ${employee.position}</p>
        <p>Identificación: ${employee.id}</p>
      </div>

      <div class="earnings-deductions">
        <div class="section">
          <h3>Devengados</h3>
          <table>
            <tr>
              <td>Salario Base</td>
              <td>${formatCurrency(payrollDetail.base_salary)}</td>
            </tr>
            <tr>
              <td>Auxilio de Transporte</td>
              <td>${formatCurrency(payrollDetail.transportation_allowance)}</td>
            </tr>
            <tr>
              <td>Horas Extra</td>
              <td>${formatCurrency(payrollDetail.overtime)}</td>
            </tr>
            <tr>
              <td>Bonificaciones</td>
              <td>${formatCurrency(payrollDetail.bonuses)}</td>
            </tr>
            <tr>
              <td><strong>Total Devengado</strong></td>
              <td><strong>${formatCurrency(payrollDetail.gross_salary)}</strong></td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h3>Deducciones</h3>
          <table>
            <tr>
              <td>Salud (4%)</td>
              <td>${formatCurrency(payrollDetail.health_contribution)}</td>
            </tr>
            <tr>
              <td>Pensión (4%)</td>
              <td>${formatCurrency(payrollDetail.pension_contribution)}</td>
            </tr>
            <tr>
              <td>Fondo de Solidaridad</td>
              <td>${formatCurrency(payrollDetail.solidarity_fund)}</td>
            </tr>
            <tr>
              <td><strong>Total Deducciones</strong></td>
              <td><strong>${formatCurrency(payrollDetail.total_deductions)}</strong></td>
            </tr>
          </table>
        </div>
      </div>

      <div class="total">
        <h3>Neto a Pagar: ${formatCurrency(payrollDetail.net_salary)}</h3>
      </div>
    </body>
    </html>
  `
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount)
}