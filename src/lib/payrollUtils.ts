export const TIPOS_CONTRATO = {
    // FULL_TIME: 'FULL_TIME',
    // PART_TIME: 'PART_TIME',
    // PRESTACION_SERVICIOS: 'CONTRACTOR',
    // OBRA_LABOR: 'TEMPORARY'
    FULL_TIME: 'FULL_TIME',
    PART_TIME: 'PART_TIME',
    CONTRACTOR: 'CONTRACTOR',
    TEMPORARY: 'TEMPORARY'
  } as const;
  
  export const SMLV_2024 = 1300000;
  export const UVT_2024 = 47065;
  
  export const PORCENTAJES = {
    SALUD: {
      EMPLEADO: 0.04,      // 4% empleado
      EMPLEADOR: 0.085     // 8.5% empleador
    },
    PENSION: {
      EMPLEADO: 0.04,      // 4% empleado
      EMPLEADOR: 0.12      // 12% empleador
    },
    PARAFISCALES: {
      SENA: 0.02,         // 2%
      ICBF: 0.03,         // 3%
      CAJA_COMPENSACION: 0.04  // 4%
    },
    FONDO_SOLIDARIDAD: {
      BASE: 0.01,
      ADICIONAL: [
        { SMLV: 16, PORCENTAJE: 0.002 }, // 0.2% adicional
        { SMLV: 17, PORCENTAJE: 0.004 }, // 0.4% adicional
        { SMLV: 18, PORCENTAJE: 0.006 }, // 0.6% adicional
        { SMLV: 19, PORCENTAJE: 0.008 }, // 0.8% adicional
        { SMLV: 20, PORCENTAJE: 0.01 }   // 1.0% adicional
      ]
    }
  };
  
  export const TABLA_RETENCION = [
    { DESDE_UVT: 0, HASTA_UVT: 95, PORCENTAJE: 0, BASE_UVT: 0 },
    { DESDE_UVT: 95, HASTA_UVT: 150, PORCENTAJE: 0.19, BASE_UVT: 95 },
    { DESDE_UVT: 150, HASTA_UVT: 360, PORCENTAJE: 0.28, BASE_UVT: 150 },
    { DESDE_UVT: 360, HASTA_UVT: 640, PORCENTAJE: 0.33, BASE_UVT: 360 },
    { DESDE_UVT: 640, HASTA_UVT: 945, PORCENTAJE: 0.35, BASE_UVT: 640 },
    { DESDE_UVT: 945, HASTA_UVT: 2300, PORCENTAJE: 0.37, BASE_UVT: 945 },
    { DESDE_UVT: 2300, HASTA_UVT: Infinity, PORCENTAJE: 0.39, BASE_UVT: 2300 }
  ];
  
  interface Deducciones {
    salud: number;
    pension: number;
    fondoSolidaridad: number;
    retencionFuente: number;
    aporteEmpleador: {
      salud: number;
      pension: number;
      parafiscales: {
        sena: number;
        icbf: number;
        cajaCompensacion: number;
      };
    };
    total: number;
  }
  
  export function calcularRetencionFuente(salarioBase: number, deducciones: number): number {
    const salarioUVT = (salarioBase - deducciones) / UVT_2024;
    
    const rango = TABLA_RETENCION.find(r => 
      salarioUVT > r.DESDE_UVT && salarioUVT <= r.HASTA_UVT
    );
  
    if (!rango || rango.PORCENTAJE === 0) return 0;
  
    const baseGravableUVT = salarioUVT - rango.BASE_UVT;
    const retencionUVT = (baseGravableUVT * rango.PORCENTAJE);
    
    return Math.round(retencionUVT * UVT_2024);
  }
  
  export function calcularFondoSolidaridad(salarioBase: number): number {
    let fondoSolidaridad = 0;
    const salarioEnSMLV = salarioBase / SMLV_2024;
  
    if (salarioEnSMLV > 4) {
      fondoSolidaridad = salarioBase * PORCENTAJES.FONDO_SOLIDARIDAD.BASE;
      
      for (const rango of PORCENTAJES.FONDO_SOLIDARIDAD.ADICIONAL) {
        if (salarioEnSMLV >= rango.SMLV) {
          fondoSolidaridad += salarioBase * rango.PORCENTAJE;
        }
      }
    }
  
    return fondoSolidaridad;
  }
  
  export function calcularDeducciones(salarioBase: number, tipoContrato: keyof typeof TIPOS_CONTRATO): Deducciones {
    const deducciones: Deducciones = {
      salud: 0,
      pension: 0,
      fondoSolidaridad: 0,
      retencionFuente: 0,
      aporteEmpleador: {
        salud: 0,
        pension: 0,
        parafiscales: {
          sena: 0,
          icbf: 0,
          cajaCompensacion: 0
        }
      },
      total: 0
    };
  
    switch(tipoContrato) {
      case TIPOS_CONTRATO.CONTRACTOR:
        // Contratista asume todo
        deducciones.salud = salarioBase * (PORCENTAJES.SALUD.EMPLEADO + PORCENTAJES.SALUD.EMPLEADOR);
        deducciones.pension = salarioBase * (PORCENTAJES.PENSION.EMPLEADO + PORCENTAJES.PENSION.EMPLEADOR);
        break;
        
      case TIPOS_CONTRATO.FULL_TIME:
      case TIPOS_CONTRATO.PART_TIME:
        // Deducciones normales para contratos laborales
        deducciones.salud = salarioBase * PORCENTAJES.SALUD.EMPLEADO;
        deducciones.pension = salarioBase * PORCENTAJES.PENSION.EMPLEADO;
        
        // Aportes del empleador
        deducciones.aporteEmpleador.salud = salarioBase * PORCENTAJES.SALUD.EMPLEADOR;
        deducciones.aporteEmpleador.pension = salarioBase * PORCENTAJES.PENSION.EMPLEADOR;
        deducciones.aporteEmpleador.parafiscales = {
          sena: salarioBase * PORCENTAJES.PARAFISCALES.SENA,
          icbf: salarioBase * PORCENTAJES.PARAFISCALES.ICBF,
          cajaCompensacion: salarioBase * PORCENTAJES.PARAFISCALES.CAJA_COMPENSACION
        };
        break;
        
      case TIPOS_CONTRATO.TEMPORARY:
        // Similar a tiempo completo
        deducciones.salud = salarioBase * PORCENTAJES.SALUD.EMPLEADO;
        deducciones.pension = salarioBase * PORCENTAJES.PENSION.EMPLEADO;
        break;
    }
  
    // Fondo de Solidaridad (aplica a todos los tipos si supera 4 SMLV)
    deducciones.fondoSolidaridad = calcularFondoSolidaridad(salarioBase);
  
    // Retención en la fuente
    const deduccionesBase = deducciones.salud + deducciones.pension + deducciones.fondoSolidaridad;
    deducciones.retencionFuente = calcularRetencionFuente(salarioBase, deduccionesBase);
  
    // Total deducciones del empleado
    deducciones.total = deduccionesBase + deducciones.retencionFuente;
  
    return deducciones;
  }
  
  // Función auxiliar para formato de moneda
  export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }