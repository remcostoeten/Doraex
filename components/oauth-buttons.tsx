"use client"

import { signIn } from "next-auth/react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Chrome, Github } from "lucide-react"

type TProps = {
  disabled: boolean
}

export function OAuthButtons({ disabled }: TProps) {
  function handleGoogleSignIn() {
    signIn("google", { callbackUrl: "/" })
  }

  function handleGithubSignIn() {
    signIn("github", { callbackUrl: "/" })
  }

  return (
    <div className="space-y-3">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={disabled}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGithubSignIn}
          disabled={disabled}
        >
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </motion.div>
    </div>
  )
}
