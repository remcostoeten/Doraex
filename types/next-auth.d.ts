declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      username?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    username?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username?: string
  }
}
