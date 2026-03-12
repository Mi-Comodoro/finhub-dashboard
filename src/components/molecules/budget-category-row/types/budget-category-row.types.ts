import type { Currency } from '@/utils/currency';

export interface BudgetCategoryRowProps {
  label: string;
  percentage: number;
  amount: number;
  currency: Currency;
  /** Tailwind color class applied to the dot and the progress bar fill — e.g. "bg-teal-500" */
  color: string;
  /** 0–100 progress value; defaults to 0 until transactions are linked */
  progress?: number;
}
