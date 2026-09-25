/**
 * Centralized image configuration.
 * Swap any src here to update imagery across the whole app.
 */
export const images = {
  hero: {
    src: '/images/germany-hero.png',
    alt: 'A student walking through a modern German university campus at golden hour',
  },
  heroVideo: '/images/1790019066-38c49f00.mp4',
} as const

export type ImageKey = keyof typeof images
