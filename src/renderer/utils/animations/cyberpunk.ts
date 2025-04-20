import { animation } from '../../theme/cyberpunkTokens';

/**
 * Cyberpunk Animation Variants
 * 
 * This file contains reusable animation variants for the cyberpunk design system.
 * These variants can be used with framer-motion to create consistent animations.
 */

/**
 * Data flow animation variants
 * Creates a flowing gradient effect that moves across the element
 */
export const dataFlowVariants = {
  initial: {
    opacity: 0,
    x: '-100%',
  },
  animate: {
    opacity: 0.2,
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: animation.dataFlow.medium,
      ease: 'linear',
    }
  },
  // Vertical variant (top to bottom)
  initialVertical: {
    opacity: 0,
    y: '-100%',
  },
  animateVertical: {
    opacity: 0.2,
    y: '100%',
    transition: {
      repeat: Infinity,
      duration: animation.dataFlow.medium,
      ease: 'linear',
    }
  }
};

/**
 * Glow pulse animation variants
 * Creates a pulsing glow effect
 */
export const glowPulseVariants = {
  initial: {
    boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
  },
  pulse: {
    boxShadow: '0 0 15px rgba(0, 255, 255, 0.7)',
    transition: {
      repeat: Infinity,
      repeatType: 'reverse',
      duration: animation.pulse.medium,
      ease: 'easeInOut',
    }
  }
};

/**
 * Scanline animation variants
 * Creates a moving scanline effect
 */
export const scanlineVariants = {
  initial: {
    backgroundPosition: '0px 0px',
  },
  animate: {
    backgroundPosition: ['0px 0px', '0px -20px'],
    transition: {
      repeat: Infinity,
      duration: animation.scanline.medium,
      ease: 'linear',
    }
  },
  // Horizontal variant
  animateHorizontal: {
    backgroundPosition: ['0px 0px', '-20px 0px'],
    transition: {
      repeat: Infinity,
      duration: animation.scanline.medium,
      ease: 'linear',
    }
  }
};

/**
 * Button interaction animation variants
 */
export const buttonVariants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    }
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    }
  }
};

/**
 * Card hover animation variants
 */
export const cardHoverVariants = {
  initial: {
    scale: 1,
    boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    }
  }
};

/**
 * Dialog animation variants
 */
export const dialogVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
    }
  }
};

/**
 * List container animation variants
 * For animating a container with items
 */
export const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      when: 'beforeChildren',
    }
  }
};

/**
 * List item animation variants
 * For items within an animated container
 */
export const listItemVariants = {
  hidden: (custom: number) => ({
    opacity: 0,
    y: 10,
    transition: {
      delay: custom * 0.05,
    }
  }),
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.05,
      type: 'spring',
      stiffness: 400,
      damping: 20,
    }
  })
};

/**
 * Neon sign flicker animation variants
 */
export const neonSignVariants = {
  initial: {
    opacity: 1,
    textShadow: '0 0 0px rgba(0, 0, 0, 0)',
  },
  animate: {
    opacity: 1,
    color: ({ isDarkMode }: { isDarkMode: boolean, i: number }) => 
      isDarkMode ? '#00FFFF' : '#0088aa',
    textShadow: ({ isDarkMode }: { isDarkMode: boolean, i: number }) => 
      isDarkMode 
        ? '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255,.5), 0 0 15px rgba(0, 255, 255, 0.3)'
        : '0 0 3px rgba(0, 136, 170, 0.5), 0 0 6px rgba(0, 136, 170, 0.3)',
    transition: {
      duration: 0.5,
    }
  },
  flicker: ({ i }: { isDarkMode: boolean, i: number }) => ({
    opacity: [1, 0.85, 1, 0.9, 1],
    transition: {
      delay: i * 0.1,
      repeat: Infinity,
      repeatType: 'mirror',
      duration: 2 + Math.random() * 2,
      ease: 'easeInOut',
      times: [0, 0.2, 0.3, 0.45, 1],
    }
  })
};

/**
 * Cyber loading spinner animation
 */
export const spinnerVariants = {
  rotate: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    }
  }
};

// Export a consolidated object of all animation variants
export const cyberAnimations = {
  dataFlow: dataFlowVariants,
  glowPulse: glowPulseVariants,
  scanline: scanlineVariants,
  button: buttonVariants,
  card: cardHoverVariants,
  dialog: dialogVariants,
  container: containerVariants,
  listItem: listItemVariants,
  neonSign: neonSignVariants,
  spinner: spinnerVariants,
};
