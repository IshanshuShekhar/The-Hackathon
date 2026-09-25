import { Sparkles, ScanLine, ShieldCheck, Compass } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const items = [
  {
    icon: Sparkles,
    title: 'AI Profile Building',
    desc: 'Turn your story into a structured, evidence-backed profile.',
  },
  {
    icon: ScanLine,
    title: 'Document Intelligence',
    desc: 'Upload documents and let AI extract the details that matter.',
  },
  {
    icon: ShieldCheck,
    title: 'Evidence Tracking',
    desc: 'Every claim is linked to a verifiable source.',
  },
  {
    icon: Compass,
    title: 'Qualification Guidance',
    desc: 'Always know where you stand and what comes next.',
  },
]

export function TrustStrip() {
  return (
    <section id="features" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            One journey. Less manual work.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 0.08}>
              <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lg hover:shadow-primary/5">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                  <it.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {it.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {it.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
