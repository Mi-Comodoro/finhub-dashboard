/**
 * Domain Types - Common
 * Shared business logic types across all modules
 */

export interface DomainError {
  readonly code: string
  readonly message: string
  readonly details?: Record<string, unknown>
}

export interface StoreError {
  title: string
  message: string
  status?: number
}

export interface LoadingState {
  readonly isLoading: boolean
  readonly error: DomainError | null
}

export interface PaginatedResult<T> {
  readonly data: readonly T[]
  readonly total: number
  readonly page: number
  readonly pageSize: number
  readonly hasNextPage: boolean
  readonly hasPreviousPage: boolean
}

export interface SortOption {
  readonly field: string
  readonly direction: 'asc' | 'desc'
}

export interface FilterOption {
  readonly field: string
  readonly value: string | number | boolean
  readonly operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains'
}

export interface QueryOptions {
  readonly page?: number
  readonly pageSize?: number
  readonly sort?: SortOption[]
  readonly filters?: FilterOption[]
}

// Base result wrapper for all operations
export type Result<T, E = DomainError> = { success: true; data: T } | { success: false; error: E }

// Async result for operations that can fail
export type AsyncResult<T, E = DomainError> = Promise<Result<T, E>>
