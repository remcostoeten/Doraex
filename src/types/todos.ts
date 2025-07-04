type TTodo = {
  id: number
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

type TCreateTodo = {
  title: string
  description?: string
}

type TUpdateTodo = {
  title?: string
  description?: string
  completed?: boolean
}

export type { TTodo, TCreateTodo, TUpdateTodo }
