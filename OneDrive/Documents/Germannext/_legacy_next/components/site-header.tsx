'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { CtaButton } from '@/components/cta-button'

const topLinks = [
  { label: 'Germany Journey', href: '#home' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'For Applicants', href: '#features' },
  { label: 'For Consultants', href: '#contact' },
]

const mainNav = [
  { label: 'Home', href: '#home' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Your Journey', href: '#how-it-works' },
  { label: 'Documents', href: '#features' },
  { label: 'Qualification', href: '#features' },
  { label: 'Consultant Support', href: '#contact' },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/70 bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-background/40 backdrop-blur-sm',
      )}
    >
      {/* Top bar */}
      <div className="hidden border-b border-border/50 lg:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-6">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">
            AI-guided pathways for study, training &amp; careers in Germany
          </p>
          <nav className="flex items-center gap-6">
            {topLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main bar */}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="#home" aria-label="EduRoute AI home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <CtaButton href="#home" variant="ghost" size="md">
            Sign In
          </CtaButton>
          <CtaButton href="#how-it-works" variant="primary" size="md">
            Start My Journey
          </CtaButton>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {mainNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <CtaButton
                href="#home"
                variant="outline"
                size="md"
                onClick={() => setOpen(false)}
              >
                Sign In
              </CtaButton>
              <CtaButton
                href="#how-it-works"
                variant="primary"
                size="md"
                onClick={() => setOpen(false)}
              >
                Start My Journey
              </CtaButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
