import { Variants } from 'framer-motion';

/**
 * Animation variants for theme toggle button
 */
export const themeToggleVariants: Variants = {
  initial: {
    rotate: 0,
    scale: 1,
  },
  // Dark mode animation (moon)
  dark: {
    rotate: [0, -10, 0],
    scale: [1, 1.1, 1],
    transition: {
      rotate: {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 5,
        ease: 'easeInOut',
      },
      scale: {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 3,
        ease: 'easeInOut',
      },
    },
  },
  // Light mode animation (sun)
  light: {
    rotate: [0, 180, 360],
    scale: [1, 1.05, 1],
    transition: {
      rotate: {
        repeat: Infinity,
        duration: 20,
        ease: 'linear',
      },
      scale: {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 2,
        ease: 'easeInOut',
      },
    },
  },
  // System mode animation (computer)
  system: {
    rotate: [0, 0, 0],
    scale: [1, 1.05, 1],
    y: [0, -1, 0],
    transition: {
      scale: {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 2,
        ease: 'easeInOut',
      },
      y: {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
  },
  // Click animation
  click: {
    scale: 0.9,
    rotate: [0, 15],
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

/**
 * Animation variants for view mode toggle button
 */
export const viewModeToggleVariants: Variants = {
  initial: {
    scale: 1,
  },
  // Card view animation
  card: {
    scale: [1, 1.05, 1],
    rotate: [0, 0, 0],
    transition: {
      scale: {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 2,
        ease: 'easeInOut',
      },
    },
  },
  // List view animation
  list: {
    scale: [1, 1.05, 1],
    y: [0, -1, 0],
    transition: {
      scale: {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 2,
        ease: 'easeInOut',
      },
      y: {
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 1.5,
        ease: 'easeInOut',
        delay: 0.5,
      },
    },
  },
  // Hover animation
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  // Click animation
  click: {
    scale: 0.9,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

/**
 * Button glow animation variants
 */
export const buttonGlowVariants: Variants = {
  initial: {
    boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
  },
  dark: {
    boxShadow: '0 0 15px rgba(25, 118, 210, 0.7)',
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
  light: {
    boxShadow: '0 0 15px rgba(255, 167, 38, 0.7)',
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
  system: {
    boxShadow: '0 0 15px rgba(0, 200, 83, 0.7)',
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
  card: {
    boxShadow: '0 0 15px rgba(0, 176, 255, 0.7)',
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
  list: {
    boxShadow: '0 0 15px rgba(156, 39, 176, 0.7)',
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
};
