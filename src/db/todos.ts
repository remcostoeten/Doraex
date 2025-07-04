import type { TTodo, TCreateTodo, TUpdateTodo } from '../types/todos'

const todos = new Map<number, TTodo>()
let nextId = 1

function createTodo(todo: TCreateTodo): TTodo {
  const now = new Date().toISOString()
  
  const newTodo: TTodo = {
    id: nextId++,
    title: todo.title,
    description: todo.description,
    completed: false,
    createdAt: now,
    updatedAt: now
  }
  
  todos.set(newTodo.id, newTodo)
  return newTodo
}

function getAllTodos(): TTodo[] {
  return Array.from(todos.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

function getTodoById(id: number): TTodo | null {
  return todos.get(id) || null
}

function updateTodo(id: number, updates: TUpdateTodo): TTodo | null {
  const existing = getTodoById(id)
  if (!existing) return null
  
  const now = new Date().toISOString()
  
  const updatedTodo: TTodo = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: now
  }
  
  todos.set(id, updatedTodo)
  return updatedTodo
}

function deleteTodo(id: number): boolean {
  return todos.delete(id)
}

export { createTodo, getAllTodos, getTodoById, updateTodo, deleteTodo }
