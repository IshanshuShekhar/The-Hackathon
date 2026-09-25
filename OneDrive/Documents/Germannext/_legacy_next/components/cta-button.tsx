import Link from 'next/link'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'light' | 'outline' | 'ghost'
type Size = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-brand-foreground shadow-sm hover:bg-brand/90 hover:shadow-md',
  light:
    'bg-white text-primary shadow-sm hover:bg-white/90 hover:shadow-md',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-secondary',
  ghost: 'text-foreground hover:bg-secondary',
}

const sizes: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
}

type CtaButtonProps = {
  variant?: Variant
  size?: Size
} & (
  | ({ href: string } & Omit<ComponentProps<typeof Link>, 'href'>)
  | ({ href?: undefined } & ComponentProps<'button'>)
)

export function CtaButton({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: CtaButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if (props.href) {
    const { href, ...rest } = props as { href: string } & Omit<
      ComponentProps<typeof Link>,
      'href'
    >
    return (
      <Link href={href} className={classes} {...rest}>
        {rest.children}
      </Link>
    )
  }

  const { children, ...rest } = props as ComponentProps<'button'>
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
