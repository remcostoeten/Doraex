import { Hono } from 'hono'
import {
  getAllConnections,
  testConnectionHandler,
  createConnectionHandler,
  executeQueryHandler,
  getTablesHandler
} from './handlers'
import { createAuthApi } from './auth'
import { requireAuth, optionalAuth } from '../auth/auth-middleware'

function createApi() {
  const api = new Hono()
  
  // Authentication routes (public)
  const authApi = createAuthApi()
  api.route('/auth', authApi)
  
  // Test connection route (public - for initial setup)
  api.post('/test-connection', testConnectionHandler)
  
  // Protected database connection routes
  api.get('/connections', requireAuth, getAllConnections)
  api.post('/connections', requireAuth, createConnectionHandler)
  api.post('/connections/:id/query', requireAuth, executeQueryHandler)
  api.get('/connections/:id/tables', requireAuth, getTablesHandler)
  
  return api
}

export { createApi }
