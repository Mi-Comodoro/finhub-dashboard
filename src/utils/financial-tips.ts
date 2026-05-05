export interface FinancialTip {
  id: string
  icon: string
  message: string
  subMessage?: string
}

export const FINANCIAL_TIPS = {
  common: [
    {
      id: '1',
      icon: 'savings',
      message: 'Regla 50/30/20',
      subMessage: 'Destina 50% a necesidades, 30% a gustos y 20% a ahorros e inversiones.'
    },
    {
      id: '2',
      icon: 'trending_up',
      message: 'Ahorra antes de gastar',
      subMessage: 'Trata tu ahorro como un gasto fijo mensual para asegurar tu futuro financiero.'
    },
    {
      id: '3',
      icon: 'account_balance_wallet',
      message: 'Fondo de emergencia',
      subMessage: 'Mantén entre 3 y 6 meses de gastos en una cuenta de fácil acceso.'
    },
    {
      id: '4',
      icon: 'analytics',
      message: 'Revisa tu presupuesto',
      subMessage: 'Dedica tiempo cada semana para revisar tus gastos y ajustar tu plan.'
    },
    {
      id: '5',
      icon: 'lightbulb',
      message: 'Evita deudas innecesarias',
      subMessage:
        'Las deudas con intereses altos pueden afectar tus metas financieras a largo plazo.'
    }
  ],
  savings: [
    {
      id: 's1',
      icon: 'savings',
      message: 'Automatiza tu ahorro',
      subMessage: 'Configura transferencias automáticas el día que recibes tu ingreso.'
    },
    {
      id: 's2',
      icon: 'compare_arrows',
      message: 'Diversifica tus ahorros',
      subMessage:
        'No pongas todos tus ahorros en un solo lugar. Distribuye entre diferentes objetivos.'
    }
  ],
  budget: [
    {
      id: 'b1',
      icon: 'assignment',
      message: 'Planifica con anticipación',
      subMessage: 'Crea tu presupuesto antes de que inicie el mes para tener control total.'
    },
    {
      id: 'b2',
      icon: 'receipt_long',
      message: 'Registra cada gasto',
      subMessage: 'Aunque sea pequeño, cada gasto cuenta para mantener tu presupuesto equilibrado.'
    }
  ]
}
