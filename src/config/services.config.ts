/**
 * Service Configuration
 * Configure which services to use: 'mock' or 'api'
 * This is the single point to switch between development and production services
 */

import { configureServices,servicesFactory } from '~/services'

// Configuration based on environment
const isDevelopment = process.env.NODE_ENV === 'development'
const USE_MOCK_SERVICES = process.env.USE_MOCK_SERVICES !== 'false' // Default to mock in development

// Service mode configuration
const SERVICE_MODE: 'mock' | 'api' = isDevelopment && USE_MOCK_SERVICES ? 'mock' : 'api'

// Apply configuration
configureServices(SERVICE_MODE)

// Export for external use
export { SERVICE_MODE }
export { servicesFactory }
