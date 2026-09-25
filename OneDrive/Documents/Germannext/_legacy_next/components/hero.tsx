'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowRight, Check } from 'lucide-react'
import { images } from '@/lib/images'
import { CtaButton } from '@/components/cta-button'

const highlights = [
  'AI-guided profile',
  'Document intelligence',
  'Evidence-based qualification',
]

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
}

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[88vh] items-center overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={images.hero.src}
          alt={images.hero.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={images.hero.src}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          aria-label={images.hero.alt}
        >
          <source src={images.heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/65 to-primary/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 pt-28 pb-16 lg:grid-cols-12 lg:pt-24">
        {/* Copy */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="lg:col-span-7"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-strong" />
            AI-Powered Germany Applicant Journey
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-5xl font-semibold leading-[1.03] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            Your Pathway to
            <br />
            Germany Starts Here.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg font-medium text-white/85"
          >
            One intelligent journey for studying, training, or building your
            career in Germany.
          </motion.p>

          <motion.p
            variants={item}
            className="mt-4 max-w-xl text-base leading-relaxed text-white/70"
          >
            Build your profile, understand your requirements, verify your
            documents, and discover your next best step — with AI guiding you
            throughout the journey.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <CtaButton href="#how-it-works" variant="light" size="lg">
              Start My Journey
              <ArrowRight className="h-4 w-4" />
            </CtaButton>
            <CtaButton
              href="#how-it-works"
              size="lg"
              className="border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            >
              See How It Works
            </CtaButton>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3"
          >
            {highlights.map((h) => (
              <li
                key={h}
                className="flex items-center gap-2 text-sm font-medium text-white/85"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  <Check className="h-3 w-3 text-white" />
                </span>
                {h}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Floating journey card */}
        <div className="lg:col-span-5">
          <JourneyCard />
        </div>
      </div>
    </section>
  )
}

function JourneyCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto w-full max-w-sm rounded-2xl border border-white/40 bg-white/95 p-6 shadow-2xl shadow-primary/30 backdrop-blur-xl lg:ml-auto"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your Germany Journey
        </span>
        <span className="h-2 w-2 rounded-full bg-accent-strong" />
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Profile completeness
          </span>
          <span className="font-display text-3xl font-semibold text-foreground">
            82%
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '82%' }}
            transition={{ duration: 1.1, delay: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full bg-brand"
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-secondary/60 p-4">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Next best action
        </span>
        <p className="mt-1.5 text-sm font-medium text-foreground">
          Upload your German language certificate
        </p>
        <CtaButton
          href="#how-it-works"
          variant="primary"
          size="md"
          className="mt-4 w-full"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </CtaButton>
      </div>
    </motion.div>
  )
}