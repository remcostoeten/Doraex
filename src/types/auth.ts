export type TUser = {
  id: string
  email: string
  password: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type TCreateUser = {
  email: string
  password: string
  name: string
}

export type TLoginUser = {
  email: string
  password: string
}

export type TAuthResponse = {
  user: Omit<TUser, 'password'>
  token: string
}

export type TJwtPayload = {
  userId: string
  email: string
  iat?: number
  exp?: number
}

export type TProtectedUser = Omit<TUser, 'password'>
