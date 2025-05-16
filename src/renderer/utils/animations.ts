import { Variants, TargetAndTransition } from 'framer-motion';

// NASA/Space-themed page transitions 
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

// Animation for neon sign flashing effect
export const neonSignVariants: Variants = {
  initial: (customData: { i: number; isDarkMode: boolean }) => {
    const { i, isDarkMode } = customData || { i: 0, isDarkMode: true };
    return {
      color: isDarkMode ? '#00FFFF' : '#0B3D91', // Cyan for dark, NASA blue for light
      textShadow: isDarkMode 
        ? '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5), 0 0 15px rgba(0, 255, 255, 0.3)'
        : '0 0 1px rgba(11, 61, 145, 0.7), 0 0 2px rgba(11, 61, 145, 0.5)', // Subtle shadow for light mode
      opacity: 1,
    };
  },
  animate: (customData: { i: number; isDarkMode: boolean }) => {
    const { i, isDarkMode } = customData || { i: 0, isDarkMode: true };
    return {
      // Always on and bright - the default state
      color: isDarkMode ? '#00FFFF' : '#0B3D91', // Cyan for dark, NASA blue for light
      textShadow: isDarkMode 
        ? '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5), 0 0 15px rgba(0, 255, 255, 0.3)'
        : '0 0 1px rgba(11, 61, 145, 0.7), 0 0 2px rgba(11, 61, 145, 0.5)', // Subtle shadow for light mode
      opacity: 1,
      transition: {
        duration: 0.1,
        repeat: Infinity,
        repeatType: "loop",
        // Give each letter a very long delay to ensure it stays "on" most of the time
        repeatDelay: getRandomFlickerDelay(i),
      },
    };
  },
  flicker: (customData: { i: number; isDarkMode: boolean }) => {
    const { i, isDarkMode } = customData || { i: 0, isDarkMode: true };
    // Determine if this letter should be prone to flickering based on its position
    // Letters at certain positions are more likely to flicker (like real faulty neon signs)
    const isFlickerProne = i === 1 || i === 8 || i === 15 || i === 17 || i === 21;
    const flickerFrequency = isFlickerProne ? 3 : 10; // Lower number = more frequent flickers
    
    return {
      // Momentary off state that happens infrequently
      color: isDarkMode ? '#5F9EA0' : '#5F9EA0', // Use cadet blue for both themes when flickering
      textShadow: 'none',
      opacity: [1, isDarkMode ? 0.3 : 0.6, 1], // Adjust opacity ranges for light mode
      transition: {
        duration: 0.15,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay: flickerFrequency + (i % 5),
        times: [0, 0.5, 1],
        ease: "easeInOut",
      }
    };
  }
};

// Helper function to get random delays between flickering for each letter
// This creates more natural "faulty neon" behavior
function getRandomFlickerDelay(index: number): number {
  // Create a seed based on letter position that gives consistent but varied results
  const seed = (index * 7) % 23;
  
  // Very long base delay - we want the letters to be "on" most of the time
  const baseDelay = 20;
  
  // Add variable component based on letter position
  const variableDelay = seed + ((index % 5) * 3);
  
  return baseDelay + variableDelay;
}

// Enhanced cyberpunk card hover effect with space accents
export const cardHoverVariants: Variants = {
  initial: {
    boxShadow: '0px 0px 0px rgba(0, 255, 255, 0)',
    borderImage: 'linear-gradient(to right, transparent, rgba(95, 158, 160, 0.2), transparent) 1',
  },
  hover: {
    boxShadow: '0px 0px 15px rgba(0, 255, 255, 0.3)',
    y: -5,
    borderImage: 'linear-gradient(to right, transparent, rgba(0, 255, 255, 0.6), transparent) 1',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
};

// NASA terminal radar scanning effect
export const radarScanVariants: Variants = {
  initial: {
    opacity: 0,
    rotate: 0,
  },
  animate: {
    opacity: [0, 0.7, 0],
    rotate: 360,
    transition: {
      opacity: { repeat: Infinity, duration: 3, ease: "easeInOut" },
      rotate: { repeat: Infinity, duration: 3, ease: "linear" },
    },
  },
};

// Space object orbit animation
export const orbitVariants: Variants = {
  initial: {
    rotate: 0,
    scale: 1,
  },
  animate: {
    rotate: 360,
    scale: [1, 1.05, 1],
    transition: {
      rotate: { 
        repeat: Infinity, 
        duration: 20, 
        ease: "linear" 
      },
      scale: { 
        repeat: Infinity, 
        duration: 5, 
        ease: "easeInOut" 
      },
    },
  },
};

// Star field parallax effect
export const starFieldVariants: Variants = {
  initial: {
    backgroundPosition: '0% 0%',
    opacity: 0.5,
  },
  animate: {
    backgroundPosition: ['0% 0%', '100% 100%'],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      backgroundPosition: {
        repeat: Infinity,
        duration: 30,
        ease: "linear",
      },
      opacity: {
        repeat: Infinity,
        duration: 8,
        ease: "easeInOut",
      }
    },
  },
};

// Retro NASA computer booting animation
export const retroBootSequenceVariants: Variants = {
  initial: {
    height: '0%',
    opacity: 0,
  },
  animate: {
    height: '100%',
    opacity: 1,
    transition: {
      height: { duration: 1, ease: "steps(20)" },
      opacity: { duration: 0.3 },
    },
  },
  exit: {
    height: '0%',
    opacity: 0,
    transition: {
      height: { duration: 0.5, ease: "easeInOut" },
      opacity: { duration: 0.2 },
    },
  }
};

// Enhanced data flow animation for borders with space-themed glow
export const borderFlowVariants: Variants = {
  initial: {
    backgroundPosition: '0% 0%',
    boxShadow: '0 0 0 rgba(0, 255, 255, 0)',
  },
  animate: {
    backgroundPosition: '100% 100%',
    boxShadow: ['0 0 0 rgba(0, 255, 255, 0)', '0 0 10px rgba(0, 255, 255, 0.3)', '0 0 0 rgba(0, 255, 255, 0)'],
    transition: {
      backgroundPosition: {
        repeat: Infinity,
        duration: 3,
        ease: 'linear',
      },
      boxShadow: {
        repeat: Infinity,
        duration: 5,
        ease: 'easeInOut',
      }
    },
  },
};

// NASA console status animation
export const statusBlinkVariants: Variants = {
  initial: {
    opacity: 0.7,
  },
  animate: {
    opacity: [0.7, 1, 0.7],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut",
      repeatType: "mirror"
    }
  },
  warning: {
    opacity: [0.7, 1, 0.7],
    color: ['#FF9500', '#FFCE00', '#FF9500'],
    transition: {
      repeat: Infinity,
      duration: 0.8,
      ease: "easeOut"
    }
  },
  error: {
    opacity: [0.7, 1, 0.7],
    color: ['#FF3E3E', '#FF6B6B', '#FF3E3E'],
    transition: {
      repeat: Infinity,
      duration: 0.5,
      ease: "easeOut"
    }
  }
};
