"use client"

import { motion } from "framer-motion"

export function MotionLayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      layout
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  )
}

export function MotionBox({
  children,
  layoutId,
  className = "",
  ...props
}: {
  children?: React.ReactNode
  layoutId?: string
  className?: string
  [key: string]: any
}) {
  return (
    <motion.div
      layout
      layoutId={layoutId}
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MotionTab({
  children,
  isActive,
  layoutId,
  className = "",
  onClick,
  ...props
}: {
  children: React.ReactNode
  isActive: boolean
  layoutId?: string
  className?: string
  onClick?: () => void
  [key: string]: any
}) {
  return (
    <motion.div
      layout
      layoutId={layoutId}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
        scale: {
          type: "spring",
          stiffness: 600,
          damping: 25,
        },
      }}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="active-tab-indicator"
          className="absolute inset-0 bg-background border border-border rounded-t-md -z-10"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
      )}
    </motion.div>
  )
}

export function MotionSidebar({
  children,
  isExpanded,
  className = "",
  ...props
}: {
  children: React.ReactNode
  isExpanded: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <motion.div
      layout
      animate={{
        width: isExpanded ? "256px" : "0px",
        opacity: isExpanded ? 1 : 0,
      }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
        width: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
        opacity: {
          duration: 0.2,
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MotionModal({
  children,
  isOpen,
  className = "",
  ...props
}: {
  children: React.ReactNode
  isOpen: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: isOpen ? 1 : 0,
        scale: isOpen ? 1 : 0.95,
      }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
        opacity: {
          duration: 0.2,
        },
        scale: {
          type: "spring",
          stiffness: 400,
          damping: 25,
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MotionList({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode
  className?: string
  [key: string]: any
}) {
  return (
    <motion.div
      layout
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MotionListItem({
  children,
  layoutId,
  className = "",
  isActive = false,
  ...props
}: {
  children: React.ReactNode
  layoutId?: string
  className?: string
  isActive?: boolean
  [key: string]: any
}) {
  return (
    <motion.div
      layout
      layoutId={layoutId}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
        x: {
          type: "spring",
          stiffness: 400,
          damping: 25,
        },
        scale: {
          type: "spring",
          stiffness: 600,
          damping: 25,
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MotionCollapsible({
  children,
  isOpen,
  className = "",
  ...props
}: {
  children: React.ReactNode
  isOpen: boolean
  className?: string
  [key: string]: any
}) {
  return (
    <motion.div
      layout
      animate={{
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
        height: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
        opacity: {
          duration: 0.2,
        },
      }}
      className={className}
      style={{ overflow: "hidden" }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function MotionCard({
  children,
  className = "",
  ...props
}: {
  children: React.ReactNode
  className?: string
  [key: string]: any
}) {
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 400,
          damping: 30,
        },
        y: {
          type: "spring",
          stiffness: 400,
          damping: 25,
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
