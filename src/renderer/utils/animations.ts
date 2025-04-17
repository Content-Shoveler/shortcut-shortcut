import { Variants } from 'framer-motion';

// Animation variants for page transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.4,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
};

// Animation variants for items in a list (with staggered entrance)
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 12,
      delay: custom * 0.1,
    },
  }),
  hover: {
    scale: 1.02,
    boxShadow: '0 5px 15px rgba(0, 255, 255, 0.15)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10,
    },
  },
};

// Animation variants for containers of multiple items
export const containerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Animation variants for dialog/modal components
export const dialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -50,
    transition: {
      duration: 0.2,
    },
  },
};

// Animation variants for buttons
export const buttonVariants: Variants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
  tap: {
    scale: 0.95,
  },
};

// Animation for data scanning effect
export const scanAnimationVariants: Variants = {
  initial: {
    opacity: 0,
    height: '0%',
  },
  animate: {
    opacity: [0, 0.8, 0],
    height: '100%',
    transition: {
      opacity: { repeat: Infinity, duration: 1.5 },
      height: { duration: 1.5, repeat: Infinity },
    },
  },
};

// Animation for glitch text effect
export const glitchTextVariants: Variants = {
  initial: {
    textShadow: '0 0 0 rgba(0, 255, 255, 0)',
  },
  animate: {
    textShadow: [
      '0 0 0 rgba(0, 255, 255, 0)',
      '-2px 0 rgba(255, 0, 255, 0.5), 2px 2px rgba(0, 255, 255, 0.5)',
      '2px -2px rgba(0, 255, 255, 0.5), -2px -2px rgba(255, 0, 255, 0.5)',
      '0 0 0 rgba(0, 255, 255, 0)',
    ],
    x: ['0%', '-0.5%', '0.5%', '0%'],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: 'mirror',
      repeatDelay: 5,
    },
  },
};

// Cyberpunk card hover effect
export const cardHoverVariants: Variants = {
  initial: {
    boxShadow: '0px 0px 0px rgba(0, 255, 255, 0)',
  },
  hover: {
    boxShadow: '0px 0px 15px rgba(0, 255, 255, 0.3)',
    y: -5,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
};

// Data flow animation for borders
export const borderFlowVariants: Variants = {
  initial: {
    backgroundPosition: '0% 0%',
  },
  animate: {
    backgroundPosition: '100% 100%',
    transition: {
      repeat: Infinity,
      duration: 3,
      ease: 'linear',
    },
  },
};
