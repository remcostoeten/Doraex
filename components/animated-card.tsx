"use client"

import { motion, Variants } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ComponentPropsWithoutRef, forwardRef } from "react"

type TCardProps = ComponentPropsWithoutRef<typeof Card>

type TProps = TCardProps & {
  delay?: number
  variants?: {
    initial?: Variants["initial"]
    animate?: Variants["animate"]
    exit?: Variants["exit"]
    hover?: Variants["hover"]
    tap?: Variants["tap"]
  }
  animateOnce?: boolean
  viewport?: {
    once?: boolean
    amount?: number
  }
}

const defaultVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  hover: {},
  tap: { scale: 0.98 }
}

export const AnimatedCard = forwardRef<HTMLDivElement, TProps>(
  function AnimatedCard(
    { 
      delay = 0, 
      variants = defaultVariants, 
      animateOnce = false,
      viewport = { once: true, amount: 0.3 },
      className,
      children,
      ...props 
    }, 
    ref
  ) {
    const mergedVariants = {
      initial: variants.initial || defaultVariants.initial,
      animate: variants.animate || defaultVariants.animate,
      exit: variants.exit || defaultVariants.exit,
      hover: variants.hover || defaultVariants.hover,
      tap: variants.tap || defaultVariants.tap
    }

    return (
      <motion.div
        ref={ref}
        initial="initial"
        animate="animate"
        exit="exit"
        whileHover="hover"
        whileTap="tap"
        variants={mergedVariants}
        transition={{
          duration: 0.3,
          ease: "easeOut",
          delay
        }}
        viewport={viewport}
        className={cn("w-full", className)}
      >
        <Card {...props} className="h-full">
          {children}
        </Card>
      </motion.div>
    )
  }
)

export { CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
