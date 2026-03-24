// types/data-table.ts
export type ColumnType = 'text' | 'currency' | 'date' | 'badge' | undefined
export interface RowData {
  [key: string]: string | number | boolean | Date | null | object | undefined
}
export interface Column {
  key: string
  label: string
  type?: ColumnType
  align?: 'left' | 'center' | 'right'
  bold?: boolean
  sortable?: boolean
}
