/**
 * Transition Component - Smooth transitions and animations
 * 
 * Features:
 * - Fade in/out transitions
 * - Slide transitions
 * - Scale transitions
 * - Configurable duration and easing
 * 
 * Requirements: 10.3
 */

import React, { useState, useEffect, ReactNode } from 'react';
import clsx from 'clsx';

interface TransitionProps {
  show: boolean;
  children: ReactNode;
  type?: 'fade' | 'slide' | 'scale';
  duration?: number;
  className?: string;
  onEnter?: () => void;
  onExit?: () => void;
}

export const Transition: React.FC<TransitionProps> = ({
  show,
  children,
  type = 'fade',
  duration = 300,
  className = '',
  onEnter,
  onExit,
}) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsAnimating(true);
      onEnter?.();
      
      // Trigger animation after render
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 50);
      
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      onExit?.();
      
      // Hide after animation completes
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsAnimating(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onEnter, onExit]);

  if (!isVisible) {
    return null;
  }

  const getTransitionClasses = () => {
    const baseClasses = `transition-all duration-${duration} ease-in-out`;
    
    switch (type) {
      case 'fade':
        return clsx(
          baseClasses,
          show && !isAnimating ? 'opacity-100' : 'opacity-0'
        );
      
      case 'slide':
        return clsx(
          baseClasses,
          show && !isAnimating 
            ? 'transform translate-y-0 opacity-100' 
            : 'transform -translate-y-4 opacity-0'
        );
      
      case 'scale':
        return clsx(
          baseClasses,
          show && !isAnimating 
            ? 'transform scale-100 opacity-100' 
            : 'transform scale-95 opacity-0'
        );
      
      default:
        return baseClasses;
    }
  };

  return (
    <div className={clsx(getTransitionClasses(), className)}>
      {children}
    </div>
  );
};

// Preset transition components
export const FadeTransition: React.FC<Omit<TransitionProps, 'type'>> = (props) => (
  <Transition {...props} type="fade" />
);

export const SlideTransition: React.FC<Omit<TransitionProps, 'type'>> = (props) => (
  <Transition {...props} type="slide" />
);

export const ScaleTransition: React.FC<Omit<TransitionProps, 'type'>> = (props) => (
  <Transition {...props} type="scale" />
);

export default Transition;