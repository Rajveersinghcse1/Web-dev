import React from 'react';
import { cn } from '../../lib/utils';

/**
 * ResponsiveContainer - A flexible container component for consistent responsive layouts
 * @param {string} variant - Container size variant: 'sm' | 'md' | 'lg' | 'xl' | 'full'
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} children - Child components
 */
export const ResponsiveContainer = ({ 
  variant = 'lg', 
  className, 
  children, 
  ...props 
}) => {
  const variants = {
    sm: 'max-w-3xl',
    md: 'max-w-5xl', 
    lg: 'max-w-7xl',
    xl: 'max-w-screen-2xl',
    full: 'max-w-none'
  };

  return (
    <div 
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        variants[variant],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveGrid - Adaptive grid component for different content types
 * @param {string} variant - Grid type: 'cards' | 'list' | 'masonry' | 'stats' | 'gallery'
 * @param {string} className - Additional CSS classes  
 * @param {ReactNode} children - Child components
 */
export const ResponsiveGrid = ({ 
  variant = 'cards', 
  className, 
  children, 
  ...props 
}) => {
  const variants = {
    cards: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6',
    list: 'grid grid-cols-1 gap-3 sm:gap-4',
    masonry: 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6',
    stats: 'grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
    gallery: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4',
    navigation: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4'
  };

  return (
    <div 
      className={cn(variants[variant], className)} 
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveStack - Flexible stack layout for form elements and content
 * @param {string} direction - Stack direction: 'vertical' | 'horizontal' | 'responsive'
 * @param {string} gap - Gap size: 'sm' | 'md' | 'lg'
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} children - Child components
 */
export const ResponsiveStack = ({ 
  direction = 'vertical', 
  gap = 'md', 
  className, 
  children, 
  ...props 
}) => {
  const directions = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row',
    responsive: 'flex flex-col sm:flex-row'
  };

  const gaps = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  };

  return (
    <div 
      className={cn(
        directions[direction],
        gaps[gap],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * ResponsiveText - Text component with responsive sizing
 * @param {string} variant - Text variant: 'h1' | 'h2' | 'h3' | 'body' | 'caption'
 * @param {string} className - Additional CSS classes
 * @param {ReactNode} children - Text content
 */
export const ResponsiveText = ({ 
  variant = 'body', 
  className, 
  children, 
  as: Component = 'div',
  ...props 
}) => {
  const variants = {
    h1: 'text-2xl sm:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl sm:text-2xl lg:text-3xl font-bold',
    h3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
    body: 'text-sm sm:text-base',
    caption: 'text-xs sm:text-sm'
  };

  return (
    <Component 
      className={cn(variants[variant], className)} 
      {...props}
    >
      {children}
    </Component>
  );
};

export default {
  ResponsiveContainer,
  ResponsiveGrid, 
  ResponsiveStack,
  ResponsiveText
};
