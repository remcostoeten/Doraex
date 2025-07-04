import { Hono } from 'hono'
import { 
  getAllConnections, 
  testConnectionHandler, 
  createConnectionHandler, 
  executeQueryHandler, 
  getTablesHandler 
} from './handlers'

function createApi() {
  const api = new Hono()
  
  api.get('/connections', getAllConnections)
  api.post('/connections/test', testConnectionHandler)
  api.post('/connections', createConnectionHandler)
  api.post('/connections/:id/query', executeQueryHandler)
  api.get('/connections/:id/tables', getTablesHandler)
  
  return api
}

export { createApi }
