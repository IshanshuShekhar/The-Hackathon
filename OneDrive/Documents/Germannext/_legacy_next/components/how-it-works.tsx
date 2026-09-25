import { UserSearch, ShieldCheck, GraduationCap, Compass } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { CtaButton } from '@/components/cta-button'
import { ArrowRight } from 'lucide-react'

const stages = [
  {
    no: '01',
    icon: UserSearch,
    title: 'Tell us about yourself',
    desc: 'Share your background through a short introduction — no long forms.',
  },
  {
    no: '02',
    icon: ShieldCheck,
    title: 'Build your evidence-backed profile',
    desc: 'AI structures your profile and links each detail to a real document.',
  },
  {
    no: '03',
    icon: GraduationCap,
    title: 'Understand your qualification',
    desc: 'See how your profile maps to prototype readiness criteria.',
  },
  {
    no: '04',
    icon: Compass,
    title: 'Take your next best action',
    desc: 'Get one clear, prioritized step to move your journey forward.',
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative bg-background py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              How it works
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl">
              From your first introduction to your next step.
            </h2>
          </Reveal>
        </div>

        <div className="relative mt-16">
          {/* connecting line */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
          />
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {stages.map((s, i) => (
              <Reveal key={s.no} delay={i * 0.1}>
                <div className="relative">
                  <div className="flex items-center gap-4 lg:block">
                    <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card text-brand shadow-sm">
                      <s.icon className="h-6 w-6" />
                    </span>
                    <span className="font-display text-4xl font-semibold text-border lg:mt-6 lg:block">
                      {s.no}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-border bg-secondary/50 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Ready to map your path to Germany?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start with a short introduction — AI takes it from there.
              </p>
            </div>
            <CtaButton href="#home" variant="primary" size="lg">
              Start My Journey
              <ArrowRight className="h-4 w-4" />
            </CtaButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
