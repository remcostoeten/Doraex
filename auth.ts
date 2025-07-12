import NextAuth from "@auth/nextjs"
import CredentialsProvider from "@auth/nextjs/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This is a hardcoded user for demonstration purposes.
        // In a real application, you would query your database here.
        if (credentials.username === "demo" && credentials.password === "password") {
          return { id: "1", name: "Demo User", email: "demo@example.com" }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: "/login", // Redirect to a custom login page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET, // Ensure AUTH_SECRET is set in your .env
})
