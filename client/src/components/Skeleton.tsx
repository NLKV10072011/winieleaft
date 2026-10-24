import clsx from 'clsx'
import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  circle?: boolean
}

export function Skeleton({ className, circle }: SkeletonProps) {
  return (
    <div 
      className={clsx(
        "relative overflow-hidden bg-slate-200 dark:bg-slate-800",
        circle ? "rounded-full" : "rounded-2xl",
        className
      )}
    >
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent shadow-xl"
      />
    </div>
  )
}

export function ProductSkeleton() {
  return (
    <div className="rounded-[2.5rem] border border-slate-100 p-4 dark:border-slate-800/80">
      <Skeleton className="aspect-square w-full rounded-[2rem] mb-6" />
      <div className="space-y-3 px-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-4">
           <Skeleton className="h-6 w-20" />
           <Skeleton className="h-10 w-10" circle />
        </div>
      </div>
    </div>
  )
}
