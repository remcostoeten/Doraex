import type { Context } from 'hono'
import { createTodo, getAllTodos, getTodoById, updateTodo, deleteTodo } from '../db/todos'

async function createTodoHandler(c: Context) {
  try {
    const { title, description } = await c.req.json()
    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return c.json({ error: 'Title is required and must be a non-empty string' }, 400)
    }
    
    const newTodo = createTodo({
      title: title.trim(),
      description: description?.trim()
    })
    
    return c.json(newTodo, 201)
  } catch (error) {
    return c.json({ error: 'Failed to create todo' }, 500)
  }
}

async function getAllTodosHandler(c: Context) {
  try {
    const todos = getAllTodos()
    return c.json(todos)
  } catch (error) {
    return c.json({ error: 'Failed to fetch todos' }, 500)
  }
}

async function getTodoHandler(c: Context) {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid todo ID' }, 400)
    }
    
    const todo = getTodoById(id)
    
    if (!todo) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    
    return c.json(todo)
  } catch (error) {
    return c.json({ error: 'Failed to fetch todo' }, 500)
  }
}

async function updateTodoHandler(c: Context) {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid todo ID' }, 400)
    }
    
    const updates = await c.req.json()
    
    if (updates.title !== undefined && (typeof updates.title !== 'string' || updates.title.trim() === '')) {
      return c.json({ error: 'Title must be a non-empty string' }, 400)
    }
    
    if (updates.completed !== undefined && typeof updates.completed !== 'boolean') {
      return c.json({ error: 'Completed must be a boolean' }, 400)
    }
    
    const cleanedUpdates = {
      ...updates,
      title: updates.title?.trim(),
      description: updates.description?.trim()
    }
    
    const updatedTodo = updateTodo(id, cleanedUpdates)
    
    if (!updatedTodo) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    
    return c.json(updatedTodo)
  } catch (error) {
    return c.json({ error: 'Failed to update todo' }, 500)
  }
}

async function deleteTodoHandler(c: Context) {
  try {
    const id = parseInt(c.req.param('id'))
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid todo ID' }, 400)
    }
    
    const success = deleteTodo(id)
    
    if (!success) {
      return c.json({ error: 'Todo not found' }, 404)
    }
    
    return c.json({ message: 'Todo deleted successfully' })
  } catch (error) {
    return c.json({ error: 'Failed to delete todo' }, 500)
  }
}

export { 
  createTodoHandler, 
  getAllTodosHandler, 
  getTodoHandler, 
  updateTodoHandler, 
  deleteTodoHandler 
}
