import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Hero } from '@/components/home/hero';
import { Features } from '@/components/home/features';
import { HowItWorks } from '@/components/home/how-it-works';
import { DashboardPreview } from '@/components/home/dashboard-preview';
import { AiAdvisor } from '@/components/home/ai-advisor';
import { StudentMode } from '@/components/home/student-mode';
import { MarketNews } from '@/components/home/market-news';

// Re-render at most every 15 minutes so the headlines stay fresh
export const revalidate = 900;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <Features />
        <DashboardPreview />
        <HowItWorks />
        <AiAdvisor />
        <StudentMode />
        <MarketNews />
      </main>
      
      <Footer />
    </div>
  );
}

