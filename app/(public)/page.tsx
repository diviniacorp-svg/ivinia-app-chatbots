import Hero from '@/components/public/Hero'
import ProblemSolution from '@/components/public/ProblemSolution'
import RubrosGrid from '@/components/public/RubrosGrid'
import HowItWorks from '@/components/public/HowItWorks'
import PricingCards from '@/components/public/PricingCards'
import ChatbotDemo from '@/components/public/ChatbotDemo'
import FAQ from '@/components/public/FAQ'
import TrialCTA from '@/components/public/TrialCTA'
import Footer from '@/components/public/Footer'
import Navbar from '@/components/public/Navbar'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ProblemSolution />
      <RubrosGrid />
      <HowItWorks />
      <ChatbotDemo />
      <PricingCards />
      <FAQ />
      <TrialCTA />
      <Footer />
    </main>
  )
}
