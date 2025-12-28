'use client';

import { motion } from 'framer-motion';

// Generic skeleton component
export function Skeleton({ className = "", variant = "default", style = {} }) {
  const baseClasses = "animate-pulse bg-gray-100 rounded";
  
  const variants = {
    default: "h-4 w-full",
    text: "h-4 w-3/4",
    title: "h-6 w-1/2",
    circle: "rounded-full",
    button: "h-10 w-24",
    card: "h-32 w-full rounded-xl",
  };

  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className}`} 
      style={style}
    />
  );
}

// Progress Widget Skeleton
export function ProgressWidgetSkeleton() {
  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="title" className="w-32" />
        <Skeleton variant="circle" className="w-12 h-12" />
      </div>
      
      {/* XP Bar */}
      <div className="mb-6">
        <Skeleton className="h-3 w-full rounded-full" />
        <div className="flex justify-between mt-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-white rounded-xl border border-gray-300">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circle" className="w-12 h-12" />
        <div className="flex-1">
          <Skeleton variant="title" className="mb-2" />
          <Skeleton variant="text" />
        </div>
      </div>
      <Skeleton variant="card" className="mb-3" />
      <div className="flex gap-2">
        <Skeleton variant="button" className="rounded-lg" />
        <Skeleton variant="button" className="rounded-lg" />
      </div>
    </div>
  );
}

// History Item Skeleton
export function HistoryItemSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white backdrop-blur-xl rounded-xl border border-gray-300 p-4"
    >
      <div className="flex items-start gap-4">
        <Skeleton variant="circle" className="w-16 h-16" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton variant="circle" className="w-8 h-8" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </motion.div>
  );
}

// Analytics Chart Skeleton
export function ChartSkeleton() {
  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton variant="circle" className="w-5 h-5" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="h-64 bg-white rounded-lg flex items-end justify-around p-4 gap-2 border border-gray-300">
        {[40, 60, 45, 80, 55, 70, 50].map((height, i) => (
          <Skeleton
            key={i}
            className={`w-full rounded-t bg-gray-100`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Service Status Skeleton
export function ServiceStatusSkeleton() {
  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-6">
      <Skeleton variant="title" className="mb-4 w-40" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton variant="circle" className="w-4 h-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Feature Card Skeleton
export function FeatureCardSkeleton() {
  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton variant="circle" className="w-16 h-16" />
        <div className="flex-1">
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton variant="circle" className="w-10 h-10" />
      </div>
    </div>
  );
}

// Grid Skeleton (for grids of cards)
export function GridSkeleton({ count = 6, Component = CardSkeleton }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
}

// List Skeleton
export function ListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <HistoryItemSkeleton key={i} />
      ))}
    </div>
  );
}

// Dashboard Skeleton (full page)
export function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-8">
      {/* Hero */}
      <div>
        <Skeleton variant="title" className="w-64 mb-2" />
        <Skeleton variant="text" className="w-96" />
      </div>

      {/* Progress Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProgressWidgetSkeleton />
        </div>
        <ServiceStatusSkeleton />
      </div>

      {/* Features */}
      <div>
        <Skeleton variant="title" className="w-48 mb-6" />
        <GridSkeleton count={3} Component={FeatureCardSkeleton} />
      </div>

      {/* Activity */}
      <div>
        <Skeleton variant="title" className="w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ListSkeleton count={3} />
          <ListSkeleton count={3} />
        </div>
      </div>
    </div>
  );
}

// Page Loading Skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative inline-block">
          <Skeleton variant="circle" className="w-16 h-16 mb-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        </div>
        <Skeleton className="h-5 w-32 mx-auto" />
      </div>
    </div>
  );
}

export default Skeleton;

