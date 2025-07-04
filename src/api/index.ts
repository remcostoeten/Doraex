import { Hono } from 'hono'
import { 
  getAllConnections, 
  testConnectionHandler, 
  createConnectionHandler, 
  executeQueryHandler, 
  getTablesHandler 
} from './handlers'
import {
  createTodoHandler,
  getAllTodosHandler,
  getTodoHandler,
  updateTodoHandler,
  deleteTodoHandler
} from './todoHandlers'

function createApi() {
  const api = new Hono()
  
  // Database connection routes
  api.get('/connections', getAllConnections)
  api.post('/connections/test', testConnectionHandler)
  api.post('/connections', createConnectionHandler)
  api.post('/connections/:id/query', executeQueryHandler)
  api.get('/connections/:id/tables', getTablesHandler)
  
  // Todo routes
  api.post('/todos', createTodoHandler)
  api.get('/todos', getAllTodosHandler)
  api.get('/todos/:id', getTodoHandler)
  api.put('/todos/:id', updateTodoHandler)
  api.delete('/todos/:id', deleteTodoHandler)
  
  return api
}

export { createApi }
