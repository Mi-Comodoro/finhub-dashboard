/**
 * API Types - Common
 * Shared API contract types across all modules
 */

export interface ApiError {
  readonly code: string
  readonly message: string
  readonly statusCode: number
  readonly timestamp: string
  readonly path: string
  readonly details?: Record<string, unknown>
}

export interface ApiResponse<T> {
  readonly success: boolean
  readonly data: T
  readonly message?: string
}

export interface PaginatedApiResponse<T> {
  readonly success: boolean
  readonly data: readonly T[]
  readonly pagination: {
    readonly total: number
    readonly page: number
    readonly pageSize: number
    readonly totalPages: number
    readonly hasNextPage: boolean
    readonly hasPreviousPage: boolean
  }
}

export interface ApiQueryParams {
  readonly page?: string
  readonly pageSize?: string
  readonly sortBy?: string
  readonly sortOrder?: 'asc' | 'desc'
  readonly filters?: Record<string, string>
}

// HTTP methods for type safety
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Request configuration
export interface ApiRequestConfig {
  readonly method: HttpMethod
  readonly url: string
  readonly data?: unknown
  readonly params?: Record<string, string | number | boolean>
  readonly headers?: Record<string, string>
}
