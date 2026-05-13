export interface FaqItem {
  id: number
  question: string
  answer: string
}

export interface GlossaryTerm {
  term: string
  definition: string
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    question: '¿Cómo creo mi primer presupuesto?',
    answer:
      'Dirígete a la sección "Presupuestos" en el menú lateral y haz clic en "Nuevo Presupuesto". Define el período (mes y año), luego agrega tus ingresos esperados y distribuye el dinero entre ahorro y categorías de gastos. Una vez configurado, activa el presupuesto para comenzar a registrar transacciones.'
  },
  {
    id: 2,
    question: '¿Qué es el "Libre Sin Comprometer"?',
    answer:
      'Es el saldo que queda disponible después de separar el monto destinado al ahorro. Representa el dinero que puedes usar libremente para tus gastos del mes sin afectar tus metas de ahorro. Se calcula como: Ingreso total − Ahorro programado.'
  },
  {
    id: 3,
    question: '¿Cómo funciona el porcentaje de ahorro?',
    answer:
      'El porcentaje de ahorro indica qué fracción de tus ingresos destinas al ahorro mensual. Por ejemplo, si ganas $3.000.000 y ahorras $600.000, tu porcentaje de ahorro es del 20%. Puedes ajustar este porcentaje al crear o editar tu presupuesto; la plataforma calculará automáticamente el monto equivalente.'
  },
  {
    id: 4,
    question: '¿Puedo tener varias metas de ahorro al mismo tiempo?',
    answer:
      'Sí. Puedes crear múltiples metas de ahorro (vacaciones, fondo de emergencia, electrodoméstico, etc.) y la plataforma distribuirá el monto de ahorro disponible entre todas ellas. Cada meta tiene su propio avance, fecha objetivo y tasa de interés opcional.'
  },
  {
    id: 5,
    question: '¿Qué pasa con mi dinero al cerrar un presupuesto?',
    answer:
      'Al cerrar un presupuesto se registra el balance final del período. Los aportes a metas de ahorro pendientes se marcan según su estado (realizados o saltados). El cierre es permanente; una vez cerrado el presupuesto no puede reabrirse, pero puedes consultar su historial en cualquier momento.'
  },
  {
    id: 6,
    question: '¿Cómo registro un gasto no planificado?',
    answer:
      'Usa el formulario rápido de transacciones disponible en el encabezado o en la página de "Transacciones". Selecciona el tipo "Gasto", elige la categoría correspondiente y registra el monto. Los gastos no planificados se reflejan de inmediato en el balance de tu presupuesto activo.'
  },
  {
    id: 7,
    question: '¿Qué es el puntaje de salud financiera?',
    answer:
      'Es un score del 0 al 100 que evalúa qué tan bien estás ejecutando tu plan financiero. Considera factores como: porcentaje de ahorro alcanzado, gastos dentro del presupuesto, aportes a metas realizados y consistencia mensual. Un puntaje de 80 o más se considera excelente.'
  }
]

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Ahorro programado',
    definition: 'Monto reservado mensualmente antes de gastar. Se descuenta del ingreso al inicio del período y se distribuye entre las metas de ahorro activas.'
  },
  {
    term: 'Balance financiero',
    definition: 'Diferencia entre ingresos y gastos del período. Un balance positivo indica que los ingresos superan los gastos; uno negativo, que se gastó más de lo que se recibió.'
  },
  {
    term: 'Gasto planificado',
    definition: 'Gasto conocido de antemano (arriendo, servicios públicos, cuotas, etc.) que se agenda en el presupuesto antes de que ocurra.'
  },
  {
    term: 'Gasto real',
    definition: 'Total de transacciones de tipo gasto registradas en un período. Refleja el dinero efectivamente gastado, sin importar si estaba planificado o no.'
  },
  {
    term: 'Ingreso',
    definition: 'Dinero recibido en el período (salario, freelance, bonificaciones, etc.). Los ingresos planificados se configuran en el presupuesto; los reales se marcan como recibidos al ocurrir.'
  },
  {
    term: 'Interés compuesto',
    definition: 'Interés que se calcula sobre el capital más los intereses acumulados en períodos anteriores. Hace que el ahorro crezca de forma exponencial con el tiempo.'
  },
  {
    term: 'Libre Sin Comprometer',
    definition: 'Saldo restante después de separar el ahorro programado. Es el dinero disponible para gastar libremente durante el mes sin afectar las metas de ahorro.'
  },
  {
    term: 'Meta de ahorro',
    definition: 'Objetivo financiero definido con un nombre, monto objetivo y fecha límite. La plataforma calcula los aportes mensuales necesarios para alcanzarla a tiempo.'
  },
  {
    term: 'Porcentaje de ahorro',
    definition: 'Fracción del ingreso total destinada al ahorro cada mes, expresada en porcentaje. Se configura en el presupuesto y determina el monto de ahorro programado.'
  },
  {
    term: 'Presupuesto',
    definition: 'Plan mensual que organiza ingresos, ahorros y gastos. Define cuánto se puede gastar en cada categoría y cuánto se debe ahorrar durante el período.'
  },
  {
    term: 'Puntaje de salud financiera',
    definition: 'Score del 0 al 100 que mide qué tan bien se está ejecutando el plan financiero. Evalúa el cumplimiento del ahorro, el control de gastos y la consistencia mensual.'
  },
  {
    term: 'Tasa de interés',
    definition: 'Porcentaje anual que genera rendimiento sobre el saldo de una cuenta de ahorro. Se usa para proyectar el crecimiento de las metas con interés compuesto.'
  }
]
