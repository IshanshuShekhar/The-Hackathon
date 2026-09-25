import Link from 'next/link'
import { Logo } from '@/components/logo'

const columns = [
  {
    heading: 'Platform',
    links: [
      { label: 'About', href: '#home' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Applicant', href: '#features' },
      { label: 'Consultant', href: '#contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '#contact' },
      { label: 'Terms', href: '#contact' },
      { label: 'Contact', href: '#contact' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Your intelligent Germany applicant journey — from first
              introduction to your next best action.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-2 lg:justify-items-end">
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                  {col.heading}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EduRoute AI. Prototype for ImpactX&apos;26
            Agentic AI Track.
          </p>
          <p className="max-w-md text-xs text-muted-foreground/80">
            EduRoute AI is a prototype and is not an official German government
            service.
          </p>
        </div>
      </div>
    </footer>
  )
}
