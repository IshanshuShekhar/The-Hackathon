import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { TrustStrip } from '@/components/trust-strip'
import { HowItWorks } from '@/components/how-it-works'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <TrustStrip />
        <HowItWorks />
      </main>
      <SiteFooter />
    </div>
  )
}
